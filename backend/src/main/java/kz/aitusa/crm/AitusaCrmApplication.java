package kz.aitusa.crm;

import kz.aitusa.crm.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class AitusaCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(AitusaCrmApplication.class, args);
    }
}
