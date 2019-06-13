import { Injectable, InjectionToken } from '@angular/core';
import { Observable, of, empty, throwError, BehaviorSubject, Subscription } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List, Record } from 'immutable';
import { omit, get } from 'lodash';
import PouchDB from 'pouchdb-browser';
import { accessToken, tokenGetDecoded, isLoggedIn } from './token.helper';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { paramsToQuery, mapContent } from './api.helper';
import { EnvService, TEnvStatus } from '../app/env/env.service';

import { Note } from '../app/notes/note';

export type TLocalDbResponseRow = {
  doc: {
    _id: string;
    _rev: string;
    _attachments: Object;
    [key: string]: any;
  };
}

export type TLocalDbResponse = {
  offset: number;
  total_rows: number;
  rows: Array<TLocalDbResponseRow>;
};

export interface ICollectionService<T> {
  db: any;
  collection: any;
  collectionName: string;

  readonly entries: Observable<List<T>>;
  readonly entriesPersisted: Observable<List<T>>;

  mergeToLocalDb(notes: List<T>, source: string): Promise<List<T>>;

  memDbPersist(bulk: List<T>);
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService<T extends { id: string, merge: Function, toJS: Function }> {
  private _db: any|null = null;
  public collectionName: string;
  public apiUrl: string;
  private entryInitializer;

  protected envStatus: Subscription = null;
  protected hasBeenInitialzed: boolean = false;

  protected _entries: BehaviorSubject<List<T>> = new BehaviorSubject(List([]));
  public readonly entries: Observable<List<T>> = this._entries.asObservable();

  private _entriesPersisted: BehaviorSubject<List<any>> = new BehaviorSubject(List([]));
  public readonly entriesPersisted: Observable<List<any>> = this._entriesPersisted.asObservable();

  constructor(
    protected httpClient: HttpClient,
    protected envService: EnvService,
    private initializer: Function
  )
  {
    this.envStatus = this.envService.status.subscribe((status: TEnvStatus) => {
      if(this.canInit(status) === true) {
        console.debug('CollectionService.constructor: Initializer was called, canInit returned true, initializing ...');
        this.hasBeenInitialzed = true;
        initializer();
      } else {
        console.debug('CollectionService.constructor: Initializer was called, but canInit returned false.');
      }
    });
  }

  protected canInit(status: TEnvStatus): boolean {
    if(typeof status === 'object'
    && status.initialized === true
    && status.loggedIn === true
    && this.hasBeenInitialzed === false) {
      return true;
    }

    return false;
  }

  protected init(opts) {
    this.collectionName = get(opts, 'collectionName', 'forgotToNameACollection');
    this.apiUrl = get(opts, 'apiUrl', 'http://127.0.0.1/forgotToNameApiUrl');
    this.entryInitializer = get(opts, 'entryInitializer', Object);

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


  // ================================================= memDb ======================================================== //

  public async memDbToLocalDb() {
    console.log('memDbToLocalDb');
    const entries: List<T> = this.memDbList();
    return this.localDbPersist(entries);
  }

  public memDbPersist(bulk: List<T>) {
    console.log('memDbPersist', bulk);
    this._entries.next(bulk);
  }

  public memDbList(): List<T> {
    return this._entries.getValue();
  }

  public memDbShowObservable(id: string): Observable<T> {
    return this.entries.pipe(
      map((entries: List<T>) => entries.find(entry => entry.id === id))
    );
  }

  public memDbGetEntryIndexById(entryId: string): number {
    const entries: List<T> = this._entries.getValue();
    let entryIndex: number = 0;

    return entries.findIndex((entry: T) => entry.id === entryId);
  }

  public memDbGetEntryByIndex(entryIndex: number): T|null {
    let entry: T|null = null;

    if(entryIndex < 0) {
      return null;
    }

    const entries: List<T> = this._entries.getValue();
    return entries.get(entryIndex, null);
  }

  public memDbGetEntryById(entryId: string): T|null {
    const entryIndex: number = this.memDbGetEntryIndexById(entryId);
    return this.memDbGetEntryByIndex(entryIndex);
  }

  public memDbChangeEntry(action: string, entryId: string|null, newValue?: T): boolean {
    const entries: List<T> = this._entries.getValue();
    let entryIndex: number = -1;

    if((action === 'updated' || action === 'deleted')
    && typeof entryId === 'string') {
      entryIndex = this.memDbGetEntryIndexById(entryId);

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
    this._entries.next(newEntries);

    return true;
  }

  public memDbUpdateEntryFields(id: string, fieldsValuesMap: object): boolean {
    const entry: T|null = this.memDbGetEntryById(id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedEntry: T = entry.merge(fieldsValuesMap);

    return this.memDbChangeEntry('updated', id, updatedEntry);
  }

  public memDbUpdateEntryField(id: string, field: string, value: any): boolean {
    const entry: T|null = this.memDbGetEntryById(id);

    if(entry === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedEntry: T = entry.merge({
      [field]: value
    });

    return this.memDbChangeEntry('updated', id, updatedEntry);
  }

  public memDbPushToEntryField(id: string, field: string, value: T) {
    const entry: T|null = this.memDbGetEntryById(id);

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

    return this.memDbChangeEntry('updated', id, updatedEntry);
  }

  public memDbPopFromEntryField(id: string, field: string, value: T) {
    const entry: T|null = this.memDbGetEntryById(id);

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

    return this.memDbChangeEntry('updated', id, updatedEntry);
  }


  // ================================================= localDb ====================================================== //

  public async localDbToMemDb() {
    console.log('localDbToMemDb');
    const entries: List<T> = await this.localDbList();
    return this.memDbPersist(entries);
  }

  public localDbPersist(bulk: List<T>) {
    console.log('localDbPersist', bulk);
    this._entriesPersisted.next(bulk);
  }

  public async localDbList(): Promise<List<T>> {
    console.debug('localDbList called ...');
    const allDocs: TLocalDbResponse = await this.collection.allDocs({include_docs: true});

    console.debug('localDbList: All existing documents:', allDocs);

    const rows: Array<TLocalDbResponseRow> = get(allDocs, 'rows', []);
    console.debug('localDbList: rows', rows);
    const entries: Array<T> = rows.map((row: TLocalDbResponseRow) => {
      console.debug('localDbList: Checking row ...');
      const entry = omit(row.doc, ['_id']);
      entry.id = row.doc._id;
      console.debug('localDbList: Loading the following row:');
      console.debug(entry);
      return new this.entryInitializer(entry);
    });

    console.debug('localDbList: Converted existing documents:', entries);

    return List(entries);
  }

  public async localDbUpsert(entries: List<T>): Promise<any> {
    console.debug('localDbUpsert called ...');
    const localDbRows: Array<Object> = entries.reduce((arr: Array<Object>, entry: T) => {
      const row = omit(entry.toJS(), ['id']);
      row._id = entry.id;
      arr.push(row);
      return arr;
    }, []);

    console.debug('localDbUpsert: Transformed to localDb rows', localDbRows);
    const dbret = await this.collection.bulkDocs(localDbRows);
    console.debug('localDbUpsert: bulkDocs return', dbret);

    return dbret;
  }


  // ================================================= api ========================================================== //

  public apiList(params = {}, opts = {}) {
    const optAuthenticatedOnly: boolean = get(opts, 'authenticatedOnly', false);
    let reqHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if(optAuthenticatedOnly === true) {
      if(isLoggedIn() === false) {
        console.debug('Not performing apiList since user is not logged in');
        return of(List());
      }

      reqHeaders = reqHeaders.append('Authorization', `Bearer ${accessToken()}`);
    }

    return this.httpClient
      .get<{content: Array<T> }>(
        `${this.apiUrl}?${paramsToQuery(params)}`,
        {
          headers: reqHeaders
        }
      )
      .pipe(
        map(res => mapContent(res, this.entryInitializer)),
        catchError(err => {
          switch(err.status) {
          case 404:
            console.debug('apiList: Retrieved 404, apparently there is nothing new!');
            return of(List());
          default:
            return throwError(err);
          }
        })
      );
  }

}
