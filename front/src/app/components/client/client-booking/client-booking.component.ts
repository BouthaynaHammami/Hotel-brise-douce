import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Room, Reservation, ReservationStatus } from '../../../core/models/room.model';
import { RoomService } from '../../../services/room.service';

@Component({ 
    selector: 'app-client-booking', 
    templateUrl: './client-booking.component.html', 
    styleUrls: ['./client-booking.component.css'] 
})
export class ClientBookingComponent implements OnInit {
    @Output() confirmed = new EventEmitter<void>();

    currentStep = 1;
    selectedRoom: Room | null = null;
    showToast = false;
    loading = false;

    // Form data
    dateArrivee: string = '';
    dateDepart: string = '';
    nombreAdultes: number = 1;
    typeChambre: string = '';
    demandes: string = '';
    acceptCGU: boolean = false;

    availableRooms: Room[] = [];
    roomTypes = ['Standard', 'Deluxe', 'Suite'];

    constructor(private roomService: RoomService) {}

    ngOnInit() {
        // Set default dates (today + 1 day for arrival, +2 days for departure)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);

        this.dateArrivee = tomorrow.toISOString().split('T')[0];
        this.dateDepart = dayAfter.toISOString().split('T')[0];
    }

    goStep(n: number) { 
        if (n === 2 && this.currentStep === 1) {
            this.searchAvailableRooms();
        }
        this.currentStep = n; 
    }

    searchAvailableRooms() {
        if (!this.dateArrivee || !this.dateDepart) {
            alert('Veuillez sélectionner les dates d\'arrivée et de départ');
            return;
        }

        this.loading = true;
        const arrivalDate = new Date(this.dateArrivee);
        const departureDate = new Date(this.dateDepart);

        this.roomService.getAvailableRooms(arrivalDate, departureDate, this.nombreAdultes)
            .subscribe(rooms => {
                // Filter by room type if selected
                this.availableRooms = this.typeChambre ? 
                    rooms.filter(room => room.typeChambre === this.typeChambre) : 
                    rooms;
                this.loading = false;
            });
    }

    selectRoom(room: Room) {
        this.selectedRoom = room;
    }

    getNights(): number {
        if (!this.dateArrivee || !this.dateDepart) return 0;
        const arrival = new Date(this.dateArrivee);
        const departure = new Date(this.dateDepart);
        const diffTime = Math.abs(departure.getTime() - arrival.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getTotalPrice(): number {
        if (!this.selectedRoom) return 0;
        return this.selectedRoom.tarifStandard * this.getNights();
    }

    canProceedToStep3(): boolean {
        return this.selectedRoom !== null;
    }

    canConfirm(): boolean {
        return this.selectedRoom !== null && this.acceptCGU;
    }

    confirm() {
        if (!this.canConfirm() || !this.selectedRoom) return;

        const reservation: Omit<Reservation, 'id' | 'dateReservation'> = {
            roomId: this.selectedRoom.numero,
            clientId: 'current-user', // This should come from auth service
            dateArrivee: new Date(this.dateArrivee),
            dateDepart: new Date(this.dateDepart),
            nombreAdultes: this.nombreAdultes,
            demandes: this.demandes,
            statut: ReservationStatus.CONFIRMEE,
            prixTotal: this.getTotalPrice()
        };

        this.roomService.makeReservation(reservation).subscribe(
            (confirmedReservation) => {
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                    this.confirmed.emit();
                }, 2000);
            },
            (error) => {
                alert('Erreur lors de la réservation. Veuillez réessayer.');
            }
        );
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }

    getRoomDisplayName(room: Room): string {
        return `Chambre ${room.numero} — ${room.typeChambre}`;
    }

    getRoomDetails(room: Room): string {
        return `Étage ${room.etage} · Capacité ${room.capacite} personnes`;
    }
}
