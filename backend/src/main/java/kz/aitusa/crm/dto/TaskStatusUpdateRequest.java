package kz.aitusa.crm.dto;

import jakarta.validation.constraints.NotNull;
import kz.aitusa.crm.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateRequest {

    @NotNull(message = "Выберите допустимый статус.")
    private TaskStatus status;
}
