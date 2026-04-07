package tn.esprit.nettoyage_maintenance_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.context.config.annotation.RefreshScope;
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

@RefreshScope
@RestController
@RequestMapping("/interventions")
@RequiredArgsConstructor
public class NettoyageMaintenanceController {

    private final NettoyageMaintenanceService service;

    @org.springframework.beans.factory.annotation.Value("${welcome.message:Welcome default}")
    private String welcomeMessage;

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }


    @GetMapping
    public ResponseEntity<List<InterventionResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<InterventionResponseDTO> create(@RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterventionResponseDTO> update(
            @PathVariable Long id,
            @RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InterventionResponseDTO>> getByStatus(
            @PathVariable StatusIntervention status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<InterventionResponseDTO>> getByType(
            @PathVariable TypeIntervention type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    // ──────────────────────────────────────────────
    // PERSONNEL — own tasks + status update
    // ──────────────────────────────────────────────


    @GetMapping("/personnel/{personnelId}")
    public ResponseEntity<List<InterventionResponseDTO>> getByPersonnel(
            @PathVariable Long personnelId) {
        return ResponseEntity.ok(service.getByPersonnelId(personnelId));
    }

    @PatchMapping("/{id}/personnel/{personnelId}/status")
    public ResponseEntity<InterventionResponseDTO> updateStatus(
            @PathVariable Long id,
            @PathVariable Long personnelId,
            @RequestParam StatusIntervention newStatus) {
        return ResponseEntity.ok(service.updateStatus(id, personnelId, newStatus));
    }

    @GetMapping("/personnel")
    public ResponseEntity<List<UtilisateurDTO>> getAllPersonnel() {
        return ResponseEntity.ok(service.getAllPersonnel());
    }
}
