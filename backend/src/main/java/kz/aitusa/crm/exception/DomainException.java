package kz.aitusa.crm.exception;

import lombok.Getter;

@Getter
public class DomainException extends RuntimeException {

    private final int status;

    public DomainException(int status, String message) {
        super(message);
        this.status = status;
    }
}
