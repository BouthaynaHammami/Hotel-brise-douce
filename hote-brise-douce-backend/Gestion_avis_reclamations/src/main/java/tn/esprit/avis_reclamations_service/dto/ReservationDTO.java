package tn.esprit.avis_reclamations_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO correspondant à l'entité Reservation du microservice reservations-service.
 * Utilisé pour recevoir les données via OpenFeign.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Long id;
    private String dateDebut;
    private String dateFin;
    private String status;
    private int nombrePersonne;
    private double montantTotal;
    private Long clientId;
    private Long chambreId;
}