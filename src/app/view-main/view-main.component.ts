import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-main',
  templateUrl: './view-main.component.html',
  styleUrls: ['./view-main.component.scss']
})
export class ViewMainComponent implements OnInit {
  opened: boolean = true; // TODO: Load from user prefs
  events: string[] = [];

  constructor() { }

  ngOnInit() {
  }

}
