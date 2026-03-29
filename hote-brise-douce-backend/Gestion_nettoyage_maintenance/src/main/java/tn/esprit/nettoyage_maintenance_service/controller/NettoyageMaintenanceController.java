package tn.esprit.nettoyage_maintenance_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.nettoyage_maintenance_service.dto.InterventionRequestDTO;
import tn.esprit.nettoyage_maintenance_service.dto.InterventionResponseDTO;
import tn.esprit.nettoyage_maintenance_service.dto.UtilisateurDTO;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;
import tn.esprit.nettoyage_maintenance_service.service.NettoyageMaintenanceService;

import java.util.List;

@RestController
@RequestMapping("/interventions")
@RequiredArgsConstructor
public class NettoyageMaintenanceController {

    private final NettoyageMaintenanceService service;

    // ──────────────────────────────────────────────
    // ADMIN — CRUD
    // ──────────────────────────────────────────────

    /** GET /interventions — list all interventions (admin view) */
    @GetMapping
    public ResponseEntity<List<InterventionResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** GET /interventions/{id} — get one intervention */
    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * POST /interventions — create a new intervention.
     * Body: InterventionRequestDTO — uses explicit DTO to avoid Jackson enum deserialization issues.
     */
    @PostMapping
    public ResponseEntity<InterventionResponseDTO> create(@RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    /**
     * PUT /interventions/{id} — admin full-update.
     * Body: InterventionRequestDTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<InterventionResponseDTO> update(
            @PathVariable Long id,
            @RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /** DELETE /interventions/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /interventions/status/{status} — filter by status */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InterventionResponseDTO>> getByStatus(
            @PathVariable StatusIntervention status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    /** GET /interventions/type/{type} — filter by type */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<InterventionResponseDTO>> getByType(
            @PathVariable TypeIntervention type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    // ──────────────────────────────────────────────
    // PERSONNEL — own tasks + status update
    // ──────────────────────────────────────────────

    /**
     * GET /interventions/personnel/{personnelId} — all interventions for a specific personnel.
     * Used by the personnel portal so each member only sees their own tasks.
     */
    @GetMapping("/personnel/{personnelId}")
    public ResponseEntity<List<InterventionResponseDTO>> getByPersonnel(
            @PathVariable Long personnelId) {
        return ResponseEntity.ok(service.getByPersonnelId(personnelId));
    }

    /**
     * PATCH /interventions/{id}/personnel/{personnelId}/status?newStatus=EN_COURS
     * Personnel-only endpoint: update the status of one of their own interventions.
     * Prevents them from modifying any other field.
     */
    @PatchMapping("/{id}/personnel/{personnelId}/status")
    public ResponseEntity<InterventionResponseDTO> updateStatus(
            @PathVariable Long id,
            @PathVariable Long personnelId,
            @RequestParam StatusIntervention newStatus) {
        return ResponseEntity.ok(service.updateStatus(id, personnelId, newStatus));
    }

    // ──────────────────────────────────────────────
    // ADMIN HELPERS
    // ──────────────────────────────────────────────

    /**
     * GET /interventions/personnel — list of users with role PERSONNEL.
     * Used by admin forms to populate the personnel dropdown.
     */
    @GetMapping("/personnel")
    public ResponseEntity<List<UtilisateurDTO>> getAllPersonnel() {
        return ResponseEntity.ok(service.getAllPersonnel());
    }
}
