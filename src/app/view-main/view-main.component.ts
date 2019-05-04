import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'view-main',
  templateUrl: './view-main.component.html',
  styleUrls: ['./view-main.component.scss']
})
export class ViewMainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  opened: boolean = true; // TODO: Load from user prefs
  toggleOpened: boolean = true;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 980px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
