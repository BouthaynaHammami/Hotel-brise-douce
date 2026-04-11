package tn.esprit.nettoyage_maintenance_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "nettoyage_maintenance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NettoyageMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIntervention;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeIntervention typeIntervention;

    @Column(length = 500)
    private String description;

    private Integer chambreNumero;

    /**
     * Legacy FK column kept in DB. Nullable to avoid SQL constraint error.
     * chambreNumero is used instead for static room reference.
     */
    @Column(name = "chambre_id")
    private Long chambreId;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priorite priorite = Priorite.NORMALE;

    @Column(length = 1000)
    private String note;

    private LocalDate datePlanification;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusIntervention status = StatusIntervention.A_FAIRE;

    private Long personnelId;
}
