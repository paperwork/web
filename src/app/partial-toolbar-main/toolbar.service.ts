import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  public TOOLBAR_STATE_BACK_DEFAULT: number = 0;
  public TOOLBAR_STATE_BACK_MODE_EDIT: number = 10;
  public TOOLBAR_STATE_CHECKBOX_NONE_SELECTED: number = 20;
  public TOOLBAR_STATE_CHECKBOX_ONE_SELECTED: number = 21;
  public TOOLBAR_STATE_CHECKBOX_SOME_SELECTED: number = 22;
  public TOOLBAR_STATE_CHECKBOX_ALL_SELECTED: number = 23;

  private readonly _state = new BehaviorSubject<number>(this.TOOLBAR_STATE_BACK_DEFAULT);
  readonly state$ = this._state.asObservable();

  constructor(
  ) {
  }

  public set state(val: number) {
    this._state.next(val);
  }
}
