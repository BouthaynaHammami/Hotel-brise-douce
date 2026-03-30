import { Component, EventEmitter, Output } from '@angular/core';

@Component({ selector: 'app-client-home', templateUrl: './client-home.component.html', styleUrls: ['./client-home.component.css'] })
export class ClientHomeComponent {
    @Output() navigate = new EventEmitter<string>();
    services = [
        { icon: '🍽️', name: 'Restaurant', hours: '12h–22h' },
        { icon: '♨️', name: 'Spa', hours: '9h–21h' },
        { icon: '🏊', name: 'Piscine', hours: '7h–21h' },
        { icon: '🛎️', name: 'Room Service', hours: '24h/24' }
    ];
}
