package tn.esprit.nettoyage_maintenance_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class NettoyageMaintenanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NettoyageMaintenanceApplication.class, args);
    }
}
