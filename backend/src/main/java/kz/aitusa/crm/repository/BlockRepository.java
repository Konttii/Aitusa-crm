package kz.aitusa.crm.repository;

import kz.aitusa.crm.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Integer> {

    Optional<Block> findByCode(String code);
}
