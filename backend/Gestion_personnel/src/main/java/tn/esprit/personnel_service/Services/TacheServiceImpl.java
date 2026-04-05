package tn.esprit.personnel_service.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.personnel_service.Entities.StatutTache;
import tn.esprit.personnel_service.Entities.Tache;
import tn.esprit.personnel_service.Repositories.TacheRepository;

@Service
public class TacheServiceImpl implements ITacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private NotificationSender notificationSender;

    @Override
    public Tache addTache(Tache tache) {
        tache.setStatut(StatutTache.A_FAIRE);
        Tache saved = tacheRepository.save(tache);
        
        // Notification RabbitMQ si un employé est déjà assigné à la création
        if (saved.getIdEmploye() != null) {
            notificationSender.sendTaskAssignment(saved.getIdEmploye(), saved.getIdTache(), saved.getTitre());
        }
        
        return saved;
    }

    @Override
    public Tache updateTache(Tache tache) {
        return tacheRepository.save(tache);
    }

    @Override
    public void deleteTache(Long idTache) {
        tacheRepository.deleteById(idTache);
    }

    @Override
    public Tache getTacheById(Long idTache) {
        return tacheRepository.findById(idTache).orElse(null);
    }

    @Override
    public java.util.List<Tache> getAllTaches() {
        return tacheRepository.findAll();
    }

    @Override
    public java.util.List<Tache> getTachesByEmploye(Long idEmploye) {
        return tacheRepository.findByIdEmploye(idEmploye);
    }

    @Override
    public Tache assignerTache(Long idTache, Long idEmploye) {
        Tache tache = tacheRepository.findById(idTache).orElseThrow(() -> new RuntimeException("Tache non trouvée avec l'id : " + idTache));
        tache.setIdEmploye(idEmploye);
        Tache saved = tacheRepository.save(tache);
        
        // Notification RabbitMQ
        notificationSender.sendTaskAssignment(idEmploye, idTache, tache.getTitre());
        
        return saved;
    }

    @Override
    public Tache changerStatutTache(Long idTache, StatutTache statut) {
        Tache tache = tacheRepository.findById(idTache).orElseThrow(() -> new RuntimeException("Tache non trouvée avec l'id : " + idTache));
        tache.setStatut(statut);
        return tacheRepository.save(tache);
    }
}
