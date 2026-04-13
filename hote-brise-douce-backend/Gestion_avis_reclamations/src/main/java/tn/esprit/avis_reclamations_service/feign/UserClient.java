package tn.esprit.avis_reclamations_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.avis_reclamations_service.dto.UserDTO;

import java.util.List;

@FeignClient(
        name = "utilisateurs",
        contextId = "userClient",
        url = "http://utilisateurs:8000",
        path = "/users"
)
public interface UserClient {

    @GetMapping
    List<UserDTO> getAllUsers();

    @GetMapping("/{user_id}")
    UserDTO getUserById(@PathVariable("user_id") Long user_id);
}