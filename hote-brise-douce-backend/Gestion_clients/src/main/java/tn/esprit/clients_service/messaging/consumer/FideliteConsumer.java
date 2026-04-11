package tn.esprit.clients_service.messaging.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tn.esprit.clients_service.entity.Fidelite;
import tn.esprit.clients_service.enums.Niveau;
import tn.esprit.clients_service.messaging.event.ReservationCreatedEvent;
import tn.esprit.clients_service.service.FideliteService;

import tn.esprit.clients_service.messaging.producer.NotificationProducer;

@Component
@RequiredArgsConstructor
@Slf4j
public class FideliteConsumer {

    private final FideliteService fideliteService;
    private final NotificationProducer notificationProducer;

    @RabbitListener(queues = "${rabbitmq.queue.loyalty:loyalty.reservation.queue}")
    public void consumeReservationEvent(ReservationCreatedEvent event) {
        log.info("[RabbitMQ][CONSUMER] 📩 Événement reçu pour reservationId={}", event.getReservationId());
        
        try {
            Fidelite f = fideliteService.getFideliteByClientId(event.getClientId());
            double multiplier = fideliteService.getMultiplierForNiveau(f.getNiveau());
            
            // Conversion du montant total en points selon le niveau
            int pointsAAttribuer = (int) Math.round(event.getMontantTotal() * multiplier);
            
            if (pointsAAttribuer > 0) {
                Niveau ancienNiveau = fideliteService.ajouterPoints(event.getClientId(), pointsAAttribuer);
                log.info("[RabbitMQ][CONSUMER] ✅ Points ajoutés (+{}%): {} pour clientId={}", (int)(multiplier*100), pointsAAttribuer, event.getClientId());

                // 1. Notification Gain de points
                String msgPoints = String.format("Félicitations ! Vous avez gagné %d points grâce à votre réservation #%d.", 
                        pointsAAttribuer, event.getReservationId());
                notificationProducer.sendLoyaltyNotification(event.getClientId(), msgPoints);

                // 2. Notification Changement de Niveau (Level Up)
                Fidelite updated = fideliteService.getFideliteByClientId(event.getClientId());
                if (updated.getNiveau() != ancienNiveau) {
                    String msgLevel = String.format("🚀 Incroyable ! Vous avez atteint le niveau %s ! Découvrez vos nouveaux avantages dans l'onglet 'Mes Avantages'.", 
                            updated.getNiveau());
                    notificationProducer.sendLoyaltyNotification(event.getClientId(), msgLevel);
                }
            } else {
                log.warn("[RabbitMQ][CONSUMER] ⚠️ Aucun point à ajouter (montant trop faible ou nul)");
            }
        } catch (Exception e) {
            log.error("[RabbitMQ][CONSUMER] ❌ Erreur lors du traitement de l'événement: {}", e.getMessage());
        }
    }
}
