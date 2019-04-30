import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewMainComponent } from './view-main/view-main.component';

const routes: Routes = [
  { path: '', redirectTo: '/notes', pathMatch: 'full' },
  { path: 'notes', component:  ViewMainComponent },
  { path: 'notifications', component:  ViewMainComponent },
  { path: 'folders', component: ViewMainComponent },
  { path: 'tags', component: ViewMainComponent },
  // { path: '**', component: ViewNotFoundComponent },
];

export const appRouting = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
