package tn.esprit.reservations_service.dto;

import lombok.Data;
import tn.esprit.reservations_service.entity.Reservation;

import java.time.LocalDate;

/**
 * DTO de réponse enrichi : combine les données de Reservation + les détails
 * de la chambre récupérés via OpenFeign depuis chambres_service.
 */
@Data
public class ReservationDetailDTO {

    // ─── données Reservation ──────────────────────────────────────────────
    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String status;
    private int nombrePersonne;
    private double montantTotal;
    private Long clientId;
    private Long chambreId;

    // ─── données Chambre (enrichies via Feign) ────────────────────────────
    private ChambreDTO chambre;

    // ─── données Utilisateur (enrichies via Feign python) ─────────────────
    private UtilisateurDTO client;

    /**
     * Fabrique statique pour créer le DTO à partir de l'entité + données Feign
     */
    public static ReservationDetailDTO from(Reservation r, ChambreDTO chambre, UtilisateurDTO client) {
        ReservationDetailDTO dto = new ReservationDetailDTO();
        dto.setId(r.getId());
        dto.setDateDebut(r.getDateDebut());
        dto.setDateFin(r.getDateFin());
        dto.setStatus(r.getStatus());
        dto.setNombrePersonne(r.getNombrePersonne());
        dto.setMontantTotal(r.getMontantTotal());
        dto.setClientId(r.getClientId());
        dto.setChambreId(r.getChambreId());
        dto.setChambre(chambre);
        dto.setClient(client);
        return dto;
    }
}
