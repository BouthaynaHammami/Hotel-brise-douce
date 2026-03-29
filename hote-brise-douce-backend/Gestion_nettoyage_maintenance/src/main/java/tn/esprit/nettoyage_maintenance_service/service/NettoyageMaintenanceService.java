package tn.esprit.nettoyage_maintenance_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.nettoyage_maintenance_service.dto.InterventionRequestDTO;
import tn.esprit.nettoyage_maintenance_service.dto.InterventionResponseDTO;
import tn.esprit.nettoyage_maintenance_service.dto.UtilisateurDTO;
import tn.esprit.nettoyage_maintenance_service.entity.NettoyageMaintenance;
import tn.esprit.nettoyage_maintenance_service.entity.Priorite;
import tn.esprit.nettoyage_maintenance_service.entity.StatusIntervention;
import tn.esprit.nettoyage_maintenance_service.entity.TypeIntervention;
import tn.esprit.nettoyage_maintenance_service.client.UtilisateurClient;
import tn.esprit.nettoyage_maintenance_service.repository.NettoyageMaintenanceRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NettoyageMaintenanceService {

    private final NettoyageMaintenanceRepository repository;
    private final UtilisateurClient utilisateurClient;

    // ──────────────────────────────────────────────
    // ADMIN — full CRUD
    // ──────────────────────────────────────────────

    /** Returns all interventions enriched with resolved personnel names. */
    public List<InterventionResponseDTO> getAll() {
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return repository.findAll().stream()
                .map(i -> toResponse(i, userMap))
                .collect(Collectors.toList());
    }

    public InterventionResponseDTO getById(Long id) {
        NettoyageMaintenance intervention = findOrThrow(id);
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return toResponse(intervention, userMap);
    }

    /**
     * Creates a new intervention.
     * - status defaults to A_FAIRE if not provided
     * - priorite defaults to NORMALE if not provided
     * - validates that personnelId (if given) belongs to a PERSONNEL user
     */
    public InterventionResponseDTO create(InterventionRequestDTO dto) {
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();

        if (dto.getPersonnelId() != null) {
            validatePersonnel(dto.getPersonnelId(), userMap);
        }

        NettoyageMaintenance intervention = NettoyageMaintenance.builder()
                .typeIntervention(dto.getTypeIntervention())
                .description(dto.getDescription())
                .chambreNumero(dto.getChambreNumero())
                .priorite(dto.getPriorite() != null ? dto.getPriorite() : Priorite.NORMALE)
                .note(dto.getNote())
                .datePlanification(dto.getDatePlanification())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusIntervention.A_FAIRE)
                .personnelId(dto.getPersonnelId())
                .build();

        return toResponse(repository.save(intervention), userMap);
    }

    /**
     * Admin full-update of an intervention.
     * Also re-validates personnelId if it changed.
     */
    public InterventionResponseDTO update(Long id, InterventionRequestDTO dto) {
        NettoyageMaintenance existing = findOrThrow(id);
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();

        if (dto.getPersonnelId() != null) {
            validatePersonnel(dto.getPersonnelId(), userMap);
        }

        existing.setTypeIntervention(dto.getTypeIntervention());
        existing.setDescription(dto.getDescription());
        existing.setChambreNumero(dto.getChambreNumero());
        existing.setPriorite(dto.getPriorite() != null ? dto.getPriorite() : existing.getPriorite());
        existing.setNote(dto.getNote());
        existing.setDatePlanification(dto.getDatePlanification());
        existing.setDateDebut(dto.getDateDebut());
        existing.setDateFin(dto.getDateFin());
        existing.setStatus(dto.getStatus() != null ? dto.getStatus() : existing.getStatus());
        existing.setPersonnelId(dto.getPersonnelId());

        return toResponse(repository.save(existing), userMap);
    }

    public void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    public List<InterventionResponseDTO> getByStatus(StatusIntervention status) {
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return repository.findByStatus(status).stream()
                .map(i -> toResponse(i, userMap))
                .collect(Collectors.toList());
    }

    public List<InterventionResponseDTO> getByType(TypeIntervention type) {
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return repository.findByTypeIntervention(type).stream()
                .map(i -> toResponse(i, userMap))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // PERSONNEL — own interventions + status update
    // ──────────────────────────────────────────────

    /**
     * Returns interventions assigned to a specific personnel member.
     * Called by the personnel portal — they only see their own tasks.
     */
    public List<InterventionResponseDTO> getByPersonnelId(Long personnelId) {
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return repository.findByPersonnelId(personnelId).stream()
                .map(i -> toResponse(i, userMap))
                .collect(Collectors.toList());
    }

    /**
     * Personnel update ONLY the status of one of their assigned interventions.
     * Prevents them from changing other fields.
     */
    public InterventionResponseDTO updateStatus(Long id, Long personnelId, StatusIntervention newStatus) {
        NettoyageMaintenance intervention = findOrThrow(id);

        if (!personnelId.equals(intervention.getPersonnelId())) {
            throw new RuntimeException("This intervention is not assigned to you.");
        }

        intervention.setStatus(newStatus);
        Map<Long, UtilisateurDTO> userMap = fetchUserMap();
        return toResponse(repository.save(intervention), userMap);
    }

    // ──────────────────────────────────────────────
    // PERSONNEL LIST (used by admin to populate dropdowns)
    // ──────────────────────────────────────────────

    /** Returns all users with role PERSONNEL from UTILISATEURS-SERVICE. */
    public List<UtilisateurDTO> getAllPersonnel() {
        return utilisateurClient.getAllUsers().stream()
                .filter(u -> "PERSONNEL".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private NettoyageMaintenance findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found with id: " + id));
    }

    /**
     * Fetches all users once and builds a lookup map by id.
     * This avoids N+1 Feign calls when enriching a list of interventions.
     */
    private Map<Long, UtilisateurDTO> fetchUserMap() {
        return utilisateurClient.getAllUsers().stream()
                .collect(Collectors.toMap(UtilisateurDTO::getIdUtilisateur, u -> u));
    }

    /**
     * Validates that the given id refers to an existing PERSONNEL user.
     * Reuses the already-fetched userMap to avoid a second Feign call.
     */
    private void validatePersonnel(Long personnelId, Map<Long, UtilisateurDTO> userMap) {
        UtilisateurDTO user = userMap.get(personnelId);
        if (user == null || !"PERSONNEL".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User " + personnelId + " not found or is not a PERSONNEL.");
        }
    }

    /** Maps an entity to the enriched response DTO using the pre-fetched user map. */
    private InterventionResponseDTO toResponse(NettoyageMaintenance i, Map<Long, UtilisateurDTO> userMap) {
        String personnelNom = null;
        if (i.getPersonnelId() != null) {
            UtilisateurDTO u = userMap.get(i.getPersonnelId());
            if (u != null) {
                personnelNom = u.getPrenom() + " " + u.getNom();
            }
        }
        return InterventionResponseDTO.builder()
                .idIntervention(i.getIdIntervention())
                .typeIntervention(i.getTypeIntervention())
                .description(i.getDescription())
                .chambreNumero(i.getChambreNumero())
                .priorite(i.getPriorite())
                .note(i.getNote())
                .datePlanification(i.getDatePlanification())
                .dateDebut(i.getDateDebut())
                .dateFin(i.getDateFin())
                .status(i.getStatus())
                .personnelId(i.getPersonnelId())
                .personnelNom(personnelNom)
                .build();
    }
}
