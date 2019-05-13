import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../partial-sidebar/sidebar.service';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../partial-toolbar-main/toolbar.service';

@Component({
  selector: 'partial-sidebar-navigation',
  templateUrl: './partial-sidebar-navigation.component.html',
  styleUrls: ['./partial-sidebar-navigation.component.scss']
})
export class PartialSidebarNavigationComponent implements OnInit, OnDestroy {
  private toolbarServiceSearchSubscription: Subscription;
  private activeElementId: string = '';

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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sidebarService: SidebarService,
    private toolbarService: ToolbarService
  ) {
  }

  ngOnInit() {
    this.toolbarServiceSearchSubscription = this.toolbarService.search$.subscribe((search?: string) => {
      if(typeof search != 'string') {
        search = '';
      }

      if(search.substr(0, '$path'.length) === '$path') {
        this.activeElementId = 'folders';
      } else if(search.substr(0, '$tags'.length) === '$tags') {
        this.activeElementId = 'tags';
      } else {
        this.activeElementId = this.activatedRoute.snapshot.url[0].path;
      }
    });
  }

  ngOnDestroy() {
    if(typeof this.toolbarServiceSearchSubscription !== 'undefined') {
      this.toolbarServiceSearchSubscription.unsubscribe();
    }
  }

  navigate(id: string) {
    const element = this.navigationElements.find(element => element.id === id);

    if(typeof element === 'undefined'
    || element === null) {
      return false;
    }

    switch(element.type) {
    case 'route':
      this.toolbarService.search = '';
      return this.router.navigate([`/${element.id}`]);
    case 'state':
      return this.sidebarService.setNavigationToId(id);
    default:
      return false;
    }
  }
}
