package tn.esprit.avis_reclamations_service.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private String typeClient;
    private Boolean statusCompte;
}