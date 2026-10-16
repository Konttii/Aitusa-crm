package kz.aitusa.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "committees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Committee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 64, nullable = false, unique = true)
    private String code;

    @Column(length = 100, nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "block_id")
    private Integer blockId;

    @PrePersist
    public void prePersist() {
        if (code == null || code.isBlank()) {
            code = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
