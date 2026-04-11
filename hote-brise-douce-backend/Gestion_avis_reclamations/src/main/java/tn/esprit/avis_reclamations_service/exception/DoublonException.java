package tn.esprit.avis_reclamations_service.exception;

import tn.esprit.avis_reclamations_service.dto.DoublonDetecteDTO;

public class DoublonException extends RuntimeException {

    private final DoublonDetecteDTO doublon;

    public DoublonException(DoublonDetecteDTO doublon) {
        super(doublon.getMessage());
        this.doublon = doublon;
    }

    public DoublonDetecteDTO getDoublon() {
        return doublon;
    }
}