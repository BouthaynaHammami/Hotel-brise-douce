package tn.esprit.clients_service.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

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
