package tn.esprit.avis_reclamations_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO reçu via RabbitMQ depuis le microservice Gestion_reservations.
 * Contient les informations de la réservation publiées lors de sa création.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEventDTO {
    private Long idReservation;
    private Long idClient;
    private String numeroChambre;
    private String dateArrivee;
    private String dateDepart;
}
