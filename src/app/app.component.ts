import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { environment } from '../environments/environment';
import { EnvService } from './env/env.service';
import { SyncService } from './api/sync.service';
import { Subscription } from 'rxjs';
import { List } from 'immutable';
import { get, forEach } from 'lodash';

export class DatabaseCollections {
  [key: string]: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'Paperwork';

  constructor(
    public envService: EnvService,
    public syncService: SyncService
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.envService.setStatusOf('domReady', true);
  }
}
