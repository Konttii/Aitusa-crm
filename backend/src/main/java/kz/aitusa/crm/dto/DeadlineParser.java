package kz.aitusa.crm.dto;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

public final class DeadlineParser {

    private static final ZoneOffset ORG_OFFSET = ZoneOffset.ofHours(5);

    private DeadlineParser() {
    }

    public static OffsetDateTime parseToUtc(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String value = raw.trim();
        try {
            return OffsetDateTime.parse(value).withOffsetSameInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
            LocalDateTime local = LocalDateTime.parse(value);
            return local.atOffset(ORG_OFFSET).withOffsetSameInstant(ZoneOffset.UTC);
        }
    }
}
