import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _tabs = [
    {
      id: 'notifications',
      label: 'Notifications',
    },
    {
      id: 'notes',
      label: 'notes',
    },
    {
      id: 'folders',
      label: 'Folders',
    },
    {
      id: 'tags',
      label: 'Tags',
    },
  ];

  private readonly _selected = new BehaviorSubject<number>(1);
  readonly selected$ = this._selected.asObservable();

  constructor(
  ) {
  }

  get tabs() {
    return this._tabs;
  }

  private set selected(val: number) {
    this._selected.next(val);
  }

  setNavigationToId(id: string) {
    let tab = this._tabs.find(tab => tab.id === id);

    if(tab === null) {
      return;
    }

    let indexOfTab: number = this._tabs.indexOf(tab);
    this.selected = indexOfTab;
  }
}
