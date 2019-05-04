import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'partial-toolbar-main',
  templateUrl: './partial-toolbar-main.component.html',
  styleUrls: ['./partial-toolbar-main.component.scss']
})
export class PartialToolbarMainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  firstIcon: number = 1;

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
