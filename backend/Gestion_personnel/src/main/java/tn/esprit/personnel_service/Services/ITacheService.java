package tn.esprit.personnel_service.Services;

import tn.esprit.personnel_service.Entities.Tache;
import tn.esprit.personnel_service.Entities.StatutTache;

public interface ITacheService {
    Tache addTache(Tache tache);
    Tache updateTache(Tache tache);
    void deleteTache(Long idTache);
    Tache getTacheById(Long idTache);
    java.util.List<Tache> getAllTaches();
    java.util.List<Tache> getTachesByEmploye(Long idEmploye);
    Tache assignerTache(Long idTache, Long idEmploye);
    Tache changerStatutTache(Long idTache, StatutTache statut);
}
