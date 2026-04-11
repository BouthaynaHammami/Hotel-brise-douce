package tn.esprit.clients_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clients_service.entity.Fidelite;
import tn.esprit.clients_service.service.FideliteService;

@RestController
@RequestMapping("/fidelite")
@RequiredArgsConstructor
public class FideliteController {

    private final FideliteService fideliteService;

    @GetMapping("/{clientId}")
    public ResponseEntity<Fidelite> getFidelite(@PathVariable Long clientId) {
        return ResponseEntity.ok(fideliteService.getFideliteByClientId(clientId));
    }

    @PostMapping("/ajouter")
    public ResponseEntity<Void> ajouterPoints(@RequestParam Long clientId, @RequestParam int points) {
        fideliteService.ajouterPoints(clientId, points);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/utiliser")
    public ResponseEntity<String> utiliserPoints(@RequestParam Long clientId, @RequestParam int points) {
        boolean success = fideliteService.utiliserPoints(clientId, points);
        if (success) {
            return ResponseEntity.ok("Points utilisés avec succès");
        } else {
            return ResponseEntity.badRequest().body("Points insuffisants");
        }
    }

    @PutMapping("/{clientId}/points")
    public ResponseEntity<Void> updatePoints(@PathVariable Long clientId, @RequestParam int points) {
        fideliteService.updatePointsManual(clientId, points);
        return ResponseEntity.ok().build();
    }
}
