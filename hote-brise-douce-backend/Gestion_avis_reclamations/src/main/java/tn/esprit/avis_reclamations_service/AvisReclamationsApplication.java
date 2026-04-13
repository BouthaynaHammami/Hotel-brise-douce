package tn.esprit.avis_reclamations_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import tn.esprit.avis_reclamations_service.config.FeignConfig;

@SpringBootApplication
@EnableFeignClients(
        basePackages = "tn.esprit.avis_reclamations_service.feign",
        defaultConfiguration = FeignConfig.class
)
public class AvisReclamationsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AvisReclamationsApplication.class, args);
    }
}
