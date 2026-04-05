package tn.esprit.avis_reclamations_service.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.avis_reclamations_service.entite.ReclamationFeedback;
import tn.esprit.avis_reclamations_service.entite.Statut;
import tn.esprit.avis_reclamations_service.entite.TypeEntree;

import java.util.List;

@Repository
public interface ReclamationFeedbackRepository extends JpaRepository<ReclamationFeedback, Long> {

    List<ReclamationFeedback> findByTypeEntree(TypeEntree typeEntree);

    List<ReclamationFeedback> findByIdClient(Long idClient);

    List<ReclamationFeedback> findByStatut(Statut statut);

    List<ReclamationFeedback> findByTypeEntreeAndStatut(TypeEntree typeEntree, Statut statut);

    List<ReclamationFeedback> findByIdClientAndTypeEntree(Long idClient, TypeEntree typeEntree);
}