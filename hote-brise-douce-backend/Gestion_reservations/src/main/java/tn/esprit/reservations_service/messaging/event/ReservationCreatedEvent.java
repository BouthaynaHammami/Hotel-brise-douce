package tn.esprit.reservations_service.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Événement publié dans RabbitMQ lorsqu'une réservation est créée.
 * Doit implémenter Serializable pour la sérialisation JSON (Jackson).
 *
 * Ce message sera reçu par chambres_service pour mettre à jour
 * le statut de la chambre → OCCUPEE.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationCreatedEvent implements Serializable {

    private Long reservationId;
    private Long chambreId;
    private Long clientId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String status;
    private int nombrePersonne;
    private double montantTotal;
}
