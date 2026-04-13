package tn.esprit.personnel_service.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.personnel_service.Entities.Conge;
import tn.esprit.personnel_service.Entities.StatutConge;
import tn.esprit.personnel_service.Services.ICongeService;

import java.util.List;

@RestController
@RequestMapping("/conges")
public class CongeController {

    @Autowired
    private ICongeService congeService;

    @PostMapping
    public Conge addConge(@RequestBody Conge conge) {
        return congeService.addConge(conge);
    }

    @PutMapping
    public Conge updateConge(@RequestBody Conge conge) {
        return congeService.updateConge(conge);
    }

    @DeleteMapping("/{idConge}")
    public void deleteConge(@PathVariable Long idConge) {
        congeService.deleteConge(idConge);
    }

    @GetMapping("/{idConge}")
    public Conge getCongeById(@PathVariable Long idConge) {
        return congeService.getCongeById(idConge);
    }

    @GetMapping
    public List<Conge> getAllConges() {
        return congeService.getAllConges();
    }

    @GetMapping("/employe/{idEmploye}")
    public List<Conge> getCongesByEmploye(@PathVariable Long idEmploye) {
        return congeService.getCongesByEmploye(idEmploye);
    }

    @PutMapping("/{idConge}/traiter")
    public Conge traiterConge(@PathVariable Long idConge, @RequestParam StatutConge statut) {
        return congeService.traiterConge(idConge, statut);
    }

    @PutMapping("/{idConge}/avancee")
    public Conge requestAvancee(@PathVariable Long idConge, @RequestParam Double montantAvance) {
        return congeService.requestAvancee(idConge, montantAvance);
    }

    @PutMapping("/{idConge}/avancee/approuver")
    public Conge approveAvancee(@PathVariable Long idConge) {
        return congeService.approveAvancee(idConge);
    }
}
