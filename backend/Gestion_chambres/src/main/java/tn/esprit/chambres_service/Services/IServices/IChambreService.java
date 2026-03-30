package tn.esprit.chambres_service.Services.IServices;


import tn.esprit.chambres_service.Entities.chambres;

import java.util.List;
import java.util.Optional;


public interface IChambreService {

    chambres creer(chambres chambre);

    List<chambres> getAll();

    Optional<chambres> getById(Long id);

    chambres modifier(Long id, chambres chambre);

    void supprimer(Long id);
}
