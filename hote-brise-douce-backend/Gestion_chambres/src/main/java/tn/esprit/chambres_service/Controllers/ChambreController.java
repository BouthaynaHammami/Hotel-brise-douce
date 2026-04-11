package tn.esprit.chambres_service.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.chambres_service.Entities.Etat;
import tn.esprit.chambres_service.Entities.chambres;
import tn.esprit.chambres_service.Services.IServices.IChambreService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chambres")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@RefreshScope
public class ChambreController {

    private final IChambreService chambreService;

    @Value("${welcome.message}")
    private String welcomeMessage;

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }

    @PostMapping
    public ResponseEntity<chambres> creer(@RequestBody chambres chambre) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chambreService.creer(chambre));
    }

    @GetMapping
    public ResponseEntity<List<chambres>> getAll() {
        return ResponseEntity.ok(chambreService.getAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<Etat, Long>> getStats() {
        return ResponseEntity.ok(chambreService.getRoomStats());
    }

    @GetMapping("/{id}/prix")
    public ResponseEntity<BigDecimal> getPrix(@PathVariable Long id) {
        chambres chambre = chambreService.getById(id)
                .orElseThrow(() -> new RuntimeException("Chambre not found with id: " + id));
        
        return ResponseEntity.ok(chambreService.calculerPrix(chambre));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<chambres> getById(@PathVariable Long id) {
        return chambreService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/numero/{numero}")
    public ResponseEntity<chambres> getByNumero(@PathVariable String numero) {
        return chambreService.getByNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<chambres> modifier(@PathVariable Long id, @RequestBody chambres chambre) {
        return ResponseEntity.ok(chambreService.modifier(id, chambre));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        chambreService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
