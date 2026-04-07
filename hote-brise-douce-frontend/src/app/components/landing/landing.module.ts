import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LandingRoutingModule } from './landing-routing.module';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { LandingNavbarComponent } from './landing-navbar/landing-navbar.component';
import { LandingHeroComponent } from './landing-hero/landing-hero.component';
import { LandingStatsComponent } from './landing-stats/landing-stats.component';
import { LandingAboutComponent } from './landing-about/landing-about.component';
import { LandingRoomsComponent } from './landing-rooms/landing-rooms.component';
import { LandingServicesComponent } from './landing-services/landing-services.component';
import { LandingContactComponent } from './landing-contact/landing-contact.component';
import { LandingFooterComponent } from './landing-footer/landing-footer.component';
import { AuthModalComponent } from './auth-modal/auth-modal.component';

@NgModule({
    declarations: [
        LandingPageComponent,
        LandingNavbarComponent,
        LandingHeroComponent,
        LandingStatsComponent,
        LandingAboutComponent,
        LandingRoomsComponent,
        LandingServicesComponent,
        LandingContactComponent,
        LandingFooterComponent,
        AuthModalComponent
    ],
    imports: [SharedModule, LandingRoutingModule]
})
export class LandingModule { }
