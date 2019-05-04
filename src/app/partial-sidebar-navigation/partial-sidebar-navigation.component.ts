import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'partial-sidebar-navigation',
  templateUrl: './partial-sidebar-navigation.component.html',
  styleUrls: ['./partial-sidebar-navigation.component.scss']
})
export class PartialSidebarNavigationComponent implements OnInit {
  navigationElements = [
    {
      id: 'notes',
      label: 'All Notes',
      icon: 'inbox',
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
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications_none',
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
