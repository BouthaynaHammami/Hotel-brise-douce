package tn.esprit.nettoyage_maintenance_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import tn.esprit.nettoyage_maintenance_service.dto.UtilisateurDTO;

import java.util.List;

@FeignClient(name = "utilisateurs-service")
public interface UtilisateurClient {

    @GetMapping("/users/internal")
    List<UtilisateurDTO> getAllUsers();
}
