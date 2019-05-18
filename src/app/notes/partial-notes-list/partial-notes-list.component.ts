import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { ToolbarService, ToolbarAction, ToolbarActionPayload } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { Router } from '@angular/router';
import { List } from 'immutable';
import { SearchEngine } from '../../../lib/search.helper';
import { Note, INote } from '../note';
import { AlertService } from '../../partial-alert/alert.service';

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
    private notesService: NotesService,
    private alertService: AlertService
  ) {
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (note: Note, filter: string) => this.searchEngine.filterPredicate(note, filter);

    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.dataSource.data = notes.filter((note: Note) =>
        (typeof note.deleted_at === 'undefined' || note.deleted_at === null || note.deleted_at > new Date())
      ).toArray();
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
        case 'duplicate': return this.toolbarActionDuplicate(toolbarAction.payload);
        case 'move':      return this.toolbarActionMove(toolbarAction.payload);
        case 'print':     return this.toolbarActionPrint(toolbarAction.payload);
        case 'export':    return this.toolbarActionExport(toolbarAction.payload);
        case 'share':     return this.toolbarActionShare(toolbarAction.payload);
        case 'delete':    return this.toolbarActionDelete(toolbarAction.payload);
        case '0x90':      return true;
        default: return console.log('Unhandled action: %s', toolbarAction.action); return false;
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

  private toolbarActionDuplicate(payload: ToolbarActionPayload) {
    const fieldsToSave: Object = payload;
    const selectedNumber: number = this.selection.selected.length;
    if(selectedNumber === 0) {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      const allFields: INote = note.toJS();
      let toBeSavedFields: INote = allFields;

      if(typeof fieldsToSave === 'object') {
        toBeSavedFields = Object.keys(allFields).reduce((newFields: INote, field: string): INote => {
          if(fieldsToSave[field] === false) {
            delete newFields[field];
          }

          return newFields;
        }, allFields);
      }

      const id: string|null = this.notesService.newNote(toBeSavedFields);
    });

    this.alertService.success(`Duplicated note(s)!`);
    this.setState();
  }

  private toolbarActionMove(payload: ToolbarActionPayload) {
    const selectedNumber: number = this.selection.selected.length;
    if(selectedNumber === 0
    || typeof payload.path !== 'string') {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      const updatedNote: Note = note.set('path', payload.path);
      this.notesService.update(note.id, updatedNote);
    });

    this.alertService.success(`Moved ${selectedNumber} notes to folder '${payload.path}'!`);
    this.setState();
  }

  private toolbarActionPrint(payload: ToolbarActionPayload) {
    const selectedNumber: number = this.selection.selected.length;
    let ids: Array<string> = [];

    if(selectedNumber === 0) {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      ids.push(note.id);
    });

    return this.router.navigate([]).then(result => {
      window.open(`/print/notes/${ids.join(',')}`, '_blank');
    });
  }

  private toolbarActionExport(payload: ToolbarActionPayload) {
    const selectedNumber: number = this.selection.selected.length;
    let ids: Array<string> = [];

    if(selectedNumber === 0
    || typeof payload.path !== 'string') {
      return;
    }


    this.selection.selected.forEach((note: Note) => {
      ids.push(note.id);
    });

    return this.router.navigate([]).then(result => {
      window.open(`/export/notes/${ids.join(',')}?type=${payload.type}`, '_blank');
    });
  }

  private toolbarActionShare(payload: ToolbarActionPayload) {
    const selectedNumber: number = this.selection.selected.length;
    if(selectedNumber === 0
    || typeof payload.access !== 'string') {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      const updatedNote: Note = note.set('access', payload.access);
      this.notesService.update(note.id, updatedNote);
    });

    this.alertService.success(`Shared ${selectedNumber} notes!`);
    this.setState();
  }

  private toolbarActionDelete(payload: ToolbarActionPayload) {
    const selectedNumber: number = this.selection.selected.length;
    if(selectedNumber === 0
    || payload.sure !== true) {
      return;
    }

    this.selection.selected.forEach((note: Note) => {
      this.notesService.delete(note.id);
    });

    this.alertService.success(`Deleted ${selectedNumber} notes!`);
    this.setState();
  }
}
