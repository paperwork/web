import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { Note } from '../notes/note';
import { MockNotes } from '../notes/mock';

@Component({
  selector: 'app-notes',
  templateUrl: './partial-notes-list.component.html',
  styleUrls: ['./partial-notes-list.component.scss']
})
export class PartialNotesListComponent implements OnInit {
  dataSource = new MatTableDataSource(MockNotes);
  @ViewChild(MatSort) sort: MatSort;
  selection = null;

  constructor() {
    this.selection = new SelectionModel<Note>(true, []);
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
