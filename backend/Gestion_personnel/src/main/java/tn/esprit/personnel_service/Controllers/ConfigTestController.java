package tn.esprit.personnel_service.Controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config-test")
public class ConfigTestController {

    @Value("${my.custom.config:Valeur non trouvee}")
    private String customConfig;

    @GetMapping
    public String getConfig() {
        return "Message du Config Server : " + customConfig;
    }
}
