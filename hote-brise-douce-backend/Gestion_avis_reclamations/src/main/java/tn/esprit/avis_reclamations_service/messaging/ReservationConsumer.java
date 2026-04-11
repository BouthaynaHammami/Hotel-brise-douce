package tn.esprit.avis_reclamations_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.avis_reclamations_service.Repo.ReservationInfoRepository;
import tn.esprit.avis_reclamations_service.config.RabbitMQConfig;
import tn.esprit.avis_reclamations_service.dto.ReservationEventDTO;
import tn.esprit.avis_reclamations_service.entite.ReservationInfo;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationConsumer {

    private final ReservationInfoRepository reservationInfoRepository;

    @RabbitListener(
            queues = RabbitMQConfig.RESERVATION_QUEUE,
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void receiveReservation(ReservationEventDTO dto) {
        log.info("Réservation reçue depuis RabbitMQ : id={}",
                dto.getIdReservation());

        ReservationInfo info = ReservationInfo.builder()
                .idReservation(dto.getIdReservation())
                .idClient(dto.getIdClient())
                .numeroChambre(dto.getNumeroChambre())
                .dateArrivee(dto.getDateArrivee())
                .dateDepart(dto.getDateDepart())
                .build();

        reservationInfoRepository.save(info);
        log.info("Chambre {} enregistrée localement pour réservation {}",
                dto.getNumeroChambre(), dto.getIdReservation());
    }
}