package kz.aitusa.crm.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class TaskUpdateRequest {

    @Size(min = 1, max = 255, message = "Название должно содержать от 1 до 255 символов")
    private String name;

    @Size(max = 20000, message = "Описание слишком длинное")
    private String description;

    private UUID assignedTo;
    private String deadline;

    @JsonIgnore
    private boolean namePresent;

    @JsonIgnore
    private boolean descriptionPresent;

    @JsonIgnore
    private boolean assignedToPresent;

    @JsonIgnore
    private boolean deadlinePresent;

    @JsonSetter("name")
    public void setName(String name) {
        this.name = name;
        this.namePresent = true;
    }

    @JsonSetter("description")
    public void setDescription(String description) {
        this.description = description;
        this.descriptionPresent = true;
    }

    @JsonSetter("assignedTo")
    public void setAssignedTo(UUID assignedTo) {
        this.assignedTo = assignedTo;
        this.assignedToPresent = true;
    }

    @JsonSetter("assigned_to")
    public void setAssignedToSnake(UUID assignedTo) {
        this.assignedTo = assignedTo;
        this.assignedToPresent = true;
    }

    @JsonSetter("deadline")
    public void setDeadline(String deadline) {
        this.deadline = deadline;
        this.deadlinePresent = true;
    }

    public OffsetDateTime parsedDeadline() {
        return DeadlineParser.parseToUtc(deadline);
    }
}
