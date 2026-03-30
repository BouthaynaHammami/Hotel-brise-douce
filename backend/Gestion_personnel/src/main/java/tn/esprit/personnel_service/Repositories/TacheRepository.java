package tn.esprit.personnel_service.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.personnel_service.Entities.Tache;

@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {
    java.util.List<Tache> findByIdEmploye(Long idEmploye);
}
