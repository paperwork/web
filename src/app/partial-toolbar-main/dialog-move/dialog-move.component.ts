import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { NotesService } from '../../notes/notes.service';
import { Note } from '../../notes/note';
import { List } from 'immutable';
import { union } from 'lodash';

@Component({
  selector: 'dialog-move',
  templateUrl: './dialog-move.component.html',
  styleUrls: ['./dialog-move.component.scss']
})
export class DialogMoveComponent implements OnInit, OnDestroy {
  private notesServiceSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<DialogMoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private notesService: NotesService
  ) {
  }

  ngOnInit() {
    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.data.folders = notes.map((note: Note) => {
        return [note.get('path')];
      }).reduce((res: Array<string>, paths: Array<string>) => {
        return union(res, paths);
      }, []);
    });
  }

  ngOnDestroy() {
    if(typeof this.notesServiceSubscription !== 'undefined') {
      this.notesServiceSubscription.unsubscribe();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
