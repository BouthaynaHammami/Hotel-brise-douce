import { Component } from '@angular/core';

@Component({ selector: 'app-admin-reservations', templateUrl: './admin-reservations.component.html', styleUrls: ['./admin-reservations.component.css'] })
export class AdminReservationsComponent {
    reservations = [
        { ref: '#1042', client: 'M. Laurent', room: '204', arrival: '28/03/2026', departure: '02/04/2026', amount: '600€', status: 'Confirmée', badge: 'badge-green' },
        { ref: '#1041', client: 'Mme. Martin', room: '102', arrival: '27/03/2026', departure: '30/03/2026', amount: '360€', status: 'En cours', badge: 'badge-blue' },
        { ref: '#1040', client: 'M. Benali', room: 'Suite 301', arrival: '30/03/2026', departure: '05/04/2026', amount: '2 280€', status: 'En attente', badge: 'badge-yellow' }
    ];
}
