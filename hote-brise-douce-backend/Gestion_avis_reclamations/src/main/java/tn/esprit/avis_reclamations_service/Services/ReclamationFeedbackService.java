package tn.esprit.avis_reclamations_service.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.avis_reclamations_service.Repo.ReclamationFeedbackRepository;
import tn.esprit.avis_reclamations_service.Repo.ReservationInfoRepository;
import tn.esprit.avis_reclamations_service.dto.*;
import tn.esprit.avis_reclamations_service.entite.Priorite;
import tn.esprit.avis_reclamations_service.entite.ReclamationFeedback;
import tn.esprit.avis_reclamations_service.entite.Statut;
import tn.esprit.avis_reclamations_service.entite.TypeEntree;
import tn.esprit.avis_reclamations_service.entite.ReservationInfo;
import tn.esprit.avis_reclamations_service.exception.DoublonException;
import tn.esprit.avis_reclamations_service.feign.ChambreClient;
import tn.esprit.avis_reclamations_service.feign.ReservationClient;
import tn.esprit.avis_reclamations_service.feign.UserClient;
import tn.esprit.avis_reclamations_service.messaging.MaintenanceProducer;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReclamationFeedbackService {

    private final ReclamationFeedbackRepository repository;
    private final ReservationInfoRepository reservationInfoRepository;
    private final UserClient userClient;
    private final ReservationClient reservationClient;
    private final ChambreClient chambreClient;
    private final MaintenanceProducer maintenanceProducer;
    private final SimilariteService similariteService;  // nouveau

    @Value("${reclamation.doublon.seuil:0.65}")
    private double seuilDoublon;

    public ReclamationFeedback create(ReclamationFeedback entity) {

        // 1. Validation client
        UserDTO user = null;
        try {
            user = userClient.getUserById(entity.getIdClient());
        } catch (Exception e) {
            log.warn("⚠️ Service utilisateurs indisponible pour id={} : {}", entity.getIdClient(), e.getMessage());
        }
        if (user == null) {
            throw new RuntimeException("Client introuvable ou service utilisateurs indisponible pour id=" + entity.getIdClient());
        }

        // 2. Validation réservation
        if (entity.getIdReservation() != null) {
            boolean exists = reservationInfoRepository
                    .findByIdReservation(entity.getIdReservation())
                    .isPresent();

            if (!exists) {
                log.info("Réservation id={} introuvable localement (sync via RabbitMQ manquée). Tentative via OpenFeign...", entity.getIdReservation());
                try {
                    ReservationDTO feignRes = reservationClient.getReservationById(entity.getIdReservation());
                    if (feignRes != null) {
                        String numChambre = "N/A";
                        if (feignRes.getChambreId() != null) {
                            try {
                                ChambreDTO chambre = chambreClient.getChambreById(feignRes.getChambreId());
                                if (chambre != null && chambre.getNumero() != null) {
                                    numChambre = chambre.getNumero();
                                }
                            } catch (Exception e) {
                                log.warn("⚠️ Impossible de récupérer la chambre via Feign: {}", e.getMessage());
                            }
                        }
                        
                        ReservationInfo nouvInfo = ReservationInfo.builder()
                                .idReservation(feignRes.getId())
                                .idClient(feignRes.getClientId())
                                .numeroChambre(numChambre)
                                .dateArrivee(feignRes.getDateDebut())
                                .dateDepart(feignRes.getDateFin())
                                .build();
                        
                        reservationInfoRepository.save(nouvInfo);
                        log.info("✅ Réservation id={} synchronisée avec succès via OpenFeign.", entity.getIdReservation());
                    } else {
                        throw new RuntimeException("Réservation introuvable via OpenFeign id=" + entity.getIdReservation());
                    }
                } catch (Exception e) {
                    throw new RuntimeException(
                            "Réservation introuvable localement et erreur OpenFeign id=" + entity.getIdReservation()
                                    + " — " + e.getMessage()
                    );
                }
            }
        }

        // 3. Détection doublon (avant toute persistance)
        detecterDoublon(entity).ifPresent(doublon -> {
            log.warn("⚠️ Doublon détecté pour client={} → réclamation id={} (score={})",
                    entity.getIdClient(), doublon.getIdDoublon(), doublon.getScore());
            throw new DoublonException(doublon);
        });

        // 4. Détection urgence
        boolean urgente = estUrgente(entity);
        log.info("🔍 Urgence détectée ? {} pour titre='{}'", urgente, entity.getTitre());

        if (urgente) {
            entity.setPriorite(Priorite.HAUTE);
            entity.setStatut(Statut.EN_COURS);
        } else {
            if (entity.getPriorite() == null) entity.setPriorite(Priorite.MOYENNE);
            if (entity.getStatut() == null)   entity.setStatut(Statut.NOUVELLE);
        }

        // 5. Persistance
        ReclamationFeedback saved = repository.save(entity);

        // 6. Notification maintenance si urgente
        if (urgente && saved.getIdReservation() != null) {
            reservationInfoRepository.findByIdReservation(saved.getIdReservation())
                    .ifPresentOrElse(
                            info -> {
                                try {
                                    maintenanceProducer.envoyerTacheMaintenance(new MaintenanceEventDTO(
                                            saved.getId(),
                                            info.getNumeroChambre(),
                                            saved.getDescription(),
                                            saved.getPriorite() != null ? saved.getPriorite().name() : "HAUTE"
                                    ));
                                    log.info("🛠️ Urgence envoyée à maintenance pour chambre={}", info.getNumeroChambre());
                                } catch (Exception e) {
                                    log.error("❌ Erreur envoi maintenance pour réclamation urgente id={}", saved.getId(), e);
                                }
                            },
                            () -> log.warn("⚠️ Réservation id={} introuvable localement, maintenance non notifiée.",
                                    saved.getIdReservation())
                    );
        }

        log.info("✅ Création réclamation/feedback pour client id={}", saved.getIdClient());
        return saved;
    }

    // ----------------------------------------------------------------
    //  Détection doublon
    // ----------------------------------------------------------------

    private Optional<DoublonDetecteDTO> detecterDoublon(ReclamationFeedback nouvelle) {
        if (nouvelle.getTypeEntree() != TypeEntree.RECLAMATION) {
            return Optional.empty();
        }

        String texteNouvelle = similariteService.construireTexte(nouvelle);

        return repository
                .findOuvertesParClient(
                        nouvelle.getIdClient(),
                        nouvelle.getTypeEntree(),
                        List.of(Statut.NOUVELLE, Statut.EN_COURS)
                )
                .stream()
                .map(existante -> Map.entry(
                        existante,
                        similariteService.calculerSimilarite(
                                texteNouvelle,
                                similariteService.construireTexte(existante)
                        )
                ))
                .filter(e -> e.getValue() >= seuilDoublon)
                .max(Map.Entry.comparingByValue())
                .map(e -> new DoublonDetecteDTO(
                        e.getKey().getId(),
                        e.getKey().getTitre(),
                        e.getValue(),
                        "Réclamation similaire déjà ouverte (score="
                                + String.format("%.0f", e.getValue() * 100) + "%)"
                ));
    }

    // ----------------------------------------------------------------
    //  CRUD existant — inchangé
    // ----------------------------------------------------------------

    public List<ReclamationFeedback> getAll() {
        return repository.findAll();
    }

    public ReclamationFeedback getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Introuvable id=" + id));
    }

    public List<ReclamationFeedback> getByType(TypeEntree type) {
        return repository.findByTypeEntree(type);
    }

    public List<ReclamationFeedback> getByClient(Long idClient) {
        return repository.findByIdClient(idClient);
    }

    public UserDTO getClientInfo(Long idClient) {
        return userClient.getUserById(idClient);
    }

    /**
     * Récupère les réservations d'un client via OpenFeign (reservations-service)
     * puis enrichit chaque réservation avec le numéro de chambre via OpenFeign (chambres-service).
     */
    public List<ReservationWithRoomDTO> getClientReservationsWithRooms(Long idClient) {
        List<ReservationWithRoomDTO> result = new ArrayList<>();
        try {
            List<ReservationDTO> reservations = reservationClient.getReservationsByClient(idClient);
            if (reservations != null) {
                for (ReservationDTO res : reservations) {
                    String numeroChambre = "N/A";
                    try {
                        if (res.getChambreId() != null) {
                            ChambreDTO chambre = chambreClient.getChambreById(res.getChambreId());
                            if (chambre != null && chambre.getNumero() != null) {
                                numeroChambre = chambre.getNumero();
                            }
                        }
                    } catch (Exception e) {
                        log.warn("⚠️ Impossible de récupérer la chambre id={} : {}", res.getChambreId(), e.getMessage());
                    }
                    result.add(new ReservationWithRoomDTO(
                            res.getId(),
                            res.getDateDebut(),
                            res.getDateFin(),
                            res.getStatus(),
                            res.getChambreId(),
                            numeroChambre
                    ));
                }
            }
        } catch (Exception e) {
            log.error("❌ Erreur récupération réservations pour client={} : {}", idClient, e.getMessage());
        }
        return result;
    }

    public ReclamationFeedback update(Long id, ReclamationFeedback updated) {
        ReclamationFeedback existing = getById(id);
        existing.setTitre(updated.getTitre());
        existing.setDescription(updated.getDescription());
        existing.setCategorie(updated.getCategorie());
        existing.setPriorite(updated.getPriorite());
        existing.setNote(updated.getNote());
        existing.setIdReservation(updated.getIdReservation());

        ReclamationFeedback saved = repository.save(existing);
        log.info("✏️ Réclamation mise à jour id={}", saved.getId());
        return saved;
    }

    public ReclamationFeedback changerStatut(Long id, Statut statut, String reponse) {
        ReclamationFeedback entity = getById(id);
        entity.setStatut(statut);

        if (reponse != null && !reponse.trim().isEmpty()) {
            entity.setReponse(reponse);
        }

        if (statut == Statut.RESOLUE || statut == Statut.FERMEE) {
            entity.setDateResolution(LocalDateTime.now());
        }

        ReclamationFeedback saved = repository.save(entity);

        if ((statut == Statut.RESOLUE || statut == Statut.FERMEE) && saved.getIdReservation() != null) {
            reservationInfoRepository.findByIdReservation(saved.getIdReservation())
                    .ifPresentOrElse(
                            info -> {
                                try {
                                    maintenanceProducer.envoyerTacheMaintenance(new MaintenanceEventDTO(
                                            saved.getId(),
                                            info.getNumeroChambre(),
                                            saved.getDescription(),
                                            saved.getPriorite() != null ? saved.getPriorite().name() : "NORMALE"
                                    ));
                                    log.info("🛠️ Événement maintenance envoyé pour chambre={}", info.getNumeroChambre());
                                } catch (Exception e) {
                                    log.error("❌ Erreur envoi maintenance après changement statut pour réclamation id={}",
                                            saved.getId(), e);
                                }
                            },
                            () -> log.warn("⚠️ Réservation id={} introuvable localement, maintenance non notifiée.",
                                    saved.getIdReservation())
                    );
        }

        log.info("🔄 Statut mis à jour → {} pour réclamation id={}", statut, id);
        return saved;
    }

    public void delete(Long id) {
        repository.delete(getById(id));
        log.info("🗑️ Réclamation supprimée id={}", id);
    }

    // ----------------------------------------------------------------
    //  Méthodes privées
    // ----------------------------------------------------------------

    private String construireNomClient(UserDTO user) {
        if (user == null) return "Un client";
        String prenom = user.getPrenom() != null ? user.getPrenom().trim() : "";
        String nom    = user.getNom()    != null ? user.getNom().trim()    : "";
        String fullName = (prenom + " " + nom).trim();
        return fullName.isEmpty() ? "Un client" : fullName;
    }

    private boolean estUrgente(ReclamationFeedback entity) {
        String titre = entity.getTitre()       != null ? entity.getTitre().toLowerCase()       : "";
        String desc  = entity.getDescription() != null ? entity.getDescription().toLowerCase() : "";
        String cat   = entity.getCategorie()   != null ? entity.getCategorie().toLowerCase()   : "";

        return titre.contains("fuite")          || titre.contains("incendie")
                || titre.contains("électricité")    || titre.contains("court-circuit")
                || titre.contains("porte bloquée")  || titre.contains("sécurité")
                || desc.contains("fuite")           || desc.contains("incendie")
                || desc.contains("électricité")     || desc.contains("court-circuit")
                || desc.contains("porte bloquée")   || desc.contains("gaz")
                || desc.contains("sécurité")
                || cat.contains("urgence")          || cat.contains("maintenance critique");
    }
}