package tn.esprit.reservations_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.reservations_service.entity.Reservation;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByClientId(Long clientId);

}