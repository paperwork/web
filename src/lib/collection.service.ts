import { Injectable, InjectionToken } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { List, Record } from 'immutable';
import { map, omit } from 'lodash';
import PouchDB from 'pouchdb-browser';

export interface ICollectionService {
  db: any;
  collection: Function;

  collectionName: string;
  index: string;

  readonly entries: Observable<List<any>>;
  readonly entriesPersisted: Observable<List<any>>;

  bulkChange?(bulk: List<any>);

  onCollectionInit?(): Promise<boolean>;
  onCollectionChange?(changeset: Object): Promise<boolean>;

  apiList?();
}

export type TPouchResponseRow = {
  doc: {
    _id: string;
    _rev: string;
    _attachments: Object;
    [key: string]: any;
  };
}

export type TPouchResponse = {
  offset: number;
  total_rows: number;
  rows: Array<TPouchResponseRow>;
};

@Injectable({
  providedIn: 'root'
})
export class CollectionService implements ICollectionService {
  private _db: any|null = null;
  public collectionName: string = '';
  public index: string = '';

  public readonly entries: Observable<List<any>>;

  private _entriesPersisted: BehaviorSubject<List<any>> = new BehaviorSubject(List([]));
  public readonly entriesPersisted: Observable<List<any>> = this._entriesPersisted.asObservable();

  constructor() {
  }

  init() {
    console.debug(`Initializing local database with collection ${this.collectionName} ...`)
    this.db = new PouchDB(this.collectionName);
  }

  get db(): any {
    return this._db;
  }

  set db(db: any) {
    this._db = db;
  }

  get collection() {
    return this.db;
  }

  async all(): Promise<Array<Object>> {
    const allDocs: TPouchResponse = await this.collection.allDocs({include_docs: true});

    console.debug(allDocs);

    const entries: Array<Object> = map(allDocs.rows, (row: TPouchResponseRow) => {
      const entry = omit(row.doc, ['_id']);
      entry.id = row.doc._id;
      console.debug('Loading the following row:');
      console.debug(entry);
      return entry;
    });

    return entries;
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

  changeEntry<T extends { id: string; }>(entriesSubject: BehaviorSubject<List<T>>, action: string, entryId: string|null, newValue?: T, persist: boolean = true): boolean {
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

    console.debug('Propagating new entries ...');
    entriesSubject.next(newEntries);

    console.debug('Propagating new entries to be persisted ...');
    if(persist === true) {
      this._entriesPersisted.next(newEntries);
    }

    return true;
  }

  public updateEntryFields<T extends { id: string, merge: Function }>(entriesSubject: BehaviorSubject<List<T>>, id: string, fieldsValuesMap: object): boolean {
    const entry: T|null = this.getEntryById(entriesSubject, id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedEntry: T = entry.merge(fieldsValuesMap);

    return this.changeEntry(entriesSubject, 'updated', id, updatedEntry);
  }

  public updateEntryField<T extends { id: string, merge: Function }>(entriesSubject: BehaviorSubject<List<T>>, id: string, field: string, value: any): boolean {
    const entry: T|null = this.getEntryById(entriesSubject, id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedEntry: T = entry.merge({
      [field]: value
    });

    return this.changeEntry(entriesSubject, 'updated', id, updatedEntry);
  }

  public pushToEntryField<T extends { id: string, merge: Function }>(entriesSubject: BehaviorSubject<List<T>>, id: string, field: string, value: T) {
    const entry: T|null = this.getEntryById(entriesSubject, id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    let fieldList: List<T>;
    if(entry[field].length > 0) {
      fieldList = List.of(entry[field]);
    }  else {
      fieldList = List();
    }

    const updatedEntry: T = entry.merge({
      [field]: fieldList.push(value).toArray()
    });

    return this.changeEntry(entriesSubject, 'updated', id, updatedEntry);
  }

  public popFromEntryField<T extends { id: string, merge: Function }>(entriesSubject: BehaviorSubject<List<T>>, id: string, field: string, value: T) {
    const entry: T|null = this.getEntryById(entriesSubject, id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    if(entry[field].length === 0) {
      return false;
    }

    const currentValues: List<T> = List.of(entry[field]);
    const idx: number = currentValues.indexOf(value);

    if(idx === -1) {
      return false;
    }

    const updatedEntry: T = entry.merge({
      [field]: currentValues.delete(idx).toArray()
    });

    return this.changeEntry(entriesSubject, 'updated', id, updatedEntry);
  }

}
