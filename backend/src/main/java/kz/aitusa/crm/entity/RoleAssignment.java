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
@Table(name = "role_assignments")
@IdClass(RoleAssignment.RoleAssignmentId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleAssignment {

    @Id
    @Column(name = "telegram_id", nullable = false)
    private Long telegramId;

    @Id
    @Column(name = "role", length = 16, nullable = false)
    private String role;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class RoleAssignmentId implements Serializable {
        private Long telegramId;
        private String role;
    }
}
