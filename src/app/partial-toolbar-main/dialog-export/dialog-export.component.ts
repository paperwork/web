import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dialog-export',
  templateUrl: './dialog-export.component.html',
  styleUrls: ['./dialog-export.component.scss']
})
export class DialogExportComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<DialogExportComponent>,
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
