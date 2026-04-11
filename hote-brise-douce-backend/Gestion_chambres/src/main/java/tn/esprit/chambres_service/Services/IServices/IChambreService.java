package tn.esprit.chambres_service.Services.IServices;


import tn.esprit.chambres_service.Entities.Etat;
import tn.esprit.chambres_service.Entities.chambres;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;


public interface IChambreService {

    chambres creer(chambres chambre);

    List<chambres> getAll();

    Optional<chambres> getById(Long id);

    Optional<chambres> getByNumero(String numero);

    chambres modifier(Long id, chambres chambre);

    void supprimer(Long id);

    // Advanced Business Logic: Get room counts by status
    Map<Etat, Long> getRoomStats();

    void updateRoomStatus(Long id, Etat etat);

    // Advanced Business Logic: Dynamic price calculation
    BigDecimal calculerPrix(chambres chambre);
}
