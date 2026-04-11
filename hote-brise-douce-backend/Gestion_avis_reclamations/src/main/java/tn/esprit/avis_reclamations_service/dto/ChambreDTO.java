package tn.esprit.avis_reclamations_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO reçu depuis chambres-service via OpenFeign.
 * Les @JsonProperty mappent les noms de champs de l'entité chambres.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChambreDTO {

    @JsonProperty("idChambre")
    private Long id;

    private String numero;

    @JsonProperty("typeChambre")
    private String type;

    @JsonProperty("tarifStandard")
    private double prixParNuit;

    private int capacite;

    @JsonProperty("etat")
    private String statut;

    @JsonProperty("imageChambre")
    private String imageUrl;
}
