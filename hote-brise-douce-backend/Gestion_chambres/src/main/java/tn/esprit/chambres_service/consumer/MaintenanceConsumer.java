package tn.esprit.chambres_service.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.chambres_service.config.RabbitMQConfig;
import tn.esprit.chambres_service.dto.RoomStatusEventDTO;
import tn.esprit.chambres_service.Services.IServices.IChambreService;
import tn.esprit.chambres_service.Entities.Etat;

@Service
@Slf4j
@RequiredArgsConstructor
public class MaintenanceConsumer {
    private final IChambreService service;

    @RabbitListener(queues = RabbitMQConfig.ROOM_STATUS_QUEUE)
    public void receiveRoomStatusUpdate(RoomStatusEventDTO event) {
        log.info("Received room status update event via RabbitMQ: Room {} -> {}", event.getRoomId(), event.getStatus());
        try {
            // Convert string status to Etat enum
            Etat newEtat = Etat.valueOf(event.getStatus().toUpperCase());
            service.updateRoomStatus(event.getRoomId(), newEtat);
            log.info("Successfully synchronized room {} status to {}", event.getRoomId(), newEtat);
        } catch (Exception e) {
            log.error("Error processing RabbitMQ room status update for room {}: {}", event.getRoomId(), e.getMessage());
        }
    }
}
