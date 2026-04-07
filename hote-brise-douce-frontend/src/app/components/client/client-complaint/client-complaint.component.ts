import { Component } from '@angular/core';

@Component({ selector: 'app-client-complaint', templateUrl: './client-complaint.component.html', styleUrls: ['./client-complaint.component.css'] })
export class ClientComplaintComponent {
    showToast = false;

    myComplaints = [
        { subject: 'Climatisation #204', status: 'En cours', badge: 'badge-yellow', date: '28/03 · Urgent' },
        { subject: 'Service tardif #102', status: 'Résolu', badge: 'badge-green', date: '14/01 · Normale' }
    ];

    submit() {
        this.showToast = true;
        setTimeout(() => this.showToast = false, 4000);
    }
}
