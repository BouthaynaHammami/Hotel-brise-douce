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

    public void sendTaskAssignment(Long idEmploye, Long idTache, String titre) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("TASK_ASSIGNED")
                .idEmploye(idEmploye)
                .idObjet(idTache)
                .message("Une nouvelle tâche vous a été assignée : " + titre)
                .build();
        
        send(notification);
        System.out.println("Notification de tâche envoyée pour l'employé : " + idEmploye);
    }

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

    private void send(NotificationDTO notification) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                notification
        );
    }
}
