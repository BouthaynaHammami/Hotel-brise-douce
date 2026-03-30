import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';

import { ClientPageComponent } from './client-page/client-page.component';
import { ClientTopbarComponent } from './client-topbar/client-topbar.component';
import { ClientNavComponent } from './client-nav/client-nav.component';
import { ClientHomeComponent } from './client-home/client-home.component';
import { ClientBookingComponent } from './client-booking/client-booking.component';
import { ClientReservationsComponent } from './client-reservations/client-reservations.component';
import { ClientComplaintComponent } from './client-complaint/client-complaint.component';

@NgModule({
    declarations: [
        ClientPageComponent,
        ClientTopbarComponent,
        ClientNavComponent,
        ClientHomeComponent,
        ClientBookingComponent,
        ClientReservationsComponent,
        ClientComplaintComponent
    ],
    imports: [SharedModule, ClientRoutingModule]
})
export class ClientModule { }
