import { Component, ViewChild } from '@angular/core';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
    @ViewChild(AuthModalComponent) authModal!: AuthModalComponent;

    openModal(tab: 'login' | 'register' = 'login') {
        this.authModal.open(tab);
    }
}
