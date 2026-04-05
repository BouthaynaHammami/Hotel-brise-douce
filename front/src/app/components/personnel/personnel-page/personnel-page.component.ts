import { Component } from '@angular/core';

export type PersonnelSection = 'mes-taches' | 'historique' | 'conges' | 'profil';

@Component({ selector: 'app-personnel-page', templateUrl: './personnel-page.component.html', styleUrls: ['./personnel-page.component.css'] })
export class PersonnelPageComponent {
    activeSection: PersonnelSection = 'mes-taches';

    onSectionChange(section: PersonnelSection) { this.activeSection = section; }
}
