package tn.esprit.clients_service.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.clients_service.enums.Niveau;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fidelite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long clientId;

    private int points;

    @Enumerated(EnumType.STRING)
    private Niveau niveau;

    private LocalDateTime dateDerniereMaj;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        dateDerniereMaj = LocalDateTime.now();
    }
}
