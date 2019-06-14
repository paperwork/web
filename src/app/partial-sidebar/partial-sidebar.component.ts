import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EnvService } from '../env/env.service';
import { SidebarService } from './sidebar.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../users/user';
import { UsersService } from '../users/users.service';
import { Token, accessToken, tokenGetDecoded } from '../../lib/token.helper';

@Component({
  selector: 'app-sidebar',
  templateUrl: './partial-sidebar.component.html',
  styleUrls: ['./partial-sidebar.component.scss']
})
export class PartialSidebarComponent implements OnInit, OnDestroy {
  private sidebarServiceSelectedSubscription: Subscription;
  selected: number;
  public myAccessToken: string;
  public me$: Observable<User>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private envService: EnvService,
    public sidebarService: SidebarService,
    private usersService: UsersService
  ) {
  }

  ngOnInit() {
    this.sidebarServiceSelectedSubscription = this.sidebarService.selected$.subscribe(num =>
      this.selected = num
    );

    this.myAccessToken = accessToken();
    const myToken: Token = tokenGetDecoded(this.myAccessToken);

    this.me$ = this.usersService.memDbShowObservable(myToken.userId);
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
