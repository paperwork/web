import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

import { AlertService } from './alert.service';

@Component({
  selector: 'partial-alert',
  templateUrl: './partial-alert.component.html',
  styleUrls: ['./partial-alert.component.scss']
})
export class PartialAlertComponent implements OnInit {
  private subscription: Subscription;
  durationInSeconds: number = 100;

  constructor(
    private alertService: AlertService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.subscription = this.alertService.getMessage().subscribe(message => {
      // message.type (e.g. 'error'), message.text (e.g. 'Authentication unsuccessful.')
      if(typeof message !== 'undefined' && message.hasOwnProperty('text') && message.hasOwnProperty('type')) {
        this.snackBar.open(message.text, '', {
          duration: this.durationInSeconds * 1000,
          panelClass: ('snackbar-type-' + message.type)
        });
      }
    });
  }

  ngOnDestroy() {
    if(typeof this.subscription !== 'undefined') {
      this.subscription.unsubscribe();
    }
  }
}
