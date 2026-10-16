package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommitteeRepository extends JpaRepository<Committee, Integer> {

    List<Committee> findByActiveTrueOrderByNameAsc();

    List<Committee> findByActiveTrueAndIdInOrderByNameAsc(Collection<Integer> ids);

    List<Committee> findByBlockId(Integer blockId);

    Optional<Committee> findByCode(String code);
}
