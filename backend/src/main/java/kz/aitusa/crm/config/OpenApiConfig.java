package kz.aitusa.crm.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI aitusaCrmOpenAPI() {
        String schemeName = "TelegramMiniAppAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("AITUSA CRM — Task Management API")
                        .version("1.0.0")
                        .description("Spring Boot REST API for the AITUSA Student Government Task CRM Telegram Mini App")
                        .contact(new Contact().name("Konttii").email("kuandyk0820@gmail.com")))
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName, new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .description("Telegram WebApp initData (`tma <initData>`) or local demo token (`tma demo:100000001`)")));
    }
}
