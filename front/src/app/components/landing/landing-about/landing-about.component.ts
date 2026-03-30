import { Component } from '@angular/core';

@Component({
    selector: 'app-landing-about',
    templateUrl: './landing-about.component.html',
    styleUrls: ['./landing-about.component.css']
})
export class LandingAboutComponent {
    amenities = [
        'Spa & Bien-être', 'Restaurant Gastronomique',
        'Piscine Intérieure', 'Conciergerie 24h/24',
        'Wi-Fi Premium', 'Parking Sécurisé'
    ];
}
