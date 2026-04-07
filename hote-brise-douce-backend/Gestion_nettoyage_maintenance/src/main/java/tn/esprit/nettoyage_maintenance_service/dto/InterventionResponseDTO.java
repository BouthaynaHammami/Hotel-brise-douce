package tn.esprit.nettoyage_maintenance_service.dto;

import lombok.Builder;
import lombok.Data;
import tn.esprit.nettoyage_maintenance_service.entity.Priorite;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;

import java.time.LocalDate;

/**
 * DTO returned by GET endpoints — enriches the entity data with
 * the personnel's full name fetched from UTILISATEURS-SERVICE.
 */
@Data
@Builder
public class InterventionResponseDTO {

    private Long idIntervention;
    private TypeIntervention typeIntervention;
    private String description;
    private Integer chambreNumero;
    private Priorite priorite;
    private String note;
    private LocalDate datePlanification;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatusIntervention status;

    private Long personnelId;
    /** Full name resolved from UTILISATEURS-SERVICE (null if no personnel assigned) */
    private String personnelNom;
}
