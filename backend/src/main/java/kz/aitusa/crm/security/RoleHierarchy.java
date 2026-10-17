package kz.aitusa.crm.security;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class RoleHierarchy {

    public static final String ADMIN = "admin";
    public static final String PRESIDENT = "president";
    public static final String SECRETARY = "secretary";
    public static final String VICE_PRESIDENT = "vice-president";
    public static final String HEAD = "head";
    public static final String MEMBER = "member";
    public static final String TRAINEE = "trainee";

    public static final List<String> ORDER = List.of(
            ADMIN,
            PRESIDENT,
            SECRETARY,
            VICE_PRESIDENT,
            HEAD,
            MEMBER,
            TRAINEE
    );

    public static final Map<String, String> ROLE_LABELS = Map.of(
            ADMIN, "Admin",
            PRESIDENT, "President",
            SECRETARY, "Secretary",
            VICE_PRESIDENT, "Vice President",
            HEAD, "Head",
            MEMBER, "Member",
            TRAINEE, "Intern"
    );

    public static final Map<String, String> ROLE_CODES = Map.of(
            "Admin", "ADMIN",
            "President", "PRESIDENT",
            "Secretary", "SECRETARY",
            "Vice President", "VICE_PRESIDENT",
            "Head", "HEAD_OF_COMMITTEE",
            "Member", "MEMBER",
            "Intern", "TRAINEE"
    );

    public static final Set<String> FULL_ACCESS = Set.of(ADMIN, PRESIDENT, SECRETARY);
    public static final Set<String> GLOBAL = Set.of(ADMIN, PRESIDENT, SECRETARY, VICE_PRESIDENT);
    public static final Set<String> COMMITTEE = Set.of(HEAD, MEMBER, TRAINEE);
    public static final Set<String> MANAGERS = Set.of(ADMIN, PRESIDENT, SECRETARY, VICE_PRESIDENT, HEAD);

    private RoleHierarchy() {
    }

    public static List<String> ordered(Collection<String> assigned) {
        return ORDER.stream()
                .filter(assigned::contains)
                .toList();
    }

    public static String primaryLabel(Collection<String> assigned) {
        for (String role : ORDER) {
            if (assigned.contains(role)) {
                return ROLE_LABELS.get(role);
            }
        }
        return "Guest";
    }

    public static String primaryCode(Collection<String> assigned) {
        String label = primaryLabel(assigned);
        return ROLE_CODES.getOrDefault(label, "MEMBER");
    }

    public static boolean intersects(Collection<String> a, Collection<String> b) {
        for (String item : a) {
            if (b.contains(item)) {
                return true;
            }
        }
        return false;
    }
}
