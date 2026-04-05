package tn.esprit.personnel_service.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.personnel_service.Entities.Tache;
import tn.esprit.personnel_service.Entities.StatutTache;
import tn.esprit.personnel_service.Services.ITacheService;

import java.util.List;

@RestController
@RequestMapping("/taches")
public class TacheController {

    @Autowired
    private ITacheService tacheService;

    @PostMapping
    public Tache addTache(@RequestBody Tache tache) {
        return tacheService.addTache(tache);
    }

    @PutMapping
    public Tache updateTache(@RequestBody Tache tache) {
        return tacheService.updateTache(tache);
    }

    @DeleteMapping("/{idTache}")
    public void deleteTache(@PathVariable Long idTache) {
        tacheService.deleteTache(idTache);
    }

    @GetMapping("/{idTache}")
    public Tache getTacheById(@PathVariable Long idTache) {
        return tacheService.getTacheById(idTache);
    }

    @GetMapping
    public List<Tache> getAllTaches() {
        return tacheService.getAllTaches();
    }

    @GetMapping("/employe/{idEmploye}")
    public List<Tache> getTachesByEmploye(@PathVariable Long idEmploye) {
        return tacheService.getTachesByEmploye(idEmploye);
    }

    @PutMapping("/{idTache}/assigner/{idEmploye}")
    public Tache assignerTache(@PathVariable Long idTache, @PathVariable Long idEmploye) {
        return tacheService.assignerTache(idTache, idEmploye);
    }

    @PutMapping("/{idTache}/statut")
    public Tache changerStatutTache(@PathVariable Long idTache, @RequestParam StatutTache statut) {
        return tacheService.changerStatutTache(idTache, statut);
    }
}
