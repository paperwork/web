import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { NavigationService } from '../navigation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
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

  constructor(private router: Router, private navigation: NavigationService) { }

  ngOnInit() {
    this.navigation.current.subscribe(id => {
      this.tabs.forEach((tab, idx) => {
        if(tab.id === id) {
          this.selected.setValue(idx);
        }
      });
    });
    this.router.events.subscribe((res) => {
      this.selected.setValue(this.tabs.indexOf(this.tabs.find(tab => tab.id === this.router.url.replace('/', ''))));
    });
  }
}
