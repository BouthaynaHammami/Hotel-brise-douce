package tn.esprit.clients_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.clients_service.entity.Fidelite;
import tn.esprit.clients_service.enums.Niveau;
import tn.esprit.clients_service.repository.FideliteRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class FideliteService {

    private final FideliteRepository repository;

    public Fidelite getFideliteByClientId(Long clientId) {
        return repository.findByClientId(clientId)
                .orElseGet(() -> createInitialFidelite(clientId));
    }

    private Fidelite createInitialFidelite(Long clientId) {
        Fidelite fidelite = Fidelite.builder()
                .clientId(clientId)
                .points(0)
                .niveau(Niveau.BRONZE)
                .dateDerniereMaj(LocalDateTime.now())
                .build();
        return repository.save(fidelite);
    }

    @Transactional
    public Niveau ajouterPoints(Long clientId, int points) {
        Fidelite fidelite = getFideliteByClientId(clientId);
        Niveau ancienNiveau = fidelite.getNiveau();

        fidelite.setPoints(fidelite.getPoints() + points);
        updateNiveau(fidelite);
        repository.save(fidelite);
        
        log.info("Points ajoutés à clientId={}: +{}. Nouveau total={}", clientId, points, fidelite.getPoints());
        return ancienNiveau;
    }

    @Transactional
    public boolean utiliserPoints(Long clientId, int points) {
        Fidelite fidelite = getFideliteByClientId(clientId);
        if (fidelite.getPoints() >= points) {
            fidelite.setPoints(fidelite.getPoints() - points);
            updateNiveau(fidelite);
            repository.save(fidelite);
            log.info("Points utilisés par clientId={}: -{}. Nouveau total={}", clientId, points, fidelite.getPoints());
            return true;
        }
        log.warn("Points insuffisants pour clientId={}: demandé={}, actuel={}", clientId, points, fidelite.getPoints());
        return false;
    }

    @Transactional
    public void updatePointsManual(Long clientId, int points) {
        Fidelite fidelite = getFideliteByClientId(clientId);
        fidelite.setPoints(points);
        updateNiveau(fidelite);
        repository.save(fidelite);
        log.info("Mise à jour MANUELLE des points pour clientId={}: total={}", clientId, points);
    }

    private void updateNiveau(Fidelite fidelite) {
        int points = fidelite.getPoints();
        Niveau nouveauNiveau = Niveau.BRONZE;

        if (points >= 10000) {
            nouveauNiveau = Niveau.PLATINUM;
        } else if (points >= 5000) {
            nouveauNiveau = Niveau.GOLD;
        } else if (points >= 1000) {
            nouveauNiveau = Niveau.SILVER;
        }

        if (fidelite.getNiveau() != nouveauNiveau) {
            log.info("Changement de niveau pour clientId={}: {} -> {}", fidelite.getClientId(), fidelite.getNiveau(), nouveauNiveau);
            fidelite.setNiveau(nouveauNiveau);
        }
    }

    public double getMultiplierForNiveau(Niveau niveau) {
        if (niveau == null) return 0.10;
        switch (niveau) {
            case SILVER: return 0.12;
            case GOLD: return 0.15;
            case PLATINUM: return 0.20;
            default: return 0.10;
        }
    }
}
