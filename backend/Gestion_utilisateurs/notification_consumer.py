import pika
import json
import time
from sqlalchemy.orm import Session
from database import SessionLocal
import models, crud

def callback(ch, method, properties, body):
    print(f" [x] Message reçu de RabbitMQ : {body.decode()}")
    try:
        data = json.loads(body)
        user_id = data.get("idEmploye")
        notif_type = data.get("type")
        message_body = data.get("message")
        
        # Déterminer le titre en fonction du type
        if notif_type == "TASK_ASSIGNED":
            titre_display = "Nouvelle Tâche"
        elif notif_type == "LEAVE_STATUS":
            titre_display = "Mise à jour Congé"
        else:
            titre_display = "Notification"

        # Connexion à la DB pour récupérer les infos de l'utilisateur
        db = SessionLocal()
        user = db.query(models.Utilisateur).filter(models.Utilisateur.idUtilisateur == user_id).first()
        
        if user:
            print(f" [!] Notification ({notif_type}) pour : {user.prenom} {user.nom}")
            print(f" [>] Message : {message_body}")
            
            # Sauvegarde en base de données
            crud.create_notification(db, user_id, titre_display, message_body)
            print(f" [OK] Notification enregistrée en base de données.")
        else:
            print(f" [?] Utilisateur avec l'ID {user_id} non trouvé dans Gestion_utilisateurs")
        
        db.close()
    except Exception as e:
        print(f" [ERROR] Erreur lors du traitement du message : {e}")

def main():
    print(" [*] En attente de notifications. Appuyez sur CTRL+C pour quitter.")
    
    # Tentative de connexion avec retry (utile si RabbitMQ démarre en même temps)
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
            channel = connection.channel()

            # Déclaration de l'échange et de la file (doit correspondre à la config Java : durable=True)
            channel.exchange_declare(exchange='notification.exchange', exchange_type='topic', durable=True)
            channel.queue_declare(queue='notification.queue', durable=True)
            channel.queue_bind(exchange='notification.exchange', queue='notification.queue', routing_key='notification.key')

            channel.basic_consume(queue='notification.queue', on_message_callback=callback, auto_ack=True)

            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            print(" [!] Connexion à RabbitMQ échouée... Nouvelle tentative dans 5 secondes.")
            time.sleep(5)
        except KeyboardInterrupt:
            print(" [!] Arrêt du consommateur.")
            break

if __name__ == '__main__':
    main()
