import { Component } from '@angular/core';

@Component({ selector: 'app-admin-clients', templateUrl: './admin-clients.component.html', styleUrls: ['./admin-clients.component.css'] })
export class AdminClientsComponent {
    clients = [
        { name: 'M. Pierre Laurent', email: 'p.laurent@email.fr', phone: '+33 6 12 34 56 78', stays: 5, status: 'Actif', badge: 'badge-green' },
        { name: 'Mme. Sophie Martin', email: 's.martin@email.fr', phone: '+33 7 98 76 54 32', stays: 2, status: 'Actif', badge: 'badge-green' },
        { name: 'M. Ahmed Benali', email: 'a.benali@email.fr', phone: '+33 6 55 44 33 22', stays: 8, status: 'VIP', badge: 'badge-yellow' },
        { name: 'Mme. Claire Dubois', email: 'c.dubois@email.fr', phone: '+33 6 11 22 33 44', stays: 1, status: 'Inactif', badge: 'badge-red' }
    ];
    search = '';
}
