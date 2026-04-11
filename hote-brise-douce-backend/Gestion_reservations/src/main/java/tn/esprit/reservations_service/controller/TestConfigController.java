package tn.esprit.reservations_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test-config")
@RefreshScope
public class TestConfigController {

    @Value("${metier.avance}")
    private double avance;

    @Value("${metier.message}")
    private String message;

    @GetMapping
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("metier_avance", avance);
        config.put("metier_message", message);
        return config;
    }
}
