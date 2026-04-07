package tn.esprit.nettoyage_maintenance_service.dto;

import lombok.Data;

@Data
public class UtilisateurDTO {
    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String role;
}
