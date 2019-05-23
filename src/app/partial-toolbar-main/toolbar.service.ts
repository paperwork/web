import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { Note, TNoteAccess } from '../notes/note';
import { merge, forEach } from 'lodash';

export type ToolbarActionPayload = {
  [key: string]: any;
}

export class ToolbarAction {
  action: string;
  payload: ToolbarActionPayload;

  constructor(action: string, payload: ToolbarActionPayload) {
    this.action = action;
    this.payload = payload;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  public TOOLBAR_STATE_BACK_DEFAULT: number = 0;
  public TOOLBAR_STATE_BACK_MODE_EDIT: number = 10;
  public TOOLBAR_STATE_CHECKBOX_NONE_SELECTED: number = 20;
  public TOOLBAR_STATE_CHECKBOX_ONE_SELECTED: number = 21;
  public TOOLBAR_STATE_CHECKBOX_ONE_OF_ONE_SELECTED: number = 22;
  public TOOLBAR_STATE_CHECKBOX_SOME_SELECTED: number = 23;
  public TOOLBAR_STATE_CHECKBOX_ALL_SELECTED: number = 24;

  constructor(
  ) {
  }

  private readonly _state = new BehaviorSubject<number>(this.TOOLBAR_STATE_BACK_DEFAULT);

  public readonly state$ = this._state.asObservable();

  public set state(val: number) {
    this._state.next(val);
  }



  private readonly _targetNotes = new BehaviorSubject<List<Note>>(List());

  public readonly targetNotes$ = this._targetNotes.asObservable();

  public set targetNotes(notes: List<Note>) {
    this._targetNotes.next(notes);
  }

  public get targetNotes() {
    return this._targetNotes.getValue();
  }

  public getTargetNotesSingleAccess(actingAsGid?: string): [boolean, Array<string>, TNoteAccess] {
    let differencesAppeared: boolean = false;
    let noteIdsSkippedDueToPermissions: Array<string> = [];
    const singleAccess: TNoteAccess = this.targetNotes.reduce((accessMap: TNoteAccess, note: Note) => {
      forEach(Object.keys(accessMap), (accessMapKey: string): boolean => {
        if(note.access.hasOwnProperty(accessMapKey) === true) {
          if(typeof actingAsGid === 'string'
          && accessMapKey === actingAsGid) {
            if(note.access[accessMapKey].can_share === false) {
              noteIdsSkippedDueToPermissions.push(note.id);
              return !differencesAppeared;
            }
          }

          forEach(Object.keys(accessMap[accessMapKey]), (permissionKey: string): boolean => {
            if(note.access[accessMapKey].hasOwnProperty(permissionKey)
            && note.access[accessMapKey][permissionKey] !== accessMap[accessMapKey][permissionKey]) {
              differencesAppeared = true;
            }

            return !differencesAppeared;
          });
        }

        return !differencesAppeared;
      });

      return merge(accessMap, note.access);
    }, {});

    return [ differencesAppeared, noteIdsSkippedDueToPermissions, singleAccess ];
  }


  private readonly _search = new BehaviorSubject<string>('');

  public readonly search$ = this._search.asObservable();

  public set search(val: string) {
    this._search.next(val);
  }

  private readonly _actions = new BehaviorSubject<ToolbarAction>(new ToolbarAction('0x90', {}));

  public readonly actions$ = this._actions.asObservable();

  public set trigger(toolbarAction: ToolbarAction) {
    this._actions.next(toolbarAction);
    this._actions.next(new ToolbarAction('0x90', {}));
  }

}
