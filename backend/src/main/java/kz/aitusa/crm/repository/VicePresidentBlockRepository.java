package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.VicePresidentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VicePresidentBlockRepository extends JpaRepository<VicePresidentBlock, VicePresidentBlock.VicePresidentBlockId> {

    @Query("SELECT v.blockId FROM VicePresidentBlock v JOIN Block b ON b.id = v.blockId WHERE v.telegramId = :telegramId AND b.code IN ('SOCIAL', 'ACADEMIC')")
    List<Integer> findValidBlockIdsByTelegramId(@Param("telegramId") Long telegramId);
}
