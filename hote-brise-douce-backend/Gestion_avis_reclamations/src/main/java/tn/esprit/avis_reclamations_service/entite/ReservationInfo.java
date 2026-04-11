package tn.esprit.avis_reclamations_service.entite;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationInfo {

    @Id
    private Long idReservation;

    private Long idClient;
    private String numeroChambre;
    private String dateArrivee;
    private String dateDepart;
}