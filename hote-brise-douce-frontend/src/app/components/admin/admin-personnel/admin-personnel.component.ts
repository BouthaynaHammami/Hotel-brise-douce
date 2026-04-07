import { Component } from '@angular/core';

@Component({ selector: 'app-admin-personnel', templateUrl: './admin-personnel.component.html', styleUrls: ['./admin-personnel.component.css'] })
export class AdminPersonnelComponent {
    staff = [
        { name: 'Fatima Oueldi', role: 'Femme de chambre', contact: '+33 6 11 22 33 44', tasks: 2, status: 'Actif', badge: 'badge-green' },
        { name: 'Karim Mezzi', role: 'Technicien', contact: '+33 6 55 66 77 88', tasks: 1, status: 'Actif', badge: 'badge-green' },
        { name: 'Marie Blanc', role: 'Femme de chambre', contact: '+33 7 99 88 77 66', tasks: 0, status: 'En pause', badge: 'badge-yellow' }
    ];
}
