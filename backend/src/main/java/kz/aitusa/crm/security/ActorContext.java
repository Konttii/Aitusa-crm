package kz.aitusa.crm.security;

import kz.aitusa.crm.entity.Participant;
import kz.aitusa.crm.entity.User;

import java.util.Set;

public record ActorContext(
        long telegramId,
        User user,
        Participant membership,
        Set<String> roles
) {
    public boolean hasFullAccess() {
        return RoleHierarchy.intersects(roles, RoleHierarchy.FULL_ACCESS);
    }

    public boolean hasGlobalRole() {
        return RoleHierarchy.intersects(roles, RoleHierarchy.GLOBAL);
    }

    public boolean isManager() {
        return RoleHierarchy.intersects(roles, RoleHierarchy.MANAGERS);
    }
}
