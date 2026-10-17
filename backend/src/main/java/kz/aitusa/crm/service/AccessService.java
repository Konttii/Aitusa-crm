package kz.aitusa.crm.service;

import kz.aitusa.crm.config.AppProperties;
import kz.aitusa.crm.entity.Committee;
import kz.aitusa.crm.entity.Participant;
import kz.aitusa.crm.entity.RoleAssignment;
import kz.aitusa.crm.entity.User;
import kz.aitusa.crm.exception.DomainException;
import kz.aitusa.crm.repository.CommitteeRepository;
import kz.aitusa.crm.repository.ParticipantRepository;
import kz.aitusa.crm.repository.RoleAssignmentRepository;
import kz.aitusa.crm.repository.UserRepository;
import kz.aitusa.crm.repository.VicePresidentBlockRepository;
import kz.aitusa.crm.security.ActorContext;
import kz.aitusa.crm.security.RoleHierarchy;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccessService {

    private final AppProperties properties;
    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final CommitteeRepository committeeRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final VicePresidentBlockRepository vicePresidentBlockRepository;

    @Transactional(readOnly = true)
    public Map<Long, List<String>> rolesFor(Collection<Long> telegramIds) {
        Set<Long> ids = telegramIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }

        Set<Long> inactive = userRepository.findByTelegramIdIn(ids).stream()
                .filter(u -> !u.isActive())
                .map(User::getTelegramId)
                .collect(Collectors.toSet());

        Set<Long> members = new HashSet<>(participantRepository.findActiveMemberTelegramIds(ids));

        Map<Long, Set<String>> grants = new HashMap<>();
        for (RoleAssignment assignment : roleAssignmentRepository.findByTelegramIdInAndEnabledTrue(ids)) {
            grants.computeIfAbsent(assignment.getTelegramId(), k -> new HashSet<>())
                    .add(assignment.getRole());
        }

        Set<Long> bootstrapAdmins = properties.getBootstrapAdminIds();
        Map<Long, List<String>> result = new HashMap<>();
        for (Long uid : ids) {
            Set<String> assigned = new HashSet<>();
            if (!inactive.contains(uid)) {
                if (bootstrapAdmins.contains(uid)) {
                    assigned.add(RoleHierarchy.ADMIN);
                }
                assigned.addAll(grants.getOrDefault(uid, Set.of()));
            }
            if (!members.contains(uid)) {
                assigned.removeAll(RoleHierarchy.COMMITTEE);
            }
            result.put(uid, RoleHierarchy.ordered(assigned));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<String> roles( long telegramId) {
        return rolesFor(List.of(telegramId)).getOrDefault(telegramId, List.of());
    }

    @Transactional
    public User ensureAccount(long telegramId) {
        User existing = userRepository.findByTelegramId(telegramId).orElse(null);
        if (existing != null) {
            if (!existing.isActive()) {
                throw new DomainException(403, "Учётная запись отключена");
            }
            return existing;
        }
        try {
            User created = User.builder()
                    .telegramId(telegramId)
                    .firstName("")
                    .lastName("")
                    .academicGroup("")
                    .active(true)
                    .build();
            return userRepository.saveAndFlush(created);
        } catch (DataIntegrityViolationException e) {
            return userRepository.findByTelegramId(telegramId)
                    .orElseThrow(() -> e);
        }
    }

    @Transactional
    public ActorContext resolveActor(long telegramId) {
        User existing = userRepository.findByTelegramId(telegramId).orElse(null);
        if (existing != null && !existing.isActive()) {
            throw new DomainException(403, "Учётная запись отключена");
        }
        List<String> assigned = roles(telegramId);
        if (assigned.isEmpty()) {
            throw new DomainException(403, "Для доступа к задачам вступите в комитет или дождитесь назначения роли AITUSA");
        }
        User user = existing != null ? existing : ensureAccount(telegramId);
        Participant membership = participantRepository.findActiveByTelegramId(telegramId).orElse(null);
        return new ActorContext(telegramId, user, membership, new LinkedHashSet<>(assigned));
    }

    @Transactional(readOnly = true)
    public List<Integer> managedCommitteeIds(ActorContext actor) {
        if (actor.hasFullAccess()) {
            return committeeRepository.findAll().stream()
                    .map(Committee::getId)
                    .sorted()
                    .toList();
        }
        if (actor.roles().contains(RoleHierarchy.VICE_PRESIDENT)) {
            List<Integer> blocks = vicePresidentBlockRepository.findValidBlockIdsByTelegramId(actor.telegramId());
            if (blocks.size() != 1) {
                return List.of();
            }
            return committeeRepository.findByBlockId(blocks.get(0)).stream()
                    .map(Committee::getId)
                    .sorted()
                    .toList();
        }
        Participant p = actor.membership();
        if (p == null || !actor.roles().contains(RoleHierarchy.HEAD)) {
            return List.of();
        }
        return List.of(p.getCommitteeId());
    }

    @Transactional(readOnly = true)
    public void mayManage(ActorContext actor, Integer committeeId) {
        if (actor.hasFullAccess()) {
            return;
        }
        List<Integer> managed = managedCommitteeIds(actor);
        if (committeeId == null || !managed.contains(committeeId)) {
            throw new DomainException(403, "Нет прав на задачи этого комитета");
        }
    }

    @Transactional(readOnly = true)
    public Participant validateAssignee(ActorContext actor, UUID userId, Integer committeeId, boolean allowTransfer) {
        Participant membership = participantRepository.findActiveByUserId(userId)
                .orElseThrow(() -> new DomainException(404, "Исполнитель не найден или не состоит в комитете"));
        if (committeeId != null && !Objects.equals(membership.getCommitteeId(), committeeId) && !allowTransfer) {
            throw new DomainException(403, "Исполнитель должен состоять в комитете задачи");
        }
        if (!actor.hasFullAccess()) {
            mayManage(actor, membership.getCommitteeId());
        }
        return membership;
    }
}
