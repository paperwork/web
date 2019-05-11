import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ToolbarService } from './toolbar.service';
import { NotesService } from '../notes/notes.service';
import { AlertService } from '../partial-alert/alert.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'partial-toolbar-main',
  templateUrl: './partial-toolbar-main.component.html',
  styleUrls: ['./partial-toolbar-main.component.scss']
})
export class PartialToolbarMainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private toolbarServiceStateSubscription: Subscription;

  state: number = 0;
  previousState: number = 0;

  private _mobileQueryListener: () => void;

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private location: Location,
    private toolbarService: ToolbarService,
    private notesService: NotesService,
    private alertService: AlertService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 980px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.toolbarServiceStateSubscription = this.toolbarService.state$.subscribe((state: number) => {
      if(this.state !== state) {
        console.log("current state: %s, previousState: %s, received state: %s", this.state, this.previousState, state);
        this.previousState = this.state;
        this.state = state;
      }
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);

    if(typeof this.toolbarServiceStateSubscription !== 'undefined') {
      this.toolbarServiceStateSubscription.unsubscribe();
    }
  }

  changeAll() {
    if(this.state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED
    || this.state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_OF_ONE_SELECTED) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED;
    } else {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED;
    }
  }

  setState(state: number) {
    console.log("setting state:");
    this.toolbarService.state = state;
  }

  toggleEditState() {
    if(this.state !== this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT) {
      this.setState(this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT);
    } else {
      this.setState(this.previousState);
    }
  }
}
