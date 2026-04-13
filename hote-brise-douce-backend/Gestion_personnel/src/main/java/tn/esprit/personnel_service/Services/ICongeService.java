package tn.esprit.personnel_service.Services;

import tn.esprit.personnel_service.Entities.Conge;
import tn.esprit.personnel_service.Entities.StatutConge;

import java.util.List;

public interface ICongeService {
    Conge addConge(Conge conge);

    Conge updateConge(Conge conge);

    void deleteConge(Long idConge);

    Conge getCongeById(Long idConge);

    List<Conge> getAllConges();

    List<Conge> getCongesByEmploye(Long idEmploye);

    Conge traiterConge(Long idConge, StatutConge statut);

    Conge requestAvancee(Long idConge, Double montantAvance);

    Conge approveAvancee(Long idConge);
}
