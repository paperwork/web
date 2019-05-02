import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './partial-sidebar-navigation.component.html',
  styleUrls: ['./partial-sidebar-navigation.component.scss']
})
export class PartialSidebarNavigationComponent implements OnInit {
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

  constructor() { }

  ngOnInit() {
  }

  navigate(id: string) {
  }
}
