package tn.esprit.clients_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queue.loyalty:loyalty.reservation.queue}")
    private String queue;

    @Value("${rabbitmq.exchange.reservation:hotel.reservation.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing.key.reservation.created:reservation.created}")
    private String routingKey;

    @Bean
    public Queue loyaltyQueue() {
        return new Queue(queue);
    }

    @Bean
    public TopicExchange reservationExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Binding binding() {
        return BindingBuilder
                .bind(loyaltyQueue())
                .to(reservationExchange())
                .with(routingKey);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange("notification.exchange");
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate template(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}
