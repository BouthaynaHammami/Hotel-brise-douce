package tn.esprit.personnel_service.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Conge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conge_id")
    private Long idConge;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    private String type;

    @Enumerated(EnumType.STRING)
    private StatutConge statut;

    private Long idEmploye;

    private Double montantAvance;
}

