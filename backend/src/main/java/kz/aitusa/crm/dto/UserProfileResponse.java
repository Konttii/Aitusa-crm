package kz.aitusa.crm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.ALWAYS)
public class UserProfileResponse {

    private String id;
    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("academic_group")
    private String academicGroup;

    private String group;
    private String role;
    private List<String> roles;
    private String memberStatus;
    private String committee;
    private Integer committeeId;
    private Integer block;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<Integer> managedCommitteeIds;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean canCreateTask;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean canManageAllTasks;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean canDeleteTasks;
}
