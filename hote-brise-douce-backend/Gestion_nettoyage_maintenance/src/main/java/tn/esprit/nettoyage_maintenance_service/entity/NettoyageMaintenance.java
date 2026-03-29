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

    /** Static room number — Chambres microservice not yet connected */
    private Integer chambreNumero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priorite priorite = Priorite.NORMALE;

    /** Free-text note from admin */
    @Column(length = 1000)
    private String note;

    private LocalDate datePlanification;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusIntervention status = StatusIntervention.A_FAIRE;

    /** FK to UTILISATEURS-SERVICE */
    private Long personnelId;
}
