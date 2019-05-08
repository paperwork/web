import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public SIDEBAR_SELECTED_DEFAULT: number = 1;

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

  private readonly _selected = new BehaviorSubject<number>(this.SIDEBAR_SELECTED_DEFAULT);
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

  private get selected(): number {
    return this._selected.getValue();
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
