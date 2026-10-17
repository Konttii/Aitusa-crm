package kz.aitusa.crm.security;

import jakarta.servlet.http.HttpServletRequest;
import kz.aitusa.crm.exception.DomainException;
import kz.aitusa.crm.service.AccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
public class ActorArgumentResolver implements HandlerMethodArgumentResolver {

    private final TelegramInitDataValidator validator;
    private final AccessService accessService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentActor.class)
                && ActorContext.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            @NonNull MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            @NonNull NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        String authHeader = request != null ? request.getHeader(HttpHeaders.AUTHORIZATION) : null;
        long telegramId;
        try {
            telegramId = validator.validateHeader(authHeader);
        } catch (IllegalArgumentException e) {
            throw new DomainException(401, "Откройте приложение через Telegram");
        }
        return accessService.resolveActor(telegramId);
    }
}
