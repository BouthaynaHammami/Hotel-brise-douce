import { Component } from '@angular/core';

@Component({
    selector: 'app-landing-stats',
    templateUrl: './landing-stats.component.html',
    styleUrls: ['./landing-stats.component.css']
})
export class LandingStatsComponent {
    stats = [
        { value: '87', label: 'Chambres' },
        { value: '37', label: 'Années d\'expérience' },
        { value: '5★', label: 'Étoiles' },
        { value: '98%', label: 'Satisfaction' }
    ];
}
