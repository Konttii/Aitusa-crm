package kz.aitusa.crm.service;

import jakarta.persistence.criteria.Predicate;
import kz.aitusa.crm.dto.CommitteeResponse;
import kz.aitusa.crm.dto.PaginatedTasksResponse;
import kz.aitusa.crm.dto.TaskCreateRequest;
import kz.aitusa.crm.dto.TaskResponse;
import kz.aitusa.crm.dto.TaskUpdateRequest;
import kz.aitusa.crm.dto.UserProfileResponse;
import kz.aitusa.crm.entity.Committee;
import kz.aitusa.crm.entity.Participant;
import kz.aitusa.crm.entity.Task;
import kz.aitusa.crm.entity.TaskStatus;
import kz.aitusa.crm.entity.User;
import kz.aitusa.crm.exception.DomainException;
import kz.aitusa.crm.repository.CommitteeRepository;
import kz.aitusa.crm.repository.ParticipantRepository;
import kz.aitusa.crm.repository.TaskRepository;
import kz.aitusa.crm.repository.UserRepository;
import kz.aitusa.crm.security.ActorContext;
import kz.aitusa.crm.security.RoleHierarchy;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final AccessService accessService;
    private final TaskRepository taskRepository;
    private final CommitteeRepository committeeRepository;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse profile(ActorContext actor) {
        List<Integer> managedIds = accessService.managedCommitteeIds(actor);
        Map<Integer, Committee> committeesById = committeeRepository.findAll().stream()
                .collect(Collectors.toMap(Committee::getId, Function.identity()));
        UserProfileResponse base = toUserView(
                actor.user(),
                actor.membership(),
                List.copyOf(actor.roles()),
                committeesById
        );
        base.setManagedCommitteeIds(managedIds);
        base.setCanCreateTask(actor.hasFullAccess() || !managedIds.isEmpty());
        base.setCanManageAllTasks(actor.hasFullAccess());
        base.setCanDeleteTasks(actor.hasGlobalRole());
        return base;
    }

    @Transactional(readOnly = true)
    public List<CommitteeResponse> committees(ActorContext actor) {
        List<Integer> managedIds = accessService.managedCommitteeIds(actor);
        if (managedIds.isEmpty()) {
            return List.of();
        }
        return committeeRepository.findByActiveTrueAndIdInOrderByNameAsc(managedIds).stream()
                .map(c -> CommitteeResponse.builder().id(c.getId()).name(c.getName()).build())
                .toList();
    }

    @Transactional
    public TaskResponse create(ActorContext actor, TaskCreateRequest data) {
        if (!actor.isManager()) {
            throw new DomainException(403, "Участник не может создавать задачи");
        }
        Integer committeeId = data.getCommitteeId();
        User assignedUser = null;
        if (data.getAssignedTo() != null) {
            Participant assigneeMembership = accessService.validateAssignee(
                    actor, data.getAssignedTo(), committeeId, false
            );
            assignedUser = assigneeMembership.getUser();
            if (committeeId == null) {
                committeeId = assigneeMembership.getCommitteeId();
            }
        }
        if (committeeId == null && !actor.hasFullAccess()) {
            List<Integer> managedIds = accessService.managedCommitteeIds(actor);
            if (actor.membership() != null && managedIds.contains(actor.membership().getCommitteeId())) {
                committeeId = actor.membership().getCommitteeId();
            } else if (!managedIds.isEmpty()) {
                committeeId = managedIds.get(0);
            }
        }
        accessService.mayManage(actor, committeeId);
        if (committeeId != null) {
            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            if (committee == null || !committee.isActive()) {
                throw new DomainException(409, "Комитет недоступен");
            }
        }

        Task task = Task.builder()
                .name(data.getName().trim())
                .description(data.getDescription())
                .deadline(data.parsedDeadline())
                .committeeId(committeeId)
                .createdBy(actor.user().getId())
                .assignedTo(data.getAssignedTo())
                .assignedUser(assignedUser)
                .status(data.getAssignedTo() != null ? TaskStatus.ASSIGNED : TaskStatus.CREATED)
                .build();

        Task saved = taskRepository.saveAndFlush(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PaginatedTasksResponse listing(
            ActorContext actor,
            int page,
            int size,
            TaskStatus status,
            UUID assignedTo,
            Boolean unassigned
    ) {
        Specification<Task> spec = visibleSpecification(actor);

        if (Boolean.TRUE.equals(unassigned)) {
            spec = spec.and((root, query, cb) -> cb.isNull(root.get("assignedTo")));
        } else if (Boolean.FALSE.equals(unassigned)) {
            spec = spec.and((root, query, cb) -> cb.isNotNull(root.get("assignedTo")));
        }

        if (assignedTo != null) {
            if (!actor.isManager() && !assignedTo.equals(actor.user().getId())) {
                throw new DomainException(403, "Нельзя смотреть чужие задачи");
            }
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedTo"), assignedTo));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.asc("id"))
        );
        Page<Task> taskPage = taskRepository.findAll(spec, pageRequest);
        long total = taskPage.getTotalElements();
        int totalPages = (int) ((total + size - 1) / size);

        return PaginatedTasksResponse.builder()
                .content(taskPage.getContent().stream().map(TaskResponse::fromEntity).toList())
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages(totalPages)
                .build();
    }

    @Transactional(readOnly = true)
    public TaskResponse detail(ActorContext actor, UUID taskId) {
        Task task = accessibleTask(actor, taskId, false);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse edit(ActorContext actor, UUID taskId, TaskUpdateRequest data) {
        Task task = accessibleTask(actor, taskId, true);

        if (data.isNamePresent()) {
            if (data.getName() == null || data.getName().isBlank()) {
                throw new DomainException(422, "Название не может быть пустым");
            }
            task.setName(data.getName().trim());
        }

        if (data.isDescriptionPresent()) {
            task.setDescription(data.getDescription());
        }

        if (data.isDeadlinePresent()) {
            task.setDeadline(data.parsedDeadline());
        }

        if (data.isAssignedToPresent() && !Objects.equals(data.getAssignedTo(), task.getAssignedTo())) {
            if (task.getStatus() == TaskStatus.COMPLETED) {
                throw new DomainException(409, "Сначала верните завершённую задачу в работу");
            }
            UUID nextAssignee = data.getAssignedTo();
            User assignedUser = null;
            if (nextAssignee != null) {
                Participant membership = accessService.validateAssignee(
                        actor,
                        nextAssignee,
                        task.getCommitteeId(),
                        actor.hasGlobalRole()
                );
                assignedUser = membership.getUser();
                if (!Objects.equals(membership.getCommitteeId(), task.getCommitteeId())) {
                    Committee committee = committeeRepository.findById(membership.getCommitteeId()).orElse(null);
                    if (committee == null || !committee.isActive()) {
                        throw new DomainException(409, "Комитет нового исполнителя недоступен");
                    }
                    task.setCommitteeId(membership.getCommitteeId());
                }
            }
            task.setAssignedTo(nextAssignee);
            task.setAssignedUser(assignedUser);
            task.setStatus(nextAssignee != null ? TaskStatus.ASSIGNED : TaskStatus.CREATED);
            task.setCompletedBy(null);
        }

        task.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        Task saved = taskRepository.saveAndFlush(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public TaskResponse setStatus(ActorContext actor, UUID taskId, TaskStatus status) {
        Task task = accessibleTask(actor, taskId, false);
        boolean own = Objects.equals(task.getAssignedTo(), actor.user().getId());
        if (!own) {
            accessService.mayManage(actor, task.getCommitteeId());
        }
        if (task.getAssignedTo() == null && Set.of(
                TaskStatus.ASSIGNED,
                TaskStatus.IN_PROGRESS,
                TaskStatus.COMPLETED
        ).contains(status)) {
            throw new DomainException(409, "Сначала назначьте исполнителя");
        }
        if (task.getAssignedTo() != null && Set.of(
                TaskStatus.CREATED,
                TaskStatus.PUBLISHED
        ).contains(status)) {
            throw new DomainException(409, "Сначала снимите исполнителя");
        }

        task.setStatus(status);
        task.setCompletedBy(status == TaskStatus.COMPLETED ? actor.user().getId() : null);
        task.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        Task saved = taskRepository.saveAndFlush(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public TaskResponse take(ActorContext actor, UUID taskId) {
        accessibleTask(actor, taskId, false);
        if (actor.membership() == null) {
            throw new DomainException(403, "Сначала зарегистрируйтесь в комитете");
        }
        int updated = taskRepository.atomicTakeTask(
                taskId,
                actor.user().getId(),
                actor.membership().getCommitteeId(),
                List.of(TaskStatus.CREATED, TaskStatus.PUBLISHED),
                TaskStatus.ASSIGNED,
                OffsetDateTime.now(ZoneOffset.UTC)
        );
        if (updated != 1) {
            throw new DomainException(409, "Задача уже занята или недоступна");
        }
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new DomainException(404, "Задача не найдена"));
        if (task.getAssignedUser() == null && task.getAssignedTo() != null) {
            userRepository.findById(task.getAssignedTo()).ifPresent(task::setAssignedUser);
        }
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public void delete(ActorContext actor, UUID taskId) {
        if (!actor.hasGlobalRole()) {
            throw new DomainException(403, "Удаление доступно президенту и вице-президенту");
        }
        Task task = accessibleTask(actor, taskId, true);
        taskRepository.delete(task);
        taskRepository.flush();
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> subordinates(
            ActorContext actor,
            String search,
            Integer committeeId,
            boolean includeSelf
    ) {
        if (!actor.isManager()) {
            return List.of();
        }
        List<Integer> managedIds = accessService.managedCommitteeIds(actor);
        if (managedIds.isEmpty()) {
            return List.of();
        }
        if (committeeId != null) {
            accessService.mayManage(actor, committeeId);
        }

        List<Participant> participants = participantRepository.findActiveInCommittees(managedIds);
        String normalizedSearch = search != null ? search.trim().toLowerCase(Locale.ROOT) : "";

        List<Participant> filtered = participants.stream()
                .filter(p -> includeSelf || !p.getUser().getId().equals(actor.user().getId()))
                .filter(p -> committeeId == null || Objects.equals(p.getCommitteeId(), committeeId))
                .filter(p -> matchesSearch(p.getUser(), normalizedSearch))
                .limit(100)
                .toList();

        List<Long> telegramIds = filtered.stream()
                .map(p -> p.getUser().getTelegramId())
                .filter(Objects::nonNull)
                .toList();
        Map<Long, List<String>> resolvedRoles = accessService.rolesFor(telegramIds);
        Map<Integer, Committee> committeesById = committeeRepository.findAll().stream()
                .collect(Collectors.toMap(Committee::getId, Function.identity()));

        return filtered.stream()
                .map(p -> toUserView(
                        p.getUser(),
                        p,
                        resolvedRoles.getOrDefault(p.getUser().getTelegramId(), List.of()),
                        committeesById
                ))
                .toList();
    }

    private boolean matchesSearch(User user, String query) {
        if (query.isEmpty()) {
            return true;
        }
        String first = user.getFirstName() != null ? user.getFirstName().toLowerCase(Locale.ROOT) : "";
        String last = user.getLastName() != null ? user.getLastName().toLowerCase(Locale.ROOT) : "";
        String email = user.getEmail() != null ? user.getEmail().toLowerCase(Locale.ROOT) : "";
        String group = user.getAcademicGroup() != null ? user.getAcademicGroup().toLowerCase(Locale.ROOT) : "";
        String fullForward = (first + " " + last).trim();
        String fullReverse = (last + " " + first).trim();

        return email.contains(query)
                || first.contains(query)
                || last.contains(query)
                || group.contains(query)
                || fullForward.contains(query)
                || fullReverse.contains(query);
    }

    private Task accessibleTask(ActorContext actor, UUID taskId, boolean manage) {
        Specification<Task> spec = visibleSpecification(actor)
                .and((root, query, cb) -> cb.equal(root.get("id"), taskId));
        Task task = taskRepository.findOne(spec)
                .orElseThrow(() -> new DomainException(404, "Задача не найдена"));
        if (manage) {
            accessService.mayManage(actor, task.getCommitteeId());
        }
        return task;
    }

    private Specification<Task> visibleSpecification(ActorContext actor) {
        if (actor.hasFullAccess()) {
            return (root, query, cb) -> cb.conjunction();
        }
        List<Integer> managedIds = accessService.managedCommitteeIds(actor);
        if (actor.roles().contains(RoleHierarchy.VICE_PRESIDENT)) {
            if (managedIds.isEmpty()) {
                return (root, query, cb) -> cb.disjunction();
            }
            return (root, query, cb) -> root.get("committeeId").in(managedIds);
        }
        if (actor.membership() == null && !actor.isManager()) {
            throw new DomainException(403, "Нет активного членства");
        }

        return (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();
            conditions.add(cb.equal(root.get("assignedTo"), actor.user().getId()));

            if (actor.isManager() && !managedIds.isEmpty()) {
                conditions.add(root.get("committeeId").in(managedIds));
            }

            if (actor.membership() != null && (actor.roles().contains(RoleHierarchy.MEMBER)
                    || actor.roles().contains(RoleHierarchy.TRAINEE))) {
                Predicate unassigned = cb.isNull(root.get("assignedTo"));
                Predicate openStatus = root.get("status").in(List.of(TaskStatus.CREATED, TaskStatus.PUBLISHED));
                Predicate sameOrGlobalCommittee = cb.or(
                        cb.isNull(root.get("committeeId")),
                        cb.equal(root.get("committeeId"), actor.membership().getCommitteeId())
                );
                conditions.add(cb.and(unassigned, openStatus, sameOrGlobalCommittee));
            }

            return cb.or(conditions.toArray(new Predicate[0]));
        };
    }

    private UserProfileResponse toUserView(
            User user,
            Participant membership,
            List<String> assignedRoles,
            Map<Integer, Committee> committeesById
    ) {
        Committee committee = membership != null ? committeesById.get(membership.getCommitteeId()) : null;
        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .academicGroup(user.getAcademicGroup())
                .group(user.getAcademicGroup())
                .role(RoleHierarchy.primaryCode(assignedRoles))
                .roles(assignedRoles)
                .memberStatus(membership != null ? membership.getStatus() : null)
                .committee(committee != null ? committee.getName() : null)
                .committeeId(committee != null ? committee.getId() : null)
                .block(committee != null ? committee.getBlockId() : null)
                .build();
    }
}
