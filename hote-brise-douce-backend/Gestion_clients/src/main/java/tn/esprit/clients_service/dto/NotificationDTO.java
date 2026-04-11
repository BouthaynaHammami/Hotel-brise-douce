package tn.esprit.clients_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String type;
    private Long idEmploye; // Key used by Python consumer for recipient ID
    private String message;
    private Long idObjet;
}
