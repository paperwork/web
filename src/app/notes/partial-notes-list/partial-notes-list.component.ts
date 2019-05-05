import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';

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
    private toolbarService: ToolbarService
  ) {
    this.selection = new SelectionModel<Note>(true, []);

    this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.setState();
  }

  setState() {
    if(this.selection.hasValue() && this.isAllSelected()) {
      this.toolbarService.state = 3;
    } else if(this.selection.hasValue() && !this.isAllSelected()) {
      this.toolbarService.state = 2;
    } else if(!this.selection.hasValue() && !this.isAllSelected()) {
      this.toolbarService.state = 1;
    }
  }

  setAll(state: number) {
    if(state === 1) {
      this.selection.clear();
    } else if(state === 3) {
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
}
