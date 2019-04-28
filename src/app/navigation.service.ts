import {Component, Injectable, Input, Output, EventEmitter} from '@angular/core'
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavigationService {
  private messageSource = new BehaviorSubject('navigation');
  current = this.messageSource.asObservable();

  constructor() { }

  navigate(id: string) {
    this.messageSource.next(id)
  }

}
