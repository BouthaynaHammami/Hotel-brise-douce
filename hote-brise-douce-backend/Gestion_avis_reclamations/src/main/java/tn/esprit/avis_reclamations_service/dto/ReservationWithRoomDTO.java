package tn.esprit.avis_reclamations_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO enrichi contenant la réservation + le numéro de chambre
 * récupéré via OpenFeign (reservations-service → chambres-service).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationWithRoomDTO {
    private Long idReservation;
    private String dateDebut;
    private String dateFin;
    private String status;
    private Long chambreId;
    private String numeroChambre;  // récupéré via OpenFeign depuis chambres-service
}
