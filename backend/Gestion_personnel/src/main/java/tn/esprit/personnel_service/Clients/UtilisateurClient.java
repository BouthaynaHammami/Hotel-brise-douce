package tn.esprit.personnel_service.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.personnel_service.DTO.UtilisateurDTO;

import java.util.List;

// On utilise le nom d'enregistrement du service utilisateur sous Eureka
@FeignClient(name = "gestion-utilisateurs")
public interface UtilisateurClient {

    @GetMapping("/users/{user_id}")
    UtilisateurDTO getUtilisateurById(@PathVariable("user_id") Long idUtilisateur);

    @GetMapping("/users")
    List<UtilisateurDTO> getAllUtilisateurs();
}
