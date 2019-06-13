import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ToolbarService, ToolbarAction } from './toolbar.service';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { AlertService } from '../partial-alert/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogDuplicateComponent } from './dialog-duplicate/dialog-duplicate.component';
import { DialogMoveComponent } from './dialog-move/dialog-move.component';
import { DialogExportComponent } from './dialog-export/dialog-export.component';
import { DialogShareComponent } from './dialog-share/dialog-share.component';
import { DialogDeleteComponent } from './dialog-delete/dialog-delete.component';
import { tokenGetDecoded } from '../../lib/token.helper';
import { get } from 'lodash';

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

  private myGid: string|null = null;

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
    public toolbarService: ToolbarService,
    private notesService: NotesService,
    private usersService: UsersService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 980px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.myGid = get(tokenGetDecoded(), 'userGid', null);

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

  displayDialog(component, action: string, validator: Function, data: Object = {}) {
    const dialogRef = this.dialog.open(component, {
      'width': '350px',
      'data': data
    });

    dialogRef.afterClosed().subscribe(data => {
      if(validator(data) === false) {
        return false;
      }

      console.log('The dialog was closed with data:');
      console.log(data);

      this.toolbarService.trigger = new ToolbarAction(action, data);
    });
  }

  async buttonNewNote(): Promise<boolean> {
    const id: string|null = this.notesService.newNote();

    if(id === null) {
      this.alertService.error('Could not create new note!');
      return false;
    }

    return this.router.navigate(['notes', id], { state: { toolbarState: this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT, noteState: { new: true } } });
  }

  buttonDuplicate() {
    this.displayDialog(DialogDuplicateComponent,
      'duplicate',
      (data) => typeof data === 'object',
      {
        title: true,
        access: false,
        tags: true,
        body: true,
        attachments: true
      }
    );
  }

  buttonMove() {
    this.displayDialog(DialogMoveComponent,
      'move',
      (data) => typeof data === 'object' && typeof data.path === 'string',
      {}
    );
  }

  buttonPrint() {
    this.toolbarService.trigger = new ToolbarAction('print', {});
  }

  buttonExport() {
    this.displayDialog(DialogExportComponent,
      'export',
      (data) => typeof data === 'object' && typeof data.type === 'string',
      {}
    );
  }

  buttonShare() {
    const [differencesAppeared, noteIdsSkippedDueToPermissions, singleAccess] = this.toolbarService.getTargetNotesSingleAccess(this.myGid);

    this.displayDialog(DialogShareComponent,
      'share',
      (data) => typeof data === 'object' && typeof data.access === 'object',
      {
        myGid: this.myGid,
        myAccess: singleAccess[this.myGid],
        access: singleAccess,
        differences: differencesAppeared,
        skippedDueToPermissions: noteIdsSkippedDueToPermissions,
        users: this.usersService.memDbList()
      }
    );
  }

  buttonDelete() {
    this.displayDialog(DialogDeleteComponent,
      'delete',
      (data) => typeof data === 'object' && data.sure === true,
      {
        sure: false
      }
    );
  }

}
