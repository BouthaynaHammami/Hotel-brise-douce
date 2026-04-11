package tn.esprit.nettoyage_maintenance_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.nettoyage_maintenance_service.dto.ChambreDTO;

@FeignClient(name = "chambres-service", path = "/chambres/api/chambres")
public interface ChambreClient {

    @GetMapping("/numero/{numero}")
    ChambreDTO getChambreByNumero(@PathVariable("numero") String numero);
}
