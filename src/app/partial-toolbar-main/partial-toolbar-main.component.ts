import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ToolbarService, ToolbarAction } from './toolbar.service';
import { NotesService } from '../notes/notes.service';
import { AlertService } from '../partial-alert/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogDuplicateComponent } from './dialog-duplicate/dialog-duplicate.component';
import { DialogMoveComponent } from './dialog-move/dialog-move.component';

@Component({
  selector: 'partial-toolbar-main',
  templateUrl: './partial-toolbar-main.component.html',
  styleUrls: ['./partial-toolbar-main.component.scss']
})
export class PartialToolbarMainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private toolbarServiceStateSubscription: Subscription;
  private toolbarServiceSearchSubscription: Subscription;
  private searchInputValueSubscription: Subscription;
  private routeQueryParamsSubscription: Subscription;

  state: number = 0;
  previousState: number = 0;

  search = new FormGroup({
    searchInput: new FormControl(''),
  });

  private _mobileQueryListener: () => void;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private location: Location,
    private toolbarService: ToolbarService,
    private notesService: NotesService,
    private alertService: AlertService,
    private dialog: MatDialog
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

    this.toolbarServiceSearchSubscription = this.toolbarService.search$.subscribe((search?: string) => {
      if(this.search.get(['searchInput']).value === search
      || typeof search !== 'string') {
        return false;
      }

      this.setSearch(search);
    });

    this.searchInputValueSubscription = this.search.get(['searchInput']).valueChanges.subscribe((value: string) => {
      this.toolbarService.search = value;
    });

    this.routeQueryParamsSubscription = this.activatedRoute.queryParams.subscribe(params => {
      if(typeof params.search === 'string') {
        this.setSearch(params['search']);
      }
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);

    if(typeof this.toolbarServiceStateSubscription !== 'undefined') {
      this.toolbarServiceStateSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceSearchSubscription !== 'undefined') {
      this.toolbarServiceSearchSubscription.unsubscribe();
    }

    if(typeof this.searchInputValueSubscription !== 'undefined') {
      this.searchInputValueSubscription.unsubscribe();
    }

    if(typeof this.routeQueryParamsSubscription !== 'undefined') {
      this.routeQueryParamsSubscription.unsubscribe();
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

  setSearch(value: string) {
    this.search.get(['searchInput']).setValue(value);
  }

  async buttonNewNote(): Promise<boolean> {
    const id: string|null = this.notesService.newNote();

    if(id === null) {
      this.alertService.error('Could not create new note!');
      return false;
    }

    return this.router.navigate(['notes', id], { state: { toolbarState: this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT } });
  }

  buttonDuplicate() {
    const dialogRef = this.dialog.open(DialogDuplicateComponent, {
      width: '350px',
      data: {
        title: true,
        access: false,
        tags: true,
        body: true,
        attachments: true
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if(typeof data !== 'object') {
        return;
      }

      console.log('The dialog was closed with data:');
      console.log(data);

      this.toolbarService.trigger = new ToolbarAction('duplicate', data);
    });
  }

  buttonMove() {
    const dialogRef = this.dialog.open(DialogMoveComponent, {
      width: '350px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(typeof data.folder !== 'string') {
        return;
      }

      console.log('The dialog was closed with path:');
      console.log(data);

      this.toolbarService.trigger = new ToolbarAction('move', { 'path': data.folder });
    });
  }

  buttonPrint() {
    this.toolbarService.trigger = new ToolbarAction('print', {});
  }
}
