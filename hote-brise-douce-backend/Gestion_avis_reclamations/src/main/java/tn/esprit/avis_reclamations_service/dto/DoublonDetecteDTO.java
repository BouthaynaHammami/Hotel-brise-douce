package tn.esprit.avis_reclamations_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DoublonDetecteDTO {
    private Long idDoublon;
    private String titreDoublon;
    private double score;
    private String message;
}