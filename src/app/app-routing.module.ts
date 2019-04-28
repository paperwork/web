import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', component:  AppComponent},
  { path: 'notifications', component:  AppComponent},
  { path: 'folders', component: AppComponent},
  { path: 'tags', component: AppComponent},
];

export const appRouting = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
