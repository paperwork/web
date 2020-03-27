import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dialog-duplicate',
  templateUrl: './dialog-duplicate.component.html',
  styleUrls: ['./dialog-duplicate.component.scss']
})
export class DialogDuplicateComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<DialogDuplicateComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
