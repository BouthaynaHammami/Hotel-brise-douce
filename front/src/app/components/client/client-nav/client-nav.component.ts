import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ClientPage = 'accueil' | 'reservation' | 'mes-reservations' | 'reclamation';

@Component({ selector: 'app-client-nav', templateUrl: './client-nav.component.html', styleUrls: ['./client-nav.component.css'] })
export class ClientNavComponent {
    @Input() activePage: ClientPage = 'accueil';
    @Output() pageChange = new EventEmitter<ClientPage>();

    tabs: { id: ClientPage; label: string }[] = [
        { id: 'accueil', label: 'Accueil' },
        { id: 'reservation', label: 'Faire une réservation' },
        { id: 'mes-reservations', label: 'Mes réservations' },
        { id: 'reclamation', label: 'Réclamation' }
    ];
}
