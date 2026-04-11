package tn.esprit.reservations_service.messaging.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ côté reservations_service.
 *
 * Topologie :
 * ┌──────────────────────────────────────────────┐
 * │ hotel.reservation.exchange (TopicExchange) │
 * │ │
 * │ routing key: reservation.created │
 * │ │ │
 * │ ▼ │
 * │ hotel.chambre.update.queue │
 * └──────────────────────────────────────────────┘
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.reservation}")
    private String exchangeName;

    @Value("${rabbitmq.queue.chambre.update}")
    private String queueName;

    @Value("${rabbitmq.routing.key.reservation.created}")
    private String routingKey;

    // ── Exchange ───────────────────────────────────────────────────────────
    // TopicExchange : supporte les routing keys avec wildcards (* et #)
    @Bean
    public TopicExchange reservationExchange() {
        return ExchangeBuilder
                .topicExchange(exchangeName)
                .durable(true) // survit aux redémarrages RabbitMQ
                .build();
    }

    // ── Queue ──────────────────────────────────────────────────────────────
    @Bean
    public Queue chambreUpdateQueue() {
        return QueueBuilder
                .durable(queueName) // survit aux redémarrages
                .build();
    }

    // ── Binding ────────────────────────────────────────────────────────────
    // Relie la queue à l'exchange via la routing key
    @Bean
    public Binding chambreUpdateBinding(Queue chambreUpdateQueue,
            TopicExchange reservationExchange) {
        return BindingBuilder
                .bind(chambreUpdateQueue)
                .to(reservationExchange)
                .with(routingKey);
    }

    // ── Sérialisation JSON ─────────────────────────────────────────────────
    // Sans ça, Spring envoie en binaire Java (non interopérable)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ── RabbitTemplate avec convertisseur JSON ─────────────────────────────
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

}
