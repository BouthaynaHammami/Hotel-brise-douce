import { Component } from '@angular/core';

const SECTION_TITLES: { [key: string]: string } = {
    dashboard: 'Tableau de bord',
    clients: 'Gestion des Clients',
    chambres: 'Gestion des Chambres',
    reservations: 'Gestion des Réservations',
    nettoyage: 'Nettoyage & Maintenance',
    personnel: 'Gestion du Personnel',
    reclamations: 'Gestion des Réclamations',
    utilisateurs: 'Gestion des Utilisateurs'
};

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent {
    activeSection = 'dashboard';

    get title() { return SECTION_TITLES[this.activeSection] ?? ''; }

    onSectionChange(id: string) { this.activeSection = id; }
}
