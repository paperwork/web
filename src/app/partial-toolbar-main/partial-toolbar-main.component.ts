import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ToolbarService } from './toolbar.service';

@Component({
  selector: 'partial-toolbar-main',
  templateUrl: './partial-toolbar-main.component.html',
  styleUrls: ['./partial-toolbar-main.component.scss']
})
export class PartialToolbarMainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  state: number;

  private _mobileQueryListener: () => void;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private toolbarService: ToolbarService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 980px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.toolbarService.state$.subscribe((state: number) => {
      this.state = state;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  changeAll() {
    if(this.state === 3) {
      this.toolbarService.state = 1;
    } else {
      this.toolbarService.state = 3;
    }
  }
}
