package kz.aitusa.crm;

import kz.aitusa.crm.dto.PaginatedTasksResponse;
import kz.aitusa.crm.dto.TaskCreateRequest;
import kz.aitusa.crm.dto.TaskResponse;
import kz.aitusa.crm.dto.UserProfileResponse;
import kz.aitusa.crm.entity.Block;
import kz.aitusa.crm.entity.Committee;
import kz.aitusa.crm.entity.Participant;
import kz.aitusa.crm.entity.RoleAssignment;
import kz.aitusa.crm.entity.TaskStatus;
import kz.aitusa.crm.entity.User;
import kz.aitusa.crm.exception.DomainException;
import kz.aitusa.crm.repository.BlockRepository;
import kz.aitusa.crm.repository.CommitteeRepository;
import kz.aitusa.crm.repository.ParticipantRepository;
import kz.aitusa.crm.repository.RoleAssignmentRepository;
import kz.aitusa.crm.repository.TaskRepository;
import kz.aitusa.crm.repository.UserRepository;
import kz.aitusa.crm.security.ActorContext;
import kz.aitusa.crm.service.AccessService;
import kz.aitusa.crm.service.RedisCacheService;
import kz.aitusa.crm.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class TaskWorkflowIntegrationTest {

    @Autowired
    private AccessService accessService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private RedisCacheService cacheService;

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private RoleAssignmentRepository roleAssignmentRepository;

    @Autowired
    private TaskRepository taskRepository;

    private Committee digitalization;

    @BeforeEach
    void setUp() {
        cacheService.clearAll();
        taskRepository.deleteAll();
        participantRepository.deleteAll();
        roleAssignmentRepository.deleteAll();
        userRepository.deleteAll();
        committeeRepository.deleteAll();
        blockRepository.deleteAll();

        Block academic = blockRepository.save(Block.builder().code("ACADEMIC").name("Академический блок").build());
        digitalization = committeeRepository.save(Committee.builder()
                .code("DIGITALIZATION")
                .name("Digitalization")
                .active(true)
                .blockId(academic.getId())
                .build());

        User headUser = userRepository.save(User.builder()
                .telegramId(100000002L)
                .firstName("Алихан")
                .lastName("Нурланов")
                .email("alikhan@astanait.edu.kz")
                .academicGroup("CS-2304")
                .active(true)
                .build());
        participantRepository.save(Participant.builder()
                .user(headUser)
                .committeeId(digitalization.getId())
                .status("Head")
                .build());
        roleAssignmentRepository.save(RoleAssignment.builder()
                .telegramId(100000002L)
                .role("head")
                .enabled(true)
                .build());

        User memberUser = userRepository.save(User.builder()
                .telegramId(100000003L)
                .firstName("Аружан")
                .lastName("Садыкова")
                .email("aruzhan@astanait.edu.kz")
                .academicGroup("IT-2402")
                .active(true)
                .build());
        participantRepository.save(Participant.builder()
                .user(memberUser)
                .committeeId(digitalization.getId())
                .status("Member")
                .build());
        roleAssignmentRepository.save(RoleAssignment.builder()
                .telegramId(100000003L)
                .role("member")
                .enabled(true)
                .build());
    }

    @Test
    void headCreatesUnassignedTaskAndMemberTakesAndCompletesIt() {
        ActorContext head = accessService.resolveActor(100000002L);
        ActorContext member = accessService.resolveActor(100000003L);

        UserProfileResponse headProfile = taskService.profile(head);
        assertTrue(headProfile.getCanCreateTask());
        assertEquals("HEAD_OF_COMMITTEE", headProfile.getRole());

        TaskCreateRequest createReq = TaskCreateRequest.builder()
                .name("Подготовить отчёт по комитету")
                .description("Собрать метрики за месяц")
                .committeeId(digitalization.getId())
                .deadline("2026-10-28T18:00")
                .build();

        TaskResponse created = taskService.create(head, createReq);
        assertEquals(TaskStatus.CREATED, created.getStatus());
        assertNull(created.getAssignedTo());

        // Member cannot create tasks
        assertThrows(DomainException.class, () -> taskService.create(member, createReq));

        // Member sees the unassigned task and takes it
        PaginatedTasksResponse pool = taskService.listing(member, 0, 10, null, null, true);
        assertEquals(1, pool.getTotalElements());

        TaskResponse taken = taskService.take(member, created.getId());
        assertEquals(TaskStatus.ASSIGNED, taken.getStatus());
        assertEquals(member.user().getId(), taken.getAssignedTo());
        assertNotNull(taken.getAssignee());

        // Member moves task to IN_PROGRESS and COMPLETED
        TaskResponse inProgress = taskService.setStatus(member, created.getId(), TaskStatus.IN_PROGRESS);
        assertEquals(TaskStatus.IN_PROGRESS, inProgress.getStatus());

        TaskResponse completed = taskService.setStatus(member, created.getId(), TaskStatus.COMPLETED);
        assertEquals(TaskStatus.COMPLETED, completed.getStatus());
        assertEquals(member.user().getId(), completed.getCompletedBy());
    }
}
