import { Injectable, InjectionToken } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { List } from 'immutable';

import Dexie from 'dexie';

export interface ICollectionService {
  db: Dexie;
  collection: Function;

  collectionName: string;
  index: string;

  readonly entries: Observable<List<any>>;

  onCollectionInit?(): Promise<boolean>;
  onCollectionChange?(changeset: Object): Promise<boolean>;
}

export const ITCollectionService = new InjectionToken<ICollectionService[]>('collectionService');

@Injectable({
  providedIn: 'root'
})
export class CollectionService implements ICollectionService {
  private _db: Dexie|null = null;
  public collectionName: string = '';
  public index: string = '';

  public readonly entries: Observable<List<any>>;

  constructor() {
  }

  get db() {
    return this._db;
  }

  set db(db: Dexie) {
    this._db = db;
  }

  get collection() {
    return this._db[this.collectionName];
  }

  getEntryIndexById<T extends { id: string; }>(entriesSubject: BehaviorSubject<List<T>>, entryId: string): number {
    const entries: List<T> = entriesSubject.getValue();
    let entryIndex: number = 0;

    return entries.findIndex((entry: T) => entry.id === entryId);
  }

  getEntryByIndex<T>(entriesSubject: BehaviorSubject<List<T>>, entryIndex: number): T|null {
    let entry: T|null = null;

    if(entryIndex < 0) {
      return null;
    }

    const entries: List<T> = entriesSubject.getValue();
    return entries.get(entryIndex, null);
  }

  getEntryById<T extends { id: string; }>(entriesSubject: BehaviorSubject<List<T>>, entryId: string): T|null {
    const entryIndex: number = this.getEntryIndexById(entriesSubject, entryId);
    return this.getEntryByIndex(entriesSubject, entryIndex);
  }

  changeEntry<T extends { id: string; }>(entriesSubject: BehaviorSubject<List<T>>, action: string, entryId: string|null, newValue?: T): boolean {
    const entries: List<T> = entriesSubject.getValue();
    let entryIndex: number = -1;

    if((action === 'updated' || action === 'deleted')
    && typeof entryId === 'string') {
      entryIndex = this.getEntryIndexById(entriesSubject, entryId);

      if(entryIndex === -1) {
        console.log('Could not find entry in entries!');
        return false;
      }
    }

    let newEntries: List<T>;
    if(action === 'created' && typeof newValue !== 'undefined') {
      newEntries = entries.push(newValue);
    } else if(action === 'updated' && typeof newValue !== 'undefined') {
      newEntries = entries.set(entryIndex, newValue);
    } else if(action === 'deleted') {
      newEntries = entries.delete(entryIndex);
    } else {
      return false;
    }

    entriesSubject.next(newEntries);
    return true;
  }
}
