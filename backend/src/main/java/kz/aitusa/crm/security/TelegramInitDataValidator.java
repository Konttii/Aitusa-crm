package kz.aitusa.crm.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kz.aitusa.crm.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TelegramInitDataValidator {

    private static final long DEFAULT_DEMO_TELEGRAM_ID = 100000001L;

    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    public long validateHeader(String authorization) {
        if (authorization == null || !authorization.startsWith("tma ")) {
            if (properties.isDemoMode()) {
                return DEFAULT_DEMO_TELEGRAM_ID;
            }
            throw new IllegalArgumentException("Missing authorization");
        }
        String raw = authorization.substring(4).trim();
        if (raw.isEmpty()) {
            if (properties.isDemoMode()) {
                return DEFAULT_DEMO_TELEGRAM_ID;
            }
            throw new IllegalArgumentException("Empty authorization");
        }
        if (properties.isDemoMode() && raw.startsWith("demo:")) {
            try {
                long demoId = Long.parseLong(raw.substring(5).trim());
                if (demoId > 0) {
                    return demoId;
                }
            } catch (NumberFormatException ignored) {
                throw new IllegalArgumentException("Invalid demo user id");
            }
        }
        return validateInitData(raw, properties.getBotToken(), properties.getInitDataTtl(), Instant.now().getEpochSecond());
    }

    public long validateInitData(String raw, String botToken, int ttlSeconds, long nowEpochSeconds) {
        if (botToken == null || botToken.isBlank() || raw == null || raw.length() > 8192) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        Map<String, String> data = new TreeMap<>();
        String[] pairs = raw.split("&");
        for (String pair : pairs) {
            if (pair.isEmpty()) {
                continue;
            }
            int idx = pair.indexOf('=');
            String key = idx >= 0
                    ? URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8)
                    : URLDecoder.decode(pair, StandardCharsets.UTF_8);
            String value = idx >= 0
                    ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
                    : "";
            if (data.put(key, value) != null) {
                throw new IllegalArgumentException("Duplicate fields");
            }
        }

        String suppliedHash = data.remove("hash");
        if (suppliedHash == null || suppliedHash.isEmpty()) {
            throw new IllegalArgumentException("Missing signature");
        }

        String dataCheckString = data.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("\n"));

        byte[] secretKey = hmacSha256("WebAppData".getBytes(StandardCharsets.UTF_8), botToken.getBytes(StandardCharsets.UTF_8));
        String expectedHash = HexFormat.of().formatHex(
                hmacSha256(secretKey, dataCheckString.getBytes(StandardCharsets.UTF_8))
        );

        if (!MessageDigest.isEqual(
                suppliedHash.getBytes(StandardCharsets.UTF_8),
                expectedHash.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid signature");
        }

        String authDateStr = data.get("auth_date");
        if (authDateStr == null) {
            throw new IllegalArgumentException("Missing auth_date");
        }
        long authDate = Long.parseLong(authDateStr);
        long age = nowEpochSeconds - authDate;
        if (age < 0 || age > ttlSeconds) {
            throw new IllegalArgumentException("Expired authentication");
        }

        String userJson = data.get("user");
        if (userJson == null) {
            throw new IllegalArgumentException("Missing user payload");
        }

        try {
            JsonNode userNode = objectMapper.readTree(userJson);
            JsonNode idNode = userNode.get("id");
            if (idNode == null || !idNode.isIntegralNumber() || idNode.asLong() <= 0) {
                throw new IllegalArgumentException("Invalid user");
            }
            return idNode.asLong();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid user JSON", e);
        }
    }

    private static byte[] hmacSha256(byte[] key, byte[] message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(message);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256", e);
        }
    }
}
