package tn.esprit.nettoyage_maintenance_service.dto;

import lombok.Data;
import tn.esprit.nettoyage_maintenance_service.entity.Priorite;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;

import java.time.LocalDate;

/**
 * DTO used for creating and updating an intervention (POST / PUT body).
 * Keeps the raw entity out of the API surface and prevents deserialization errors.
 */
@Data
public class InterventionRequestDTO {

    private TypeIntervention typeIntervention;

    private String description;

    /** Static room number (Chambres microservice not yet connected) */
    private Integer chambreNumero;

    private Priorite priorite;

    private String note;

    private LocalDate datePlanification;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    /**
     * Defaults to A_FAIRE on creation.
     * Personnel use the dedicated PATCH endpoint to change status.
     */
    private StatusIntervention status;

    private Long personnelId;
}
