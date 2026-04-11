package tn.esprit.clients_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clients_service.entity.Fidelite;

import java.util.Optional;

public interface FideliteRepository extends JpaRepository<Fidelite, Long> {
    Optional<Fidelite> findByClientId(Long clientId);
}
