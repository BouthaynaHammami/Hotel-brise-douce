package tn.esprit.reservations_service.service.iservice;

import tn.esprit.reservations_service.dto.ReservationDetailDTO;
import tn.esprit.reservations_service.entity.Reservation;

import java.util.List;

public interface IReservationService {

    Reservation create(Reservation reservation);

    List<Reservation> getAll();

    Reservation getById(Long id);

    /**
     * Retourne la réservation enrichie avec les détails de la chambre
     * récupérés via OpenFeign depuis chambres_service.
     */
    ReservationDetailDTO getDetailById(Long id);

    Reservation update(Long id, Reservation reservation);

    void delete(Long id);

    List<Reservation> getByClientId(Long clientId);

    /**
     * Get available rooms by fetching all rooms and filtering them by DISPONIBLE state
     */
    List<tn.esprit.reservations_service.dto.ChambreDTO> getAvailableRooms();

    List<tn.esprit.reservations_service.dto.ChambreDTO> getAllRooms();
}