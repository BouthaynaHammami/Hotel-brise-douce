import { Component } from '@angular/core';

@Component({
    selector: 'app-landing-contact',
    templateUrl: './landing-contact.component.html',
    styleUrls: ['./landing-contact.component.css']
})
export class LandingContactComponent {
    contacts = [
        { icon: '📍', label: 'Adresse', lines: ['12 Avenue de la République', '75001 Paris, France'] },
        { icon: '📞', label: 'Téléphone', lines: ['+33 1 23 45 67 89', 'Disponible 24h/24'] },
        { icon: '✉️', label: 'Email', lines: ['contact@bricedouce.fr', 'Réponse sous 2h'] }
    ];
}
