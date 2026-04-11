package tn.esprit.clients_service.messaging.producer;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.clients_service.dto.NotificationDTO;

@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.key";

    public void sendLoyaltyNotification(Long clientId, String message) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("LOYALTY_UPDATE")
                .idEmploye(clientId)
                .message(message)
                .build();
        
        rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, notification);
        System.out.println(" [x] Notification de fidélité envoyée pour le client : " + clientId);
    }
}
