package tn.esprit.avis_reclamations_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.avis_reclamations_service.dto.ChambreDTO;

/**
 * Client Feign pour appeler chambres-service via Eureka.
 *
 * - name : correspond à spring.application.name du Gestion_chambres → "chambres-service"
 * - path : correspond au context-path → /chambres/api
 */
@FeignClient(
        name = "chambres-service",
        contextId = "chambreClientReclamation",
        path = "/chambres/api"
)
public interface ChambreClient {

    /**
     * Récupère les détails d'une chambre par son id.
     * Correspond à GET http://<chambres-service>/chambres/api/chambres/{id}
     */
    @GetMapping("/chambres/{id}")
    ChambreDTO getChambreById(@PathVariable("id") Long id);
}
