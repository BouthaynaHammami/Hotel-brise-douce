package tn.esprit.avis_reclamations_service.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.avis_reclamations_service.Services.ReclamationFeedbackService;
import tn.esprit.avis_reclamations_service.dto.UserDTO;
import tn.esprit.avis_reclamations_service.entite.ReclamationFeedback;
import tn.esprit.avis_reclamations_service.entite.Statut;
import tn.esprit.avis_reclamations_service.entite.TypeEntree;

import java.util.List;

@RestController
@RequestMapping("/reclamations-feedbacks")
@RequiredArgsConstructor
public class ReclamationFeedbackController {

    private final ReclamationFeedbackService service;

    @PostMapping
    public ResponseEntity<ReclamationFeedback> create(@RequestBody ReclamationFeedback entity) {
        ReclamationFeedback created = service.create(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ReclamationFeedback>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReclamationFeedback> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ReclamationFeedback>> getByType(@PathVariable TypeEntree type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<List<ReclamationFeedback>> getByClient(@PathVariable Long idClient) {
        return ResponseEntity.ok(service.getByClient(idClient));
    }

    @GetMapping("/client/{idClient}/info")
    public ResponseEntity<UserDTO> getClientInfo(@PathVariable Long idClient) {
        return ResponseEntity.ok(service.getClientInfo(idClient));
    }

    /**
     * Récupère les réservations d'un client avec le numéro de chambre associé.
     * Utilise OpenFeign pour appeler reservations-service et chambres-service.
     */
    @GetMapping("/client/{idClient}/reservations")
    public ResponseEntity<java.util.List<tn.esprit.avis_reclamations_service.dto.ReservationWithRoomDTO>> getClientReservations(
            @PathVariable Long idClient) {
        return ResponseEntity.ok(service.getClientReservationsWithRooms(idClient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReclamationFeedback> update(
            @PathVariable Long id,
            @RequestBody ReclamationFeedback entity) {
        return ResponseEntity.ok(service.update(id, entity));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<ReclamationFeedback> changerStatut(
            @PathVariable Long id,
            @RequestParam Statut statut,
            @RequestParam(required = false) String reponse) {
        return ResponseEntity.ok(service.changerStatut(id, statut, reponse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}