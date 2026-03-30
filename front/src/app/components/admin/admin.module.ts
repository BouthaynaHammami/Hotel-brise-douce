import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminClientsComponent } from './admin-clients/admin-clients.component';
import { AdminRoomsComponent } from './admin-rooms/admin-rooms.component';
import { AdminReservationsComponent } from './admin-reservations/admin-reservations.component';
import { AdminCleaningComponent } from './admin-cleaning/admin-cleaning.component';
import { AdminPersonnelComponent } from './admin-personnel/admin-personnel.component';
import { AdminComplaintsComponent } from './admin-complaints/admin-complaints.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

@NgModule({
    declarations: [
        AdminPageComponent,
        AdminSidebarComponent,
        AdminHeaderComponent,
        AdminDashboardComponent,
        AdminClientsComponent,
        AdminRoomsComponent,
        AdminReservationsComponent,
        AdminCleaningComponent,
        AdminPersonnelComponent,
        AdminComplaintsComponent,
        AdminUsersComponent
    ],
    imports: [SharedModule, AdminRoutingModule]
})
export class AdminModule { }
