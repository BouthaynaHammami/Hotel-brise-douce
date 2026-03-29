import { Component } from '@angular/core';

interface HistoryEntry { room: string; type: string; date: string; duration: string; }

@Component({ selector: 'app-personnel-history', templateUrl: './personnel-history.component.html', styleUrls: ['./personnel-history.component.css'] })
export class PersonnelHistoryComponent {
    entries: HistoryEntry[] = [
        { room: '103', type: 'Nettoyage', date: '28/03/2026 08:00', duration: '45 min' },
        { room: '215', type: 'Nettoyage', date: '27/03/2026 14:00', duration: '30 min' },
        { room: '318', type: 'Nettoyage', date: '27/03/2026 10:00', duration: '50 min' },
        { room: '101', type: 'Maintenance', date: '26/03/2026 09:30', duration: '1h 20 min' },
        { room: '407', type: 'Nettoyage', date: '25/03/2026 11:00', duration: '35 min' }
    ];
}
