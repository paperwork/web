import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { Router } from '@angular/router';

import { Note } from '../note';
import { MockNotes } from '../mock';

@Component({
  selector: 'partial-notes-list',
  templateUrl: './partial-notes-list.component.html',
  styleUrls: ['./partial-notes-list.component.scss']
})
export class PartialNotesListComponent implements OnInit {
  dataSource = new MatTableDataSource(MockNotes);
  @ViewChild(MatSort) sort: MatSort;
  selection = null;
  toolbarState: number;

  constructor(
    private router: Router,
    private toolbarService: ToolbarService
  ) {
    this.selection = new SelectionModel<Note>(true, []);

    this.toolbarService.state$.subscribe((state: number) => {
      if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT
      && this.selection.selected.length === 1) {
        return this.router.navigate(['notes', this.selection.selected[0].id], { state: { toolbarState: this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT } });
      }
      this.setAll(state);
    });
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.setState();
  }

  setState() {
    if(this.selection.hasValue() && this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED;
    } else if(this.selection.hasValue() && !this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_SOME_SELECTED;
    } else if(this.selection.hasValue() && !this.isAllSelected() && this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_ONE_SELECTED;
    } else if(!this.selection.hasValue() && !this.isAllSelected() && !this.isOneSelected()) {
      this.toolbarService.state = this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED;
    }
  }

  setAll(state: number) {
    if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_NONE_SELECTED) {
      this.selection.clear();
    } else if(state === this.toolbarService.TOOLBAR_STATE_CHECKBOX_ALL_SELECTED) {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }

    this.toolbarState = state;
  }

  toggleRow(row) {
    this.selection.toggle(row);
    this.setState()
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  isOneSelected() {
    return this.selection.selected.length === 1;
  }
}
