package tn.esprit.chambres_service.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class chambres {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idChambre;
    private String imageChambre;
    private String numero;
    private String typeChambre;
    private Integer etage;
    private BigDecimal tarifStandard;

    @Enumerated(EnumType.STRING)
    private Etat etat;

    private Integer capacite;
}
