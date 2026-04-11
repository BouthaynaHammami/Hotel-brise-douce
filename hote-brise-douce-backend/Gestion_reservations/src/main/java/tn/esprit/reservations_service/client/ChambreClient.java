package tn.esprit.reservations_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.reservations_service.dto.ChambreDTO;

/**
 * Client Feign pour appeler chambres_service.
 *
 * - name        : correspond à spring.application.name de Gestion_chambres → "chambres_service"
 * - contextId   : obligatoire si plusieurs FeignClients existent vers le même service
 * - path        : context-path défini dans application.properties de Gestion_chambres
 *                 → server.servlet.context-path=/chambres/api
 *
 * Feign + Eureka va résoudre "chambres_service" en ip:port automatiquement.
 */
@FeignClient(
        name = "chambres-service",
        contextId = "chambreClient",
        path = "/chambres/api"
)
public interface ChambreClient {

    /**
     * Récupère les détails d'une chambre par son id.
     * Correspond à GET http://<chambres_service>/chambres/api/chambres/{id}
     */
    @GetMapping("/chambres/{id}")
    ChambreDTO getChambreById(@PathVariable("id") Long id);

    /**
     * Récupère toutes les chambres.
     * Correspond à GET http://<chambres_service>/chambres/api/chambres
     */
    @GetMapping("/chambres")
    java.util.List<ChambreDTO> getAllChambres();
}
