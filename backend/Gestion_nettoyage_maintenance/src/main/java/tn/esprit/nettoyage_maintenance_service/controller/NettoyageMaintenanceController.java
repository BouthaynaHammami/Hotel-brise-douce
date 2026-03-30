package tn.esprit.nettoyage_maintenance_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.nettoyage_maintenance_service.entity.NettoyageMaintenance;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;
import tn.esprit.nettoyage_maintenance_service.service.NettoyageMaintenanceService;
import tn.esprit.nettoyage_maintenance_service.dto.UtilisateurDTO;

import java.util.List;
@RestController
@RequestMapping("/interventions")
@RequiredArgsConstructor
public class NettoyageMaintenanceController {

    private final NettoyageMaintenanceService service;

    @GetMapping
    public ResponseEntity<List<NettoyageMaintenance>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NettoyageMaintenance> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<NettoyageMaintenance> create(@RequestBody NettoyageMaintenance intervention) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(intervention));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NettoyageMaintenance> update(@PathVariable Long id,
                                                       @RequestBody NettoyageMaintenance intervention) {
        return ResponseEntity.ok(service.update(id, intervention));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<NettoyageMaintenance>> getByStatus(@PathVariable StatusIntervention status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<NettoyageMaintenance>> getByType(@PathVariable TypeIntervention type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    @GetMapping("/personnel")
    public ResponseEntity<List<UtilisateurDTO>> getAllPersonnel(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(service.getAllPersonnel(token));
    }

    @PutMapping("/{id}/personnel/{personnelId}")
    public ResponseEntity<NettoyageMaintenance> setPersonnelToIntervention(
            @PathVariable Long id, 
            @PathVariable Long personnelId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(service.setPersonnelToIntervention(id, personnelId, token));
    }
}
