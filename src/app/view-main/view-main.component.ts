import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'view-main',
  templateUrl: './view-main.component.html',
  styleUrls: ['./view-main.component.scss']
})
export class ViewMainComponent implements OnInit, OnDestroy {
  currentRoute: string;
  currentResourceId: string;

  mobileQuery: MediaQueryList;
  opened: boolean = true; // TODO: Load from user prefs
  toggleOpened: boolean = true;

  private _mobileQueryListener: () => void;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 980px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.currentRoute = this.activatedRoute.snapshot.url[0].path;
    this.currentResourceId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  getViewForRoute(): string {
    switch(this.currentRoute) {
    case 'notes':
      if(typeof this.currentResourceId === 'string') {
        return 'notes-show';
      } else {
        return 'notes-list';
      }
    case 'settings':
      return 'users-settings-show';
    default:
      return '404';
    }
  }

  isViewForRoute(view: string): boolean {
    return this.getViewForRoute() === view;
  }

}
