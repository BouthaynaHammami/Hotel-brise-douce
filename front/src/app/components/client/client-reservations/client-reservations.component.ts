import { Component } from '@angular/core';

@Component({ selector: 'app-client-reservations', templateUrl: './client-reservations.component.html', styleUrls: ['./client-reservations.component.css'] })
export class ClientReservationsComponent {
    reservations = [
        { room: 'Chambre 204 — Deluxe', status: 'En cours', badge: 'badge-blue', ref: '#1042', amount: '600€', pax: '2 adultes', dates: '28 Mars → 2 Avril 2026 · 5 nuits', canCancel: false },
        { room: 'Suite 301 — Présidentielle', status: 'À venir', badge: 'badge-yellow', ref: '#1055', amount: '1 900€', pax: '2 adultes', dates: '15 → 20 Mai 2026 · 5 nuits', canCancel: true },
        { room: 'Chambre 102 — Standard', status: 'Passé', badge: 'bg-gray-100 text-gray-500', ref: '#0998', amount: '480€', pax: '', dates: '10 → 14 Janvier 2026 · 4 nuits', canCancel: false }
    ];
}
