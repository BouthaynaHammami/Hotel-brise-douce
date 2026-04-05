import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PersonnelRoutingModule } from './personnel-routing.module';

import { PersonnelPageComponent } from './personnel-page/personnel-page.component';
import { PersonnelTopbarComponent } from './personnel-topbar/personnel-topbar.component';
import { PersonnelNavComponent } from './personnel-nav/personnel-nav.component';
import { PersonnelTasksComponent } from './personnel-tasks/personnel-tasks.component';
import { PersonnelHistoryComponent } from './personnel-history/personnel-history.component';
import { PersonnelCongesComponent } from './personnel-conges/personnel-conges.component';
import { PersonnelProfileComponent } from './personnel-profile/personnel-profile.component';
import { PersonnelTaskModalComponent } from './personnel-task-modal/personnel-task-modal.component';

@NgModule({
    declarations: [
        PersonnelPageComponent,
        PersonnelTopbarComponent,
        PersonnelNavComponent,
        PersonnelTasksComponent,
        PersonnelHistoryComponent,
        PersonnelCongesComponent,
        PersonnelProfileComponent,
        PersonnelTaskModalComponent
    ],
    imports: [SharedModule, PersonnelRoutingModule]
})
export class PersonnelModule { }
