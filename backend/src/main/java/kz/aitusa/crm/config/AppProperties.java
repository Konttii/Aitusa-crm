package kz.aitusa.crm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String environment = "local";
    private boolean demoMode = true;
    private String botToken = "";
    private String adminIds = "100000001";
    private int initDataTtl = 3600;
    private String cachePrefix = "aitusa";
    private int authCacheTtl = 600;
    private int crmCacheTtl = 300;
    private String webDistDir = "/app/web";

    public Set<Long> getBootstrapAdminIds() {
        if (adminIds == null || adminIds.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(adminIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && s.chars().allMatch(Character::isDigit))
                .map(Long::parseLong)
                .filter(id -> id > 0)
                .collect(Collectors.toUnmodifiableSet());
    }
}
