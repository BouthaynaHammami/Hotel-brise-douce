import { Component, EventEmitter, Output } from '@angular/core';

export interface Room {
    roman: string;
    icon: string;
    type: string;
    name: string;
    details: string;
    description: string;
    price: number;
    gradient: string;
}

@Component({
    selector: 'app-landing-rooms',
    templateUrl: './landing-rooms.component.html',
    styleUrls: ['./landing-rooms.component.css']
})
export class LandingRoomsComponent {
    @Output() openModal = new EventEmitter<'login' | 'register'>();

    rooms: Room[] = [
        {
            roman: 'I', icon: '🛏', type: 'STANDARD', name: 'Chambre Standard',
            details: '25m² · Vue jardin · 1 lit Queen',
            description: 'Confort et élégance dans un espace pensé pour votre repos.',
            price: 120,
            gradient: 'linear-gradient(135deg, #1a3a6e, #07236a)'
        },
        {
            roman: 'II', icon: '🛌', type: 'DELUXE', name: 'Chambre Deluxe',
            details: '35m² · Vue ville · 1 lit King',
            description: 'Spacieuse et lumineuse, une chambre pour les amoureux du luxe.',
            price: 185,
            gradient: 'linear-gradient(135deg, #07236a, #051a52)'
        },
        {
            roman: 'III', icon: '👑', type: 'SUITE', name: 'Suite Présidentielle',
            details: '70m² · Vue panoramique · Suite complète',
            description: 'L\'expérience ultime avec salon privé et terrasse panoramique.',
            price: 380,
            gradient: 'linear-gradient(135deg, #c9a84c, #a07a30)'
        }
    ];
}
