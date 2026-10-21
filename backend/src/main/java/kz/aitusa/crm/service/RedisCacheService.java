package kz.aitusa.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import kz.aitusa.crm.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final ObjectMapper objectMapper;
    private final AppProperties properties;

    private final Map<String, CacheEntry> memoryFallback = new ConcurrentHashMap<>();

    private record CacheEntry(long expiresAtNanos, String payload) {
        boolean isExpired() {
            return System.nanoTime() >= expiresAtNanos;
        }
    }

    public String fullKey(String key) {
        String prefix = properties.getCachePrefix();
        return key.startsWith(prefix + ":") ? key : prefix + ":" + key;
    }

    public <T> T getOrCompute(String key, TypeReference<T> typeRef, int ttlSeconds, Supplier<T> supplier) {
        T cached = get(key, typeRef);
        if (cached != null) {
            return cached;
        }
        T computed = supplier.get();
        if (computed != null) {
            set(key, computed, ttlSeconds);
        }
        return computed;
    }

    public <T> T get(String key, TypeReference<T> typeRef) {
        String full = fullKey(key);
        StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
        if (redis != null) {
            try {
                String raw = redis.opsForValue().get(full);
                if (raw != null) {
                    return objectMapper.readValue(raw, typeRef);
                }
            } catch (Exception e) {
                log.debug("Redis GET fallback for key {}: {}", full, e.getMessage());
            }
        }
        CacheEntry entry = memoryFallback.get(full);
        if (entry != null) {
            if (!entry.isExpired()) {
                try {
                    return objectMapper.readValue(entry.payload(), typeRef);
                } catch (Exception e) {
                    memoryFallback.remove(full);
                }
            } else {
                memoryFallback.remove(full);
            }
        }
        return null;
    }

    public void set(String key, Object value, int ttlSeconds) {
        String full = fullKey(key);
        String raw;
        try {
            raw = objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.debug("Failed to serialize cache key {}", full, e);
            return;
        }
        long expiresAt = System.nanoTime() + Duration.ofSeconds(ttlSeconds).toNanos();
        memoryFallback.put(full, new CacheEntry(expiresAt, raw));

        StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
        if (redis != null) {
            try {
                redis.opsForValue().set(full, raw, Duration.ofSeconds(ttlSeconds));
            } catch (Exception e) {
                log.debug("Redis SET fallback for key {}: {}", full, e.getMessage());
            }
        }
    }

    public void invalidateTasksCache(Integer committeeId, Collection<Long> telegramIds) {
        List<String> prefixes = new ArrayList<>();
        prefixes.add(fullKey("tasks:list:"));
        if (committeeId != null) {
            prefixes.add(fullKey("tasks:list:"));
        }
        if (telegramIds != null) {
            for (Long tgId : telegramIds) {
                if (tgId != null) {
                    prefixes.add(fullKey("tasks:list:u:" + tgId + ":"));
                }
            }
        }

        memoryFallback.keySet().removeIf(k -> prefixes.stream().anyMatch(k::startsWith));

        StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
        if (redis != null) {
            try {
                Set<String> keys = redis.keys(fullKey("tasks:list:*"));
                if (keys != null && !keys.isEmpty()) {
                    redis.delete(keys);
                }
            } catch (Exception e) {
                log.debug("Redis cache invalidation skipped: {}", e.getMessage());
            }
        }
    }

    public void clearAll() {
        memoryFallback.clear();
        StringRedisTemplate redis = redisTemplateProvider.getIfAvailable();
        if (redis != null) {
            try {
                Set<String> keys = redis.keys(fullKey("*"));
                if (keys != null && !keys.isEmpty()) {
                    redis.delete(keys);
                }
            } catch (Exception e) {
                log.debug("Redis clearAll skipped: {}", e.getMessage());
            }
        }
    }
}
