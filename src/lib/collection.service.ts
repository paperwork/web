import { Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import Dexie from 'dexie';

export interface ICollectionService {
  db: Dexie;
  collectionName: string;
  index: string;
  collection: Function;
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
}
