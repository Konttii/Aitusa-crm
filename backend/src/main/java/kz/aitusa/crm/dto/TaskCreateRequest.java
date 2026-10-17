package kz.aitusa.crm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCreateRequest {

    @NotBlank(message = "Укажите название")
    @Size(min = 1, max = 255, message = "Название должно содержать от 1 до 255 символов")
    private String name;

    @Size(max = 20000, message = "Описание слишком длинное")
    private String description;

    @JsonAlias({"assigned_to", "assignedTo"})
    private UUID assignedTo;

    @Positive(message = "Выберите комитет")
    @JsonAlias({"committee_id", "committeeId"})
    private Integer committeeId;

    private String deadline;

    public OffsetDateTime parsedDeadline() {
        return DeadlineParser.parseToUtc(deadline);
    }
}
