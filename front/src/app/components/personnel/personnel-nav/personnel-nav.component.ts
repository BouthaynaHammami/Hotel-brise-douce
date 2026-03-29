import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PersonnelSection } from '../personnel-page/personnel-page.component';

@Component({ selector: 'app-personnel-nav', templateUrl: './personnel-nav.component.html', styleUrls: ['./personnel-nav.component.css'] })
export class PersonnelNavComponent {
    @Input() activeSection: PersonnelSection = 'mes-taches';
    @Output() sectionChange = new EventEmitter<PersonnelSection>();

    tabs: { id: PersonnelSection; label: string }[] = [
        { id: 'mes-taches', label: 'Mes tâches' },
        { id: 'historique', label: 'Historique' },
        { id: 'profil', label: 'Mon profil' }
    ];
}
