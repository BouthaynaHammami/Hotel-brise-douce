package tn.esprit.personnel_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PersonnelApplication {
    public static void main(String[] args) {
        SpringApplication.run(PersonnelApplication.class, args);
    }
}
