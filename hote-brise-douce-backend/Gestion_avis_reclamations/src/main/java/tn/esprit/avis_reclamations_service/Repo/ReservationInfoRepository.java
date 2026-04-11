package tn.esprit.avis_reclamations_service.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.avis_reclamations_service.entite.ReservationInfo;

import java.util.Optional;

@Repository
public interface ReservationInfoRepository
        extends JpaRepository<ReservationInfo, Long> {

    Optional<ReservationInfo> findByIdReservation(Long idReservation);
}