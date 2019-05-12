import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './partial-sidebar.component.html',
  styleUrls: ['./partial-sidebar.component.scss']
})
export class PartialSidebarComponent implements OnInit, OnDestroy {
  private sidebarServiceSelectedSubscription: Subscription;
  selected: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit() {
    this.sidebarServiceSelectedSubscription = this.sidebarService.selected$.subscribe(num =>
      this.selected = num
    );
  }

  ngOnDestroy() {
    if(typeof this.sidebarServiceSelectedSubscription !== 'undefined') {
      this.sidebarServiceSelectedSubscription.unsubscribe();
    }
  }

  navigate(id: string) {
    this.sidebarService.setNavigationToId(id);
  }

  getBackButtonIcon(): string {
    if(this.selected < this.sidebarService.SIDEBAR_SELECTED_DEFAULT) {
      return 'arrow_forward';
    } else if(this.selected > this.sidebarService.SIDEBAR_SELECTED_DEFAULT) {
      return 'arrow_back';
    } else {
      return '';
    }
  }
}
