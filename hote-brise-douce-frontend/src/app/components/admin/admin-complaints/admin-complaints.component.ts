import { Component } from '@angular/core';

@Component({ selector: 'app-admin-complaints', templateUrl: './admin-complaints.component.html', styleUrls: ['./admin-complaints.component.css'] })
export class AdminComplaintsComponent {
    complaints = [
        { ref: '#R023', client: 'M. Laurent', room: '204', subject: 'Climatisation défectueuse', date: '28/03', priority: 'Urgent', priBadge: 'badge-red', status: 'En cours', stBadge: 'badge-yellow' },
        { ref: '#R022', client: 'Mme. Martin', room: '118', subject: 'Nuisances sonores', date: '27/03', priority: 'Normal', priBadge: 'badge-yellow', status: 'En attente', stBadge: 'badge-yellow' },
        { ref: '#R021', client: 'M. Benali', room: '301', subject: 'Service petit-déjeuner tardif', date: '26/03', priority: 'Normal', priBadge: 'badge-yellow', status: 'Résolu', stBadge: 'badge-green' }
    ];
}
