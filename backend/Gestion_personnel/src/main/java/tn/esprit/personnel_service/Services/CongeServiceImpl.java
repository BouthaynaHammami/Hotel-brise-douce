package tn.esprit.personnel_service.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.personnel_service.Entities.Conge;
import tn.esprit.personnel_service.Entities.StatutConge;
import tn.esprit.personnel_service.Repositories.CongeRepository;

@Service
public class CongeServiceImpl implements ICongeService {

    @Autowired
    private CongeRepository congeRepository;

    @Autowired
    private NotificationSender notificationSender;

    @Override
    public Conge addConge(Conge conge) {
        conge.setStatut(StatutConge.EN_ATTENTE);
        return congeRepository.save(conge);
    }

    @Override
    public Conge updateConge(Conge conge) {
        return congeRepository.save(conge);
    }

    @Override
    public void deleteConge(Long idConge) {
        congeRepository.deleteById(idConge);
    }

    @Override
    public Conge getCongeById(Long idConge) {
        return congeRepository.findById(idConge).orElse(null);
    }

    @Override
    public java.util.List<Conge> getAllConges() {
        return congeRepository.findAll();
    }

    @Override
    public java.util.List<Conge> getCongesByEmploye(Long idEmploye) {
        return congeRepository.findByIdEmploye(idEmploye);
    }

    @Override
    public Conge traiterConge(Long idConge, StatutConge statut) {
        Conge conge = congeRepository.findById(idConge).orElseThrow(() -> new RuntimeException("Conge non trouvé avec l'id : " + idConge));
        conge.setStatut(statut);
        Conge saved = congeRepository.save(conge);
        
        // Notification RabbitMQ
        notificationSender.sendLeaveStatusUpdate(
            saved.getIdEmploye(), 
            saved.getIdConge(), 
            saved.getType(),
            saved.getDateDebut().toString(),
            saved.getDateFin().toString(),
            statut.toString()
        );
        
        return saved;
    }
}
