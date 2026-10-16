package kz.aitusa.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Table(name = "vice_president_blocks")
@IdClass(VicePresidentBlock.VicePresidentBlockId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VicePresidentBlock {

    @Id
    @Column(name = "telegram_id", nullable = false)
    private Long telegramId;

    @Id
    @Column(name = "block_id", nullable = false)
    private Integer blockId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class VicePresidentBlockId implements Serializable {
        private Long telegramId;
        private Integer blockId;
    }
}
