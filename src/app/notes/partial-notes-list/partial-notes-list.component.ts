import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { Router } from '@angular/router';
import { List } from 'immutable';

import { Note } from '../note';

@Component({
  selector: 'partial-notes-list',
  templateUrl: './partial-notes-list.component.html',
  styleUrls: ['./partial-notes-list.component.scss']
})
export class PartialNotesListComponent implements OnInit {
  private notesServiceSubscription: Subscription;
  private toolbarServiceStateSubscription: Subscription;

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
    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.dataSource.data = notes.toArray();
      this.selection = new SelectionModel<Note>(true, []);
    })

    this.toolbarServiceStateSubscription = this.toolbarService.state$.subscribe((state: number) => {
      if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT
      && this.selection.selected.length === 1) {
        return this.router.navigate(['notes', this.selection.selected[0].id], { state: { toolbarState: this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT } });
      }
      this.setAll(state);
    });

    this.dataSource.sort = this.sort;
    this.setState();
  }

  ngOnDestroy() {
    if(typeof this.notesServiceSubscription !== 'undefined') {
      this.notesServiceSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceStateSubscription !== 'undefined') {
      this.toolbarServiceStateSubscription.unsubscribe();
    }
  }

  setAll(state: number) {
    if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED) {
      this.selection.clear();
    } else if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED) {
      if(this.dataSource.data.length === 1) {
        // TODO: Find another way around this hack
        setTimeout(() => { this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_OF_ONE_SELECTED }, 200);
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
}
