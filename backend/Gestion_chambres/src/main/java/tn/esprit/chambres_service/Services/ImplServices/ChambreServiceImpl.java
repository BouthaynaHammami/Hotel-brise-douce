package tn.esprit.chambres_service.Services.ImplServices;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.chambres_service.Entities.chambres;
import tn.esprit.chambres_service.Repositories.ChambreRepository;
import tn.esprit.chambres_service.Services.IServices.IChambreService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChambreServiceImpl implements IChambreService {

    private final ChambreRepository chambreRepository;

    @Override
    public chambres creer(chambres chambre) {
        return chambreRepository.save(chambre);
    }

    @Override
    public List<chambres> getAll() {
        return chambreRepository.findAll();
    }

    @Override
    public Optional<chambres> getById(Long id) {
        return chambreRepository.findById(id);
    }

    @Override
    public chambres modifier(Long id, chambres chambre) {
        chambre.setIdChambre(id);
        return chambreRepository.save(chambre);
    }

    @Override
    public void supprimer(Long id) {
        chambreRepository.deleteById(id);
    }
}