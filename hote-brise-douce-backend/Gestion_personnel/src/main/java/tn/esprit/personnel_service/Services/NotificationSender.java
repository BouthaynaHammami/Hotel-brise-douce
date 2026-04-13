package tn.esprit.personnel_service.Services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.personnel_service.Config.RabbitMQConfig;
import tn.esprit.personnel_service.DTO.NotificationDTO;

@Service
public class NotificationSender {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendLeaveStatusUpdate(Long idEmploye, Long idConge, String type, String dateD, String dateF, String statut) {
        String msg = String.format("Votre demande de congé (%s) du %s au %s est désormais : %s.", 
                type, dateD, dateF, statut.replace("EN_ATTENTE", "En Attente").replace("APPROUVE", "Approuvé").replace("REFUSE", "Refusé"));

        NotificationDTO notification = NotificationDTO.builder()
                .type("LEAVE_STATUS")
                .idEmploye(idEmploye)
                .idObjet(idConge)
                .message(msg)
                .build();
        
        send(notification);
        System.out.println("Notification de congé enrichie envoyée pour l'employé : " + idEmploye);
    }

    public void sendLeaveAdvanceNotification(Long idEmploye, Long idConge, String montant, String typeConge) {
        String msg = String.format("Vous avez demandé une avance de %s DT pour votre congé (%s). Demande en cours de traitement.", 
                montant, typeConge);

        NotificationDTO notification = NotificationDTO.builder()
                .type("LEAVE_ADVANCE")
                .idEmploye(idEmploye)
                .idObjet(idConge)
                .message(msg)
                .build();
        
        send(notification);
        System.out.println("Notification d'avance de congé envoyée pour l'employé : " + idEmploye + " - Montant: " + montant);
    }

    private void send(NotificationDTO notification) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                notification
        );
    }
}
