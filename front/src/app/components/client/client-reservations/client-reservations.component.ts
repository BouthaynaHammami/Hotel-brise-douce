import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationStatus, Room } from '../../../core/models/room.model';
import { RoomService } from '../../../services/room.service';

@Component({ 
    selector: 'app-client-reservations', 
    templateUrl: './client-reservations.component.html', 
    styleUrls: ['./client-reservations.component.css'] 
})
export class ClientReservationsComponent implements OnInit {
    reservations: Reservation[] = [];
    rooms: Room[] = [];
    loading = true;

    constructor(private roomService: RoomService) {}

    ngOnInit() {
        this.loadReservations();
        this.loadRooms();
    }

    loadReservations() {
        this.roomService.getReservations().subscribe(reservations => {
            // Filter reservations for current user (in a real app, this would be filtered by user ID)
            this.reservations = reservations;
            this.loading = false;
        });
    }

    loadRooms() {
        this.roomService.getRooms().subscribe(rooms => {
            this.rooms = rooms;
        });
    }

    getRoomInfo(roomId: string): Room | undefined {
        return this.rooms.find(room => room.numero === roomId);
    }

    getStatusBadge(status: ReservationStatus): string {
        switch (status) {
            case ReservationStatus.CONFIRMEE: return 'badge-green';
            case ReservationStatus.EN_ATTENTE: return 'badge-yellow';
            case ReservationStatus.ANNULEE: return 'badge-red';
            case ReservationStatus.TERMINEE: return 'bg-gray-100 text-gray-500';
            default: return 'badge-gray';
        }
    }

    getStatusLabel(status: ReservationStatus): string {
        switch (status) {
            case ReservationStatus.CONFIRMEE: return 'Confirmée';
            case ReservationStatus.EN_ATTENTE: return 'En attente';
            case ReservationStatus.ANNULEE: return 'Annulée';
            case ReservationStatus.TERMINEE: return 'Terminée';
            default: return status;
        }
    }

    canCancel(reservation: Reservation): boolean {
        const today = new Date();
        const arrivalDate = new Date(reservation.dateArrivee);
        const daysDifference = Math.ceil((arrivalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return reservation.statut === ReservationStatus.CONFIRMEE && daysDifference > 1;
    }

    formatDateRange(dateArrivee: Date, dateDepart: Date): string {
        const arrival = new Date(dateArrivee);
        const departure = new Date(dateDepart);
        const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
        
        const arrivalStr = arrival.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const departureStr = departure.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return `${arrivalStr} → ${departureStr} · ${nights} nuit${nights > 1 ? 's' : ''}`;
    }

    getRoomDisplayName(roomId: string): string {
        const room = this.getRoomInfo(roomId);
        return room ? `Chambre ${room.numero} — ${room.typeChambre}` : `Chambre ${roomId}`;
    }

    cancelReservation(reservation: Reservation) {
        if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            // In a real app, this would call a cancel reservation API
            console.log('Cancelling reservation:', reservation.id);
            // For now, just update the status locally
            reservation.statut = ReservationStatus.ANNULEE;
        }
    }
}
