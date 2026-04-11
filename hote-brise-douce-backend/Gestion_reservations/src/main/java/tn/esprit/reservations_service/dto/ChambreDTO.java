package tn.esprit.reservations_service.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO reçu depuis chambres_service via OpenFeign.
 * Doit correspondre aux champs exposés par ChambreController.getById() et getAll()
 */
@Data
public class ChambreDTO {

    @JsonProperty("idChambre")
    private Long id;

    private String numero;

    @JsonProperty("typeChambre")
    private String type;          // TypeChambre enum sérialisé en String

    @JsonProperty("tarifStandard")
    private double prixParNuit;

    private int capacite;

    @JsonProperty("etat")
    private String statut;        // StatutChambre enum sérialisé en String

    private String description;

    @JsonProperty("imageChambre")
    private String imageUrl;
}
