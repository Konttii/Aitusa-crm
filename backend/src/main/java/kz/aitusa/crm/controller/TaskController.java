package kz.aitusa.crm.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import kz.aitusa.crm.dto.CommitteeResponse;
import kz.aitusa.crm.dto.PaginatedTasksResponse;
import kz.aitusa.crm.dto.TaskCreateRequest;
import kz.aitusa.crm.dto.TaskResponse;
import kz.aitusa.crm.dto.TaskStatusUpdateRequest;
import kz.aitusa.crm.dto.TaskUpdateRequest;
import kz.aitusa.crm.dto.UserProfileResponse;
import kz.aitusa.crm.entity.TaskStatus;
import kz.aitusa.crm.security.ActorContext;
import kz.aitusa.crm.security.CurrentActor;
import kz.aitusa.crm.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Tasks CRM", description = "AITUSA Task Management & CRM Mini App API")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/auth/me")
    @Operation(summary = "Get current authenticated CRM user profile and permissions")
    public UserProfileResponse crmProfile(@Parameter(hidden = true) @CurrentActor ActorContext current) {
        return taskService.profile(current);
    }

    @GetMapping("/users/subordinates")
    @Operation(summary = "Search subordinate members across managed committees")
    public List<UserProfileResponse> subordinates(
            @RequestParam(required = false) @Size(max = 100) String search,
            @RequestParam(name = "committeeId", required = false) @Positive Integer committeeId,
            @RequestParam(name = "includeSelf", defaultValue = "false") boolean includeSelf,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.subordinates(current, search, committeeId, includeSelf);
    }

    @GetMapping("/task-committees")
    @Operation(summary = "List active committees managed by the current user")
    public List<CommitteeResponse> taskCommittees(@Parameter(hidden = true) @CurrentActor ActorContext current) {
        return taskService.committees(current);
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new task")
    public TaskResponse create(
            @Valid @RequestBody TaskCreateRequest data,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.create(current, data);
    }

    @GetMapping("/tasks")
    @Operation(summary = "List visible tasks with pagination and filtering")
    public PaginatedTasksResponse listing(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(name = "assignedTo", required = false) UUID assignedTo,
            @RequestParam(required = false) Boolean unassigned,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.listing(current, page, size, status, assignedTo, unassigned);
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get task details by ID")
    public TaskResponse detail(
            @PathVariable UUID taskId,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.detail(current, taskId);
    }

    @PatchMapping("/tasks/{taskId}")
    @Operation(summary = "Edit task title, description, deadline or assignee")
    public TaskResponse edit(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskUpdateRequest data,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.edit(current, taskId, data);
    }

    @PatchMapping("/tasks/{taskId}/status")
    @Operation(summary = "Update task workflow status")
    public TaskResponse status(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskStatusUpdateRequest data,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.setStatus(current, taskId, data.getStatus());
    }

    @PostMapping("/tasks/{taskId}/take")
    @Operation(summary = "Atomically take an unassigned task")
    public TaskResponse take(
            @PathVariable UUID taskId,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        return taskService.take(current, taskId);
    }

    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "Delete a task (President / Vice President / Admin only)")
    public ResponseEntity<Void> delete(
            @PathVariable UUID taskId,
            @Parameter(hidden = true) @CurrentActor ActorContext current
    ) {
        taskService.delete(current, taskId);
        return ResponseEntity.noContent().build();
    }
}
