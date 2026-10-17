package kz.aitusa.crm.dto;

import kz.aitusa.crm.entity.Task;
import kz.aitusa.crm.entity.TaskStatus;
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
public class TaskResponse {

    private UUID id;
    private String name;
    private String description;
    private TaskStatus status;
    private Integer committeeId;
    private UUID createdBy;
    private UUID assignedTo;
    private TaskAssigneeDto assignee;
    private UUID completedBy;
    private OffsetDateTime deadline;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .status(task.getStatus())
                .committeeId(task.getCommitteeId())
                .createdBy(task.getCreatedBy())
                .assignedTo(task.getAssignedTo())
                .assignee(TaskAssigneeDto.fromUser(task.getAssignedUser()))
                .completedBy(task.getCompletedBy())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
