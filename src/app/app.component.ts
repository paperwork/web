import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Paperwork';
  opened: boolean = true; // TODO: Load from user prefs
  events: string[] = [];
}
