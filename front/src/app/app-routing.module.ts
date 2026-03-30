import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./components/landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./components/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'client',
    loadChildren: () =>
      import('./components/client/client.module').then(m => m.ClientModule)
  },
  {
    path: 'personnel',
    loadChildren: () =>
      import('./components/personnel/personnel.module').then(m => m.PersonnelModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }