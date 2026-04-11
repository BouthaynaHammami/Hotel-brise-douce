package tn.esprit.avis_reclamations_service.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEntree typeEntree;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String categorie;

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    private Integer note;

    private String reponse;

    @Column(nullable = false)
    private Long idClient;

    private Long idReservation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateResolution;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = Statut.NOUVELLE;
        }
    }
}