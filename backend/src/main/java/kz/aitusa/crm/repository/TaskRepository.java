package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.Task;
import kz.aitusa.crm.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Task t
               SET t.assignedTo = :userId,
                   t.status = :newStatus,
                   t.updatedAt = :now
             WHERE t.id = :taskId
               AND t.assignedTo IS NULL
               AND t.status IN :allowedStatuses
               AND (t.committeeId IS NULL OR t.committeeId = :committeeId)
            """)
    int atomicTakeTask(
            @Param("taskId") UUID taskId,
            @Param("userId") UUID userId,
            @Param("committeeId") Integer committeeId,
            @Param("allowedStatuses") Collection<TaskStatus> allowedStatuses,
            @Param("newStatus") TaskStatus newStatus,
            @Param("now") OffsetDateTime now
    );
}
