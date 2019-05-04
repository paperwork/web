import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './partial-sidebar.component.html',
  styleUrls: ['./partial-sidebar.component.scss']
})
export class PartialSidebarComponent implements OnInit {
  currentRoute: string;
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.currentRoute = activatedRoute.snapshot.url[0].path;
    this.setNavigationFromRoute(this.currentRoute);
  }

  setNavigationFromRoute(route: string) {
    let tab = this.tabs.find(tab => tab.id === route);

    if(tab === null) {
      return;
    }

    let indexOfTab: number = this.tabs.indexOf(tab);
    this.selected = indexOfTab; // TODO: Add a nice animation when switching tabs
  }

  ngOnInit() {
  }
}
