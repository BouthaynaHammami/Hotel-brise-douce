package tn.esprit.personnel_service.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UtilisateurDTO {
    private Integer idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private Boolean statusCompte;
    private LocalDateTime dateCreation;
    private LocalDateTime dernierAccess;
    
    // Personnel specific fields
    private String matricule;
    private String poste;
    private LocalDate dateEmbauche;
    private String status;
    private String horaires;
}
