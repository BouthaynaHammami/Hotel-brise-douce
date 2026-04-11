package tn.esprit.avis_reclamations_service.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Détection de doublons : réclamations ouvertes du même client
    @Query("""
        SELECT r FROM ReclamationFeedback r
        WHERE r.idClient = :idClient
        AND r.typeEntree = :typeEntree
        AND r.statut IN :statuts
        """)
    List<ReclamationFeedback> findOuvertesParClient(
            @Param("idClient") Long idClient,
            @Param("typeEntree") TypeEntree typeEntree,
            @Param("statuts") List<Statut> statuts
    );
}