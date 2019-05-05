import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../partial-sidebar/sidebar.service';

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
      type: 'route',
    },
    {
      id: 'folders',
      label: 'Folders',
      icon: 'folder',
      type: 'state',
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: 'bookmarks',
      type: 'state',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications_none',
      type: 'state',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      type: 'route',
    },
  ];

  constructor(
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit() {
  }

  navigate(id: string) {
    this.sidebarService.setNavigationToId(id);
  }
}
