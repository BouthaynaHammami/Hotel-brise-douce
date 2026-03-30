package tn.esprit.personnel_service.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tache_id")
    private Long idTache;

    private String titre;
    private String description;

    @Enumerated(EnumType.STRING)
    private StatutTache statut;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private TypeShift typeShift;

    private Long idEmploye;
}

