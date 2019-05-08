import { Component, OnInit } from '@angular/core';
import { Notification } from './notification';
import { MockNotifications } from './mock';

@Component({
  selector: 'partial-sidebar-notifications',
  templateUrl: './partial-sidebar-notifications.component.html',
  styleUrls: ['./partial-sidebar-notifications.component.scss']
})
export class PartialSidebarNotificationsComponent implements OnInit {
  notifications: Array<Notification> = MockNotifications;

  constructor() { }

  ngOnInit() {
  }

}
