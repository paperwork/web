import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService implements OnInit, OnDestroy {
  private routerEventsSubscription: Subscription;

  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
    this.routerEventsSubscription = this.router.events.subscribe(event => {
      if(event instanceof NavigationStart) {
        if(this.keepAfterNavigationChange) {
          this.keepAfterNavigationChange = false;
        } else {
          this.subject.next();
        }
      }
    });
  }

  ngOnDestroy() {
    if(typeof this.routerEventsSubscription !== 'undefined') {
      this.routerEventsSubscription.unsubscribe();
    }
  }

  success(message: string, keepAfterNavigationChange = false) {
    this.message('success', message, keepAfterNavigationChange);
  }

  info(message: string, keepAfterNavigationChange = false) {
    this.message('info', message, keepAfterNavigationChange);
  }

  error(message: string, keepAfterNavigationChange = false) {
    this.message('error', message, keepAfterNavigationChange);
  }

  message(type: string, message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ 'type': type, 'text': message });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
