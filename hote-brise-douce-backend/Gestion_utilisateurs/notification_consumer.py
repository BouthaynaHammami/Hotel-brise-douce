import pika
import json
import time
import os
from database import SessionLocal
import models, crud

def callback(ch, method, properties, body):
    # Log the receipt of a message
    print(f"\n [x] Message reçu de RabbitMQ : {body.decode()}")
    try:
        data = json.loads(body)
        user_id = data.get("idEmploye")
        notif_type = data.get("type")
        message_body = data.get("message")
        
        # Determine display title based on type
        if notif_type == "TASK_ASSIGNED":
            titre_display = "Nouvelle Tâche"
        elif notif_type == "TASK_STATUS":
            titre_display = "Évolution de Tâche"
        elif notif_type == "LEAVE_STATUS":
            titre_display = "Mise à jour Congé"
        elif notif_type == "LEAVE_ADVANCE":
            titre_display = "Demande d'Avance"
        else:
            titre_display = "Notification"

        # Create a new DB session for this thread's operation
        db = SessionLocal()
        try:
            user = db.query(models.Utilisateur).filter(models.Utilisateur.idUtilisateur == user_id).first()
            
            if user:
                print(f" [!] Enregistrement notification ({notif_type}) pour : {user.prenom} {user.nom}")
                crud.create_notification(db, user_id, titre_display, message_body)
                print(f" [OK] Notification enregistrée avec succès.")
            else:
                print(f" [?] Utilisateur ID {user_id} non trouvé. Impossible d'enregistrer la notification.")
            
            db.commit()
        except Exception as db_err:
            db.rollback()
            print(f" [ERROR] Erreur base de données : {db_err}")
        finally:
            db.close()
            
    except Exception as e:
        print(f" [ERROR] Erreur lors du traitement JSON : {e}")

def start_consumer():
    """
    Starts the RabbitMQ consumer. 
    This function is intended to be run in a background thread.
    """
    print(" [*] Initialisation du consommateur de notifications RabbitMQ...")
    
    # Get RabbitMQ connection parameters from environment
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    
    while True:
        try:
            # Connect to RabbitMQ with environment variables
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD),
                    heartbeat=600
                )
            )
            channel = connection.channel()

            # Declare exchange and queue to ensure they exist (durable=True to match Java)
            channel.exchange_declare(exchange='notification.exchange', exchange_type='topic', durable=True)
            channel.queue_declare(queue='notification.queue', durable=True)
            channel.queue_bind(exchange='notification.exchange', queue='notification.queue', routing_key='notification.key')

            channel.basic_consume(queue='notification.queue', on_message_callback=callback, auto_ack=True)

            print(" [READY] Consommateur RabbitMQ en attente de messages...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            print(" [!] Connexion à RabbitMQ échouée. Nouvelle tentative dans 10 secondes...")
            time.sleep(10)
        except Exception as general_err:
            print(f" [!] Erreur consommateur : {general_err}. Redémarrage...")
            time.sleep(5)

if __name__ == '__main__':
    start_consumer()
