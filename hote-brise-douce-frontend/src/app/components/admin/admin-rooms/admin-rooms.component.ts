import { Component } from '@angular/core';

@Component({ selector: 'app-admin-rooms', templateUrl: './admin-rooms.component.html', styleUrls: ['./admin-rooms.component.css'] })
export class AdminRoomsComponent {
    filter = 'all';
    rooms = [
        { num: '101', type: 'Standard · 1 lit', status: 'Disponible', badge: 'badge-green', border: 'border-green-400' },
        { num: '102', type: 'Standard · 2 lits', status: 'Occupée', badge: 'badge-blue', border: 'border-blue-400' },
        { num: '103', type: 'Deluxe · 1 lit King', status: 'Nettoyage', badge: 'badge-yellow', border: 'border-yellow-400' },
        { num: '201', type: 'Suite · Vue panorama', status: 'Occupée', badge: 'badge-blue', border: 'border-blue-400' },
        { num: '202', type: 'Standard · 2 lits', status: 'Maintenance', badge: 'badge-red', border: 'border-red-400' },
        { num: '203', type: 'Deluxe · 1 lit', status: 'Disponible', badge: 'badge-green', border: 'border-green-400' },
        { num: '204', type: 'Standard · 1 lit', status: 'Occupée', badge: 'badge-blue', border: 'border-blue-400' },
        { num: '301', type: 'Suite Présidentielle', status: 'Disponible', badge: 'badge-green', border: 'border-green-400' }
    ];
}
