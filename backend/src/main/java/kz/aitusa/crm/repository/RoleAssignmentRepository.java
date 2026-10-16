package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.RoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoleAssignmentRepository extends JpaRepository<RoleAssignment, RoleAssignment.RoleAssignmentId> {

    List<RoleAssignment> findByTelegramIdInAndEnabledTrue(Collection<Long> telegramIds);

    List<RoleAssignment> findByTelegramIdAndEnabledTrue(Long telegramId);
}
