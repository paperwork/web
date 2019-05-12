import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { ToolbarService, ToolbarAction, ToolbarActionPayload } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { Router } from '@angular/router';
import { List } from 'immutable';
import { SearchEngine } from '../../../lib/search.helper';
import { Note } from '../note';

@Component({
  selector: 'partial-notes-list',
  templateUrl: './partial-notes-list.component.html',
  styleUrls: ['./partial-notes-list.component.scss']
})
export class PartialNotesListComponent implements OnInit, OnDestroy {
  private notesServiceSubscription: Subscription;
  private toolbarServiceStateSubscription: Subscription;
  private toolbarServiceSearchSubscription: Subscription;
  private toolbarServiceActionsSubscription: Subscription;

  searchEngine: SearchEngine = new SearchEngine();
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort;
  selection = null;
  toolbarState: number;

  constructor(
    private router: Router,
    private toolbarService: ToolbarService,
    private notesService: NotesService
  ) {
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (note: Note, filter: string) => this.searchEngine.filterPredicate(note, filter);

    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.dataSource.data = notes.toArray();
      this.selection = new SelectionModel<Note>(true, []);
    })

    this.toolbarServiceStateSubscription = this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });

    this.toolbarServiceSearchSubscription = this.toolbarService.search$.subscribe((search?: string) => {
      if(typeof search != 'string') {
        search = '';
      }

      this.dataSource.filter = search;
    });

    this.toolbarServiceActionsSubscription = this.toolbarService.actions$.subscribe((toolbarAction: ToolbarAction) => {
      switch(toolbarAction.action) {
      case 'move':
        this.toolbarActionMove(toolbarAction.payload);
        break;
      default:
        console.log('Unhandled action: %s', toolbarAction.action);
        break;
      }
    });

    this.setState();
  }

  ngOnDestroy() {
    if(typeof this.notesServiceSubscription !== 'undefined') {
      this.notesServiceSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceStateSubscription !== 'undefined') {
      this.toolbarServiceStateSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceSearchSubscription !== 'undefined') {
      this.toolbarServiceSearchSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceActionsSubscription !== 'undefined') {
      this.toolbarServiceActionsSubscription.unsubscribe();
    }
  }

  setAll(state: number) {
    const numberOfEntries: number = this.dataSource.data.length;

    if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT
    && this.selection.selected.length === 1) {
      return this.router.navigate(['notes', this.selection.selected[0].id], { state: { toolbarState: this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT } });
    } else if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED) {
      this.selection.clear();
    } else if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED) {
      if(numberOfEntries === 1) {
        // TODO: Find another way around this hack
        setTimeout(() => { this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_OF_ONE_SELECTED }, 100);
      } else if(numberOfEntries === 0) {
        // TODO: Find another way around this hack
        setTimeout(() => { this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED }, 100);
      }

      this.dataSource.data.forEach(row => this.selection.select(row));
    }

    this.toolbarState = state;
  }

  setState() {
    if(this.selection.hasValue() && this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED;
    } else if(this.selection.hasValue() && !this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_SOME_SELECTED;
    } else if(this.selection.hasValue() && !this.isAllSelected() && this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_SELECTED;
    } else if(this.selection.hasValue() && this.isAllSelected() && this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_OF_ONE_SELECTED;
    } else if(!this.selection.hasValue() && !this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED;
    } else {
      console.log('hasValue: %s', this.selection.hasValue());
      console.log('isAllSelected: %s', this.isAllSelected());
      console.log('isOneSelected: %s', this.isOneSelected());
    }
  }

  toggleRow(row) {
    this.selection.toggle(row);
    this.setState()
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return (numRows > 0 ? numSelected == numRows : false);
  }

  isOneSelected() {
    return this.selection.selected.length === 1;
  }

  private toolbarActionMove(payload: ToolbarActionPayload) {
    if(this.selection.selected.length === 0
    || typeof payload.path !== 'string') {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      const updatedNote: Note = note.set('path', payload.path);
      this.notesService.update(note.id, updatedNote);
    });

    this.setState();
  }
}
