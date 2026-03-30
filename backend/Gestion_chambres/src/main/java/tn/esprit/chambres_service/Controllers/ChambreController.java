package tn.esprit.chambres_service.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.chambres_service.Entities.chambres;
import tn.esprit.chambres_service.Services.IServices.IChambreService;

import java.util.List;

@RestController
@RequestMapping("/api/chambres")
@RequiredArgsConstructor
public class ChambreController {

    private final IChambreService chambreService;

    @PostMapping
    public ResponseEntity<chambres> creer(@RequestBody chambres chambre) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chambreService.creer(chambre));
    }

    @GetMapping
    public ResponseEntity<List<chambres>> getAll() {
        return ResponseEntity.ok(chambreService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<chambres> getById(@PathVariable Long id) {
        return chambreService.getById(id)
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