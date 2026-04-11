package tn.esprit.personnel_service.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.personnel_service.Entities.Conge;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {
    java.util.List<Conge> findByIdEmploye(Long idEmploye);
}
