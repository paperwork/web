import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private readonly _state = new BehaviorSubject<number>(1);
  readonly state$ = this._state.asObservable();

  constructor(
  ) {
  }

  public set state(val: number) {
    this._state.next(val);
  }
}
