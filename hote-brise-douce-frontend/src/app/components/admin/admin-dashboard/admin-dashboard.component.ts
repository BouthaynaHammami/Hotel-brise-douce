import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
    stats = [
        { label: 'Chambres occupées', value: '64', suffix: '/87', color: 'var(--navy)' },
        { label: 'Réservations aujourd\'hui', value: '12', suffix: '', color: 'var(--navy)' },
        { label: 'Réclamations ouvertes', value: '3', suffix: '', color: '#ef4444' },
        { label: 'Tâches en attente', value: '7', suffix: '', color: '#eab308' }
    ];

    activities = [
        { color: 'bg-green-400', text: 'Chambre 204 — Check-in M. Laurent', time: '10:23' },
        { color: 'bg-red-400', text: 'Réclamation — Chambre 118 (bruit)', time: '09:47' },
        { color: 'bg-yellow-400', text: 'Nettoyage assigné — Chambre 305', time: '09:12' },
        { color: 'bg-blue-400', text: 'Nouvelle réservation — Suite 401', time: '08:55' }
    ];

    roomStates = [
        { label: 'Occupées', count: 64, pct: 74, color: 'bg-blue-500' },
        { label: 'Disponibles', count: 16, pct: 18, color: 'bg-green-400' },
        { label: 'Maintenance', count: 7, pct: 8, color: 'bg-yellow-400' }
    ];
}
