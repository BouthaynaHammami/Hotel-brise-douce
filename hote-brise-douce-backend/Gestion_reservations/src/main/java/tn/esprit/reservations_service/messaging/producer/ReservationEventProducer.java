package tn.esprit.reservations_service.messaging.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tn.esprit.reservations_service.messaging.event.ReservationCreatedEvent;

/**
 * Producer RabbitMQ — publie un événement ReservationCreatedEvent
 * dans l'exchange chaque fois qu'une réservation est créée.
 *
 * Le message est sérialisé en JSON grâce au Jackson2JsonMessageConverter
 * configuré dans RabbitMQConfig.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.reservation}")
    private String exchange;

    @Value("${rabbitmq.routing.key.reservation.created}")
    private String routingKey;

    /**
     * Publie l'événement dans RabbitMQ de façon asynchrone (fire-and-forget).
     * Si RabbitMQ est indisponible, on loggue l'erreur sans bloquer la réponse HTTP.
     */
    public void publishReservationCreated(ReservationCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("[RabbitMQ][PRODUCER] ✅ Événement publié → exchange='{}' routingKey='{}' reservationId={}",
                    exchange, routingKey, event.getReservationId());
        } catch (Exception e) {
            log.error("[RabbitMQ][PRODUCER] ❌ Échec publication événement reservationId={} : {}",
                    event.getReservationId(), e.getMessage());
        }
    }
}
