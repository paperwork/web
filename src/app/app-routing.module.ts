import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewLoginComponent } from './view-login/view-login.component';
import { ViewMainComponent } from './view-main/view-main.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/notes', pathMatch: 'full' },
  { path: 'notes', component:  ViewMainComponent, canActivate: [AuthGuard] },
  { path: 'notes/:id', component:  ViewMainComponent, canActivate: [AuthGuard] },

  { path: 'register', component: ViewLoginComponent },
  { path: 'login', component: ViewLoginComponent },
  { path: 'logout', component: ViewLoginComponent },

  // { path: '**', component: ViewNotFoundComponent },
];

export const appRouting = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
