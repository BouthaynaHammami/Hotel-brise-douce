import { Component } from '@angular/core';

@Component({ selector: 'app-personnel-profile', templateUrl: './personnel-profile.component.html', styleUrls: ['./personnel-profile.component.css'] })
export class PersonnelProfileComponent {
    phone = '+33 6 11 22 33 44';
    newPassword = '';
    confirmPassword = '';

    stats = [
        { value: '127', color: '', label: 'Tâches réalisées au total', style: 'color:var(--navy)' },
        { value: '98%', color: 'text-green-500', label: 'Taux de satisfaction', style: '' },
        { value: '4.8★', color: '', label: 'Note moyenne', style: 'color:var(--gold)' }
    ];

    save() {
        alert('Modifications enregistrées !');
    }
}
