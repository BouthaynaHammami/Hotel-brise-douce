package tn.esprit.avis_reclamations_service.Services;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.avis_reclamations_service.entite.ReclamationFeedback;
import tn.esprit.avis_reclamations_service.Repo.ReclamationFeedbackRepository;
import tn.esprit.avis_reclamations_service.entite.Statut;
import tn.esprit.avis_reclamations_service.entite.TypeEntree;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationFeedbackService {

    private final ReclamationFeedbackRepository repository;

    public ReclamationFeedback create(ReclamationFeedback entity) {
        return repository.save(entity);
    }

    public List<ReclamationFeedback> getAll() {
        return repository.findAll();
    }

    public ReclamationFeedback getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Introuvable id=" + id));
    }

    public List<ReclamationFeedback> getByType(TypeEntree type) {
        return repository.findByTypeEntree(type);
    }

    public List<ReclamationFeedback> getByClient(Long idClient) {
        return repository.findByIdClient(idClient);
    }

    public ReclamationFeedback update(Long id, ReclamationFeedback updated) {
        ReclamationFeedback existing = getById(id);
        existing.setTitre(updated.getTitre());
        existing.setDescription(updated.getDescription());
        existing.setCategorie(updated.getCategorie());
        existing.setPriorite(updated.getPriorite());
        existing.setNote(updated.getNote());
        existing.setIdReservation(updated.getIdReservation());
        return repository.save(existing);
    }

    public ReclamationFeedback changerStatut(Long id, Statut statut, String reponse) {
        ReclamationFeedback entity = getById(id);
        entity.setStatut(statut);
        if (reponse != null) entity.setReponse(reponse);
        if (statut == Statut.RESOLUE || statut == Statut.FERMEE) {
            entity.setDateResolution(LocalDateTime.now());
        }
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}