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

    private LocalDate datePlanification;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusIntervention status;

    private Long personnelId;
}
