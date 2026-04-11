package tn.esprit.avis_reclamations_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.avis_reclamations_service.dto.ReservationDTO;

import java.util.List;

/**
 * Client Feign pour appeler reservations-service via Eureka.
 *
 * - name : correspond à spring.application.name du Gestion_reservations → "reservations-service"
 * - path : correspond au context-path → /reservations/api
 */
@FeignClient(
        name = "reservations-service",
        contextId = "reservationClient",
        path = "/reservations/api"
)
public interface ReservationClient {

    /**
     * Récupère toutes les réservations d'un client donné.
     * Correspond à GET http://<reservations-service>/reservations/api/reservations/client/{clientId}
     */
    @GetMapping("/reservations/client/{clientId}")
    List<ReservationDTO> getReservationsByClient(@PathVariable("clientId") Long clientId);

    /**
     * Récupère une réservation par son ID.
     * Correspond à GET http://<reservations-service>/reservations/api/reservations/{id}
     */
    @GetMapping("/reservations/{id}")
    ReservationDTO getReservationById(@PathVariable("id") Long id);
}
