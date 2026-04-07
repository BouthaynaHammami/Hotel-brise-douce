import { Component, EventEmitter, Output } from '@angular/core';

@Component({ selector: 'app-client-booking', templateUrl: './client-booking.component.html', styleUrls: ['./client-booking.component.css'] })
export class ClientBookingComponent {
    @Output() confirmed = new EventEmitter<void>();

    currentStep = 1;
    selectedRoom = 0;
    showToast = false;

    rooms = [
        { name: 'Chambre 101 — Standard', details: '25m² · Vue jardin · 1 lit Queen · 2e étage', amenities: ['📶 Wi-Fi', '❄️ Clim', '📺 TV', '☕ Mini-bar'], price: 120 },
        { name: 'Chambre 203 — Deluxe', details: '35m² · Vue ville · 1 lit King · 2e étage', amenities: ['📶 Wi-Fi', '❄️ Clim', '📺 TV', '🛁 Baignoire'], price: 185 }
    ];

    goStep(n: number) { this.currentStep = n; }

    confirm() {
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
            this.confirmed.emit();
        }, 2000);
    }
}
