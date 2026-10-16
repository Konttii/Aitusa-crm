package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Integer> {

    @Query("SELECT p FROM Participant p JOIN FETCH p.user u WHERE u.telegramId = :telegramId AND u.active = true")
    Optional<Participant> findActiveByTelegramId(@Param("telegramId") Long telegramId);

    @Query("SELECT p FROM Participant p JOIN FETCH p.user u WHERE u.id = :userId AND u.active = true")
    Optional<Participant> findActiveByUserId(@Param("userId") UUID userId);

    @Query("SELECT u.telegramId FROM Participant p JOIN p.user u WHERE u.telegramId IN :telegramIds AND u.active = true")
    List<Long> findActiveMemberTelegramIds(@Param("telegramIds") Collection<Long> telegramIds);

    @Query("SELECT p FROM Participant p JOIN FETCH p.user u WHERE u.active = true AND p.committeeId IN :committeeIds ORDER BY u.lastName ASC, p.id ASC")
    List<Participant> findActiveInCommittees(@Param("committeeIds") Collection<Integer> committeeIds);
}
