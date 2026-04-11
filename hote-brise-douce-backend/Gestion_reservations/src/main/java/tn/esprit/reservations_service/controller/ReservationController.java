package tn.esprit.reservations_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reservations_service.dto.ReservationDetailDTO;
import tn.esprit.reservations_service.entity.Reservation;
import tn.esprit.reservations_service.service.iservice.IReservationService;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReservationController {

    private final IReservationService service;

    public ReservationController(IReservationService service) {
        this.service = service;
    }

    @PostMapping
    public Reservation create(@RequestBody Reservation r) {
        return service.create(r);
    }

    @GetMapping
    public List<Reservation> getAll() {
        return service.getAll();
    }

    @GetMapping("/client/{clientId}")
    public List<Reservation> getByClient(@PathVariable Long clientId) {
        return service.getByClientId(clientId);
    }

    @GetMapping("/{id}")
    public Reservation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    /**
     * Endpoint enrichi : retourne la réservation + les détails complets
     * de la chambre associée (via OpenFeign → chambres_service).
     *
     * URL : GET /reservations/api/reservations/{id}/detail
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<ReservationDetailDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDetailById(id));
    }

    @PutMapping("/{id}")
    public Reservation update(@PathVariable Long id,
                              @RequestBody Reservation r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    /**
     * Endpoint pour récupérer la liste des chambres disponibles.
     * Fait appel en interne via OpenFeign au microservice chambres.
     */
    @GetMapping("/chambres/disponibles")
    public ResponseEntity<List<tn.esprit.reservations_service.dto.ChambreDTO>> getAvailableRooms() {
        return ResponseEntity.ok(service.getAvailableRooms());
    }

    /**
     * Endpoint pour récupérer toutes les chambres (tous statuts).
     * Utilisé pour résoudre les numéros de chambres côté frontend.
     */
    @GetMapping("/chambres/all")
    public ResponseEntity<List<tn.esprit.reservations_service.dto.ChambreDTO>> getAllRooms() {
        return ResponseEntity.ok(service.getAllRooms());
    }
}
