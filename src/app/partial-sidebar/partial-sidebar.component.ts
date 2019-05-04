import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './partial-sidebar.component.html',
  styleUrls: ['./partial-sidebar.component.scss']
})
export class PartialSidebarComponent implements OnInit {
  tabs = [
    {
      id: 'notifications',
      label: 'Notifications',
    },
    {
      id: 'notes',
      label: 'notes',
    },
    {
      id: 'folders',
      label: 'Folders',
    },
    {
      id: 'tags',
      label: 'Tags',
    },
  ];
  selected: number;
  currentRoute: string;

  constructor(private router: Router) {
    this.currentRoute = this.router.url.replace('/', '');
    let tab = this.tabs.find(tab => tab.id === this.currentRoute);

    if(tab === null) {
      return;
    }

    let indexOfTab: number = this.tabs.indexOf(tab);
    this.selected = indexOfTab; // TODO: Add a nice animation when switching tabs
  }

  ngOnInit() {
  }
}
