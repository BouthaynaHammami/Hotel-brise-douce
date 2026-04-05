import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-header',
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
    @Input() title = 'Tableau de bord';
    @Input() subtitle = 'Bienvenue, vue générale de l\'hôtel';

    today = 'Samedi, 28 Mars 2026';

    constructor(private router: Router) { }

    logout() { this.router.navigate(['/']); }
}
