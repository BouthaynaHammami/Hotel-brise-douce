package tn.esprit.chambres_service.Repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.chambres_service.Entities.chambres;

import java.util.Optional;

@Repository
public interface ChambreRepository extends JpaRepository<chambres, Long> {
    Optional<chambres> findByNumero(String numero);
}
