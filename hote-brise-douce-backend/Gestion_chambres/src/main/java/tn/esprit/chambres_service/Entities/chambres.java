package tn.esprit.chambres_service.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "chambres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class chambres {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chambre")
    private Long idChambre;

    @Column(name = "image_chambre")
    private String imageChambre;

    private String numero;

    @Column(name = "type_chambre")
    private String typeChambre;

    private Integer etage;

    @Column(name = "tarif_standard")
    private BigDecimal tarifStandard;

    @Enumerated(EnumType.STRING)
    private Etat etat;

    private Integer capacite;
}
