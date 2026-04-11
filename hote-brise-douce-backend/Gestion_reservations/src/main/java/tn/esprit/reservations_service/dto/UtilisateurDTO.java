package tn.esprit.reservations_service.dto;

import lombok.Data;

/**
 * DTO reçu depuis utilisateurs-service via OpenFeign pour les détails du client.
 */
@Data
public class UtilisateurDTO {
    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
}
