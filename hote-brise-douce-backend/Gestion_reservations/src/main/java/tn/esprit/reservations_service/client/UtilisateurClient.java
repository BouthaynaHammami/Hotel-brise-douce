package tn.esprit.reservations_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.reservations_service.dto.UtilisateurDTO;

@FeignClient(name = "utilisateurs-service", contextId = "utilisateurs-client")
public interface UtilisateurClient {

    @GetMapping("/users/{id}")
    UtilisateurDTO getUserById(@PathVariable("id") Long id);

}
