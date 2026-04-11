package tn.esprit.chambres_service.Services.ImplServices;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.chambres_service.Entities.Etat;
import tn.esprit.chambres_service.Entities.chambres;
import tn.esprit.chambres_service.Repositories.ChambreRepository;
import tn.esprit.chambres_service.Services.IServices.IChambreService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public Optional<chambres> getByNumero(String numero) {
        return chambreRepository.findByNumero(numero);
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

    @Override
    public Map<Etat, Long> getRoomStats() {
        return chambreRepository.findAll().stream()
                .collect(Collectors.groupingBy(chambres::getEtat, Collectors.counting()));
    }

    @Override
    public void updateRoomStatus(Long id, Etat etat) {
        chambres room = chambreRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        room.setEtat(etat);
        chambreRepository.save(room);
    }

    @Override
    public BigDecimal calculerPrix(chambres chambre) {
        BigDecimal prix = chambre.getTarifStandard();

        // Bonus pour l'étage (plus haut = plus cher)
        if (chambre.getEtage() != null) {
            prix = prix.add(BigDecimal.valueOf(chambre.getEtage() * 10));
        }

        // Bonus pour la capacité
        if (chambre.getCapacite() != null) {
            prix = prix.add(BigDecimal.valueOf(chambre.getCapacite() * 20));
        }

        // Bonus pour le type de chambre
        if ("DOUBLE".equalsIgnoreCase(chambre.getTypeChambre())) {
            prix = prix.add(BigDecimal.valueOf(50));
        }

        return prix;
    }
}
