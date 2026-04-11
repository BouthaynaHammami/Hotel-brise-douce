package tn.esprit.avis_reclamations_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tn.esprit.avis_reclamations_service.dto.DoublonDetecteDTO;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DoublonException.class)
    public ResponseEntity<DoublonDetecteDTO> handleDoublon(DoublonException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getDoublon());
    }
}