import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-landing-navbar',
    templateUrl: './landing-navbar.component.html',
    styleUrls: ['./landing-navbar.component.css']
})
export class LandingNavbarComponent {
    @Output() openModal = new EventEmitter<'login' | 'register'>();

    onLogin() { this.openModal.emit('login'); }
    onReserve() { this.openModal.emit('register'); }
}
