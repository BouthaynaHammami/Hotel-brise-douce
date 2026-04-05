import { Component } from '@angular/core';
import { ClientPage } from '../client-nav/client-nav.component';

@Component({ selector: 'app-client-page', templateUrl: './client-page.component.html', styleUrls: ['./client-page.component.css'] })
export class ClientPageComponent {
    activePage: ClientPage = 'accueil';

    onPageChange(page: ClientPage) { this.activePage = page; }
    onReservationConfirmed() { this.activePage = 'mes-reservations'; }
}
