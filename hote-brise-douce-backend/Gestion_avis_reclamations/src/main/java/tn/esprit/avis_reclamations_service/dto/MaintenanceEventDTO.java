package tn.esprit.avis_reclamations_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceEventDTO {
    private Long idReclamation;
    private String numeroChambre;
    private String description;
    private String priorite;
}