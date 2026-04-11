package tn.esprit.personnel_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String type; // e.g., "TASK_ASSIGNED", "LEAVE_STATUS"
    private Long idEmploye;
    private Long idObjet; // ID of the task or leave request
    private String message;
}
