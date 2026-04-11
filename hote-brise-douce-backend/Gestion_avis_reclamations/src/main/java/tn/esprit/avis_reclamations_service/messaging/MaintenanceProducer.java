package tn.esprit.avis_reclamations_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.avis_reclamations_service.config.RabbitMQConfig;
import tn.esprit.avis_reclamations_service.dto.MaintenanceEventDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceProducer {

    private final RabbitTemplate rabbitTemplate;

    public void envoyerTacheMaintenance(MaintenanceEventDTO event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.MAINTENANCE_QUEUE, event);
            log.info("Tâche maintenance envoyée pour chambre : {}", event.getNumeroChambre());
        } catch (AmqpException e) {
            log.error("Erreur envoi RabbitMQ vers maintenance", e);
            throw e;
        }
    }
}