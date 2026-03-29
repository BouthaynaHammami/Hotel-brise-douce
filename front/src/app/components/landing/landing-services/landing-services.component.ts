import { Component } from '@angular/core';

@Component({
    selector: 'app-landing-services',
    templateUrl: './landing-services.component.html',
    styleUrls: ['./landing-services.component.css']
})
export class LandingServicesComponent {
    services = [
        { icon: '🍽️', name: 'Restaurant', hours: 'Ouvert midi & soir' },
        { icon: '♨️', name: 'Spa & Hammam', hours: '9h – 22h' },
        { icon: '🏊', name: 'Piscine', hours: '7h – 21h' },
        { icon: '🎾', name: 'Sport & Fitness', hours: '24h/24' },
        { icon: '🚗', name: 'Voiturier', hours: 'Inclus' },
        { icon: '🛎️', name: 'Room Service', hours: '24h/24' },
        { icon: '✈️', name: 'Transfert Aéroport', hours: 'Sur réservation' },
        { icon: '📶', name: 'Wi-Fi Premium', hours: 'Gratuit' }
    ];
}
