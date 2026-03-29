package tn.esprit.nettoyage_maintenance_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.nettoyage_maintenance_service.entity.NettoyageMaintenance;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;
import tn.esprit.nettoyage_maintenance_service.repository.NettoyageMaintenanceRepository;
import tn.esprit.nettoyage_maintenance_service.client.UtilisateurClient;
import tn.esprit.nettoyage_maintenance_service.dto.UtilisateurDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NettoyageMaintenanceService {

    private final NettoyageMaintenanceRepository repository;
    private final UtilisateurClient utilisateurClient;

    public List<NettoyageMaintenance> getAll() {
        return repository.findAll();
    }

    public NettoyageMaintenance getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found with id: " + id));
    }

    public NettoyageMaintenance create(NettoyageMaintenance intervention) {
        return repository.save(intervention);
    }

    public NettoyageMaintenance update(Long id, NettoyageMaintenance updated) {
        NettoyageMaintenance existing = getById(id);
        existing.setTypeIntervention(updated.getTypeIntervention());
        existing.setDescription(updated.getDescription());
        existing.setDatePlanification(updated.getDatePlanification());
        existing.setDateDebut(updated.getDateDebut());
        existing.setDateFin(updated.getDateFin());
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    public List<NettoyageMaintenance> getByStatus(StatusIntervention status) {
        return repository.findByStatus(status);
    }

    public List<NettoyageMaintenance> getByType(TypeIntervention type) {
        return repository.findByTypeIntervention(type);
    }

    public List<UtilisateurDTO> getAllPersonnel(String token) {
        return utilisateurClient.getAllUsers(token).stream()
                .filter(u -> "PERSONNEL".equalsIgnoreCase(u.getRole()))
                .toList();
    }

    public NettoyageMaintenance setPersonnelToIntervention(Long interventionId, Long personnelId, String token) {
        NettoyageMaintenance intervention = getById(interventionId);
        
        List<UtilisateurDTO> users = utilisateurClient.getAllUsers(token);
        boolean isValidPersonnel = users.stream()
                .anyMatch(u -> personnelId.equals(u.getIdUtilisateur()) && "PERSONNEL".equalsIgnoreCase(u.getRole()));
                
        if (!isValidPersonnel) {
            throw new RuntimeException("User not found or is not a PERSONNEL");
        }
        
        intervention.setPersonnelId(personnelId);
        return repository.save(intervention);
    }
}
