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
        Conge conge = congeRepository.findById(idConge)
                .orElseThrow(() -> new RuntimeException("Conge non trouvé avec l'id : " + idConge));
        conge.setStatut(statut);
        Conge saved = congeRepository.save(conge);

        notificationSender.sendLeaveStatusUpdate(
                saved.getIdEmploye(),
                saved.getIdConge(),
                saved.getType(),
                saved.getDateDebut().toString(),
                saved.getDateFin().toString(),
                statut.toString());

        return saved;
    }

    @Override
    public Conge requestAvancee(Long idConge, Double montantAvance) {
        Conge conge = congeRepository.findById(idConge)
                .orElseThrow(() -> new RuntimeException("Conge non trouvé avec l'id : " + idConge));
        
        // Verify montantAvance is positive
        if (montantAvance == null || montantAvance <= 0) {
            throw new RuntimeException("Montant d'avance doit être positif");
        }
        
        conge.setMontantAvance(montantAvance);
        Conge saved = congeRepository.save(conge);

        // Send notification about advance request
        notificationSender.sendLeaveAdvanceNotification(
                saved.getIdEmploye(),
                saved.getIdConge(),
                montantAvance.toString(),
                saved.getType());

        return saved;
    }

    @Override
    public Conge approveAvancee(Long idConge) {
        Conge conge = congeRepository.findById(idConge)
                .orElseThrow(() -> new RuntimeException("Conge non trouvé avec l'id : " + idConge));
        
        // Check if advance has been requested
        if (conge.getMontantAvance() == null || conge.getMontantAvance() <= 0) {
            throw new RuntimeException("Aucune demande d'avance pour ce congé");
        }
        
        // Set status to APPROUVE (approved)
        conge.setStatut(StatutConge.APPROUVE);
        Conge saved = congeRepository.save(conge);

        // Send notification about advance approval
        notificationSender.sendLeaveAdvanceNotification(
                saved.getIdEmploye(),
                saved.getIdConge(),
                "Avancée approuvée: " + saved.getMontantAvance(),
                saved.getType());

        return saved;
    }
}
