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
      id: 'navigation',
      label: 'Navigation',
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
  selected = new FormControl(1);

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe((routerEvent: RouterEvent) => {
      if(routerEvent instanceof NavigationEnd) {
        console.log(routerEvent);
        let tab = this.tabs.find(tab => tab.id === routerEvent.urlAfterRedirects.replace('/', ''));
        console.log(tab);
        if(tab === null) {
          return;
        }

        let indexOfTab: number = this.tabs.indexOf(tab);
        console.log(indexOfTab);
        this.selected.setValue(indexOfTab); // TODO: This doesn't seem to work
        console.log(this.selected.value);
      }
    });
  }
}
