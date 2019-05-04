import { EnvService } from './env/env.service';
import { BrowserModule } from '@angular/platform-browser';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotesComponent } from './notes/notes.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {A11yModule} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';


import { ViewLoginComponent } from './view-login/view-login.component';
import { ViewMainComponent } from './view-main/view-main.component';

import { PartialAlertComponent } from './partial-alert/partial-alert.component';
import {PartialSidebarComponent } from './partial-sidebar/partial-sidebar.component';
import { PartialSidebarNavigationComponent } from './partial-sidebar-navigation/partial-sidebar-navigation.component';

import { UsersService } from './users/users.service';
import { UsersComponent } from './users/users.component';
import { PartialSidebarFoldersComponent } from './partial-sidebar-folders/partial-sidebar-folders.component';
import { PartialToolbarRowLogoComponent } from './partial-toolbar-row-logo/partial-toolbar-row-logo.component';
import { PartialToolbarRowNotesListComponent } from './partial-toolbar-row-notes-list/partial-toolbar-row-notes-list.component';


export function jwtOptionsFactory(envService) {
  return {
    tokenGetter: () => {
      return localStorage.getItem('access_token');
    },
    throwNoTokenError: false,
    skipWhenExpired: true,
    whitelistedDomains: [envService.gatewayHostPort()],
    blacklistedRoutes: [(envService.gatewayUrl() + '/login')],
  }
}

export function init_env(envService: EnvService) {
  return () => envService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    NotesComponent,
PartialSidebarComponent,
    PartialSidebarNavigationComponent,
    ViewMainComponent,
    UsersComponent,
    ViewLoginComponent,
    PartialAlertComponent,
    PartialSidebarFoldersComponent,
    PartialToolbarRowLogoComponent,
    PartialToolbarRowNotesListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    FormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [EnvService]
      }
    }),
    ReactiveFormsModule,

    A11yModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    PortalModule,
    ScrollingModule,
  ],
  providers: [
    EnvService,
    UsersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
