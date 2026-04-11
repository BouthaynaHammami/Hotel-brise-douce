package tn.esprit.reservations_service.service.serviceimpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.reservations_service.client.ChambreClient;
import tn.esprit.reservations_service.dto.ChambreDTO;
import tn.esprit.reservations_service.dto.ReservationDetailDTO;
import tn.esprit.reservations_service.dto.UtilisateurDTO;
import tn.esprit.reservations_service.client.UtilisateurClient;
import tn.esprit.reservations_service.entity.Reservation;
import tn.esprit.reservations_service.messaging.event.ReservationCreatedEvent;
import tn.esprit.reservations_service.messaging.producer.ReservationEventProducer;
import tn.esprit.reservations_service.repository.ReservationRepository;
import tn.esprit.reservations_service.service.iservice.IReservationService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements IReservationService {

    private final ReservationRepository repo;
    private final ChambreClient chambreClient;
    private final UtilisateurClient utilisateurClient;
    private final ReservationEventProducer eventProducer; // ← nouveau

    @Override
    public Reservation create(Reservation r) {
        // 1. Sauvegarder en base (synchrone)
        Reservation saved = repo.save(r);

        // 2. Publier l'événement RabbitMQ (asynchrone, non bloquant)
        ReservationCreatedEvent event = new ReservationCreatedEvent(
                saved.getId(),
                saved.getChambreId(),
                saved.getClientId(),
                saved.getDateDebut(),
                saved.getDateFin(),
                saved.getStatus(),
                saved.getNombrePersonne(),
                saved.getMontantTotal());
        eventProducer.publishReservationCreated(event);

        return saved;
    }

    @Override
    public List<Reservation> getAll() {
        return repo.findAll();
    }

    @Override
    public Reservation getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    /**
     * Récupère la réservation ET les détails complets de la chambre
     * via OpenFeign, puis les assemble dans un DTO enrichi.
     *
     * Si chambres_service est indisponible, chambreDetails sera null
     * et la réservation sera tout de même retournée (résilience basique).
     */
    @Override
    public ReservationDetailDTO getDetailById(Long id) {
        Reservation reservation = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec id: " + id));

        ChambreDTO chambreDetails = null;
        try {
            chambreDetails = chambreClient.getChambreById(reservation.getChambreId());
        } catch (Exception e) {
            System.err.println("[Feign] Impossible de joindre chambres_service : " + e.getMessage());
        }

        UtilisateurDTO clientDetails = null;
        try {
            clientDetails = utilisateurClient.getUserById(reservation.getClientId());
        } catch (Exception e) {
            System.err.println("[Feign] Impossible de joindre utilisateurs-service : " + e.getMessage());
        }

        return ReservationDetailDTO.from(reservation, chambreDetails, clientDetails);
    }

    @Override
    public Reservation update(Long id, Reservation newR) {
        Reservation r = repo.findById(id).orElse(null);

        if (r != null) {
            r.setDateDebut(newR.getDateDebut());
            r.setDateFin(newR.getDateFin());
            r.setStatus(newR.getStatus());
            r.setNombrePersonne(newR.getNombrePersonne());
            r.setMontantTotal(newR.getMontantTotal());
            return repo.save(r);
        }

        return null;
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public List<Reservation> getByClientId(Long clientId) {
        return repo.findByClientId(clientId);
    }

    @Override
    public List<ChambreDTO> getAvailableRooms() {
        try {
            List<ChambreDTO> allRooms = chambreClient.getAllChambres();
            if (allRooms != null) {
                return allRooms.stream()
                        .filter(chambre -> "DISPONIBLE".equalsIgnoreCase(chambre.getStatut()))
                        .toList();
            }
        } catch (Exception e) {
            System.err.println("[Feign] Impossible de récupérer les chambres : " + e.getMessage());
        }
        return List.of();
    }

    @Override
    public List<ChambreDTO> getAllRooms() {
        try {
            List<ChambreDTO> allRooms = chambreClient.getAllChambres();
            if (allRooms != null) {
                return allRooms;
            }
        } catch (Exception e) {
            System.err.println("[Feign] Impossible de récupérer les chambres : " + e.getMessage());
        }
        return List.of();
    }
}