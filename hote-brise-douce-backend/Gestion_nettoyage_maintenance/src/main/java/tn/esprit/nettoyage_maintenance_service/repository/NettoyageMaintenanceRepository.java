package tn.esprit.nettoyage_maintenance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.nettoyage_maintenance_service.entity.NettoyageMaintenance;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;

import java.util.List;

@Repository
public interface NettoyageMaintenanceRepository extends JpaRepository<NettoyageMaintenance, Long> {

    List<NettoyageMaintenance> findByStatus(StatusIntervention status);

    List<NettoyageMaintenance> findByTypeIntervention(TypeIntervention typeIntervention);
}
