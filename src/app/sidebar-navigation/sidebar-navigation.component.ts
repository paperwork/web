import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../navigation.service';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.scss']
})
export class SidebarNavigationComponent implements OnInit {
  navigationElements = [
    {
      id: 'account',
      label: 'Account',
      icon: 'face',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications_none',
    },
    {
      id: 'folders',
      label: 'Folders',
      icon: 'folder',
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: 'bookmarks',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];
  current: string;

  constructor(private navigation: NavigationService) { }

  ngOnInit() {
    this.navigation.current.subscribe(id => this.current = id)
  }

  navigate(id: string) {
    this.navigation.navigate(id)
  }
}
