import { Injectable, OnInit } from '@angular/core';
import { Observable, of, empty, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import { ObjectId } from '../../lib/objectid.helper';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { EnvService } from '../env/env.service';
import { accessToken, tokenGetDecoded, isLoggedIn } from '../../lib/token.helper';
import { CollectionService, ICollectionService } from '../../lib/collection.service';
import { Note, INote, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER } from './note';

export type TNoteRequestParams = {
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService extends CollectionService implements ICollectionService, OnInit {
  collectionName: string = 'notes';
  index: string = 'id,created_at';

  private _entries: BehaviorSubject<List<Note>> = new BehaviorSubject(List([]));
  public readonly entries: Observable<List<Note>> = this._entries.asObservable();

  constructor(
    private httpClient: HttpClient,
    private envService: EnvService
  ) {
    super();
    this.ngOnInit();
  }

  ngOnInit() {
    this.init();
    this.onCollectionInit();
  }

  async onCollectionInit(): Promise<boolean> {
    console.debug('Initializing notes.service ...');
    return true;
  }

  async onCollectionChange(change): Promise<boolean> {
    const changeType: string = change.type;
    const changedEntry: object|null = changeType === 'deleted' ? get(change, 'entry.previousValue', null) : get(change, 'entry.currentValue', null);
    const changedEntryId: string|null = get(changedEntry, 'id', null);

    if(changedEntryId === null) {
      console.log('ID for changed entry is NULL!');
      return false;
    }

    if(changeType === 'deleted') {
      this.changeEntry(this._entries, changeType, changedEntryId, undefined, false);
    } else {
      this.changeEntry(this._entries, changeType, changedEntryId, new Note(changedEntry), false);
    }
    return true;
  }

  public bulkChange(bulk: List<Note>) {
    console.log('BULK CHANGE NOTES', bulk);
    this._entries.next(bulk);
  }

  public listSnapshot(): List<Note> {
    return this._entries.getValue();
  }

  public show(id: string): Observable<Note> {
    return this.entries.pipe(
      map((notes: List<Note>) => notes.find(note => note.id === id))
    );
  }

  public newNote(fields?: INote): string|null {
    const objectId: ObjectId = new ObjectId();
    const id: string = objectId.toString();
    const userGid: string = (tokenGetDecoded()).userGid;
    if(typeof fields === 'object') {
      fields.id = id;
    } else {
      fields = { id: id };
    }

    // TODO: Add real user data from session
    const note: Note = (new Note(fields).addAccess(userGid, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER, { 'user': { 'email': 'test@example.com', 'name': { 'first_name': 'John', 'last_name': 'Doe' } } }));

    if(this.create(note) === true) {
      return id;
    }

    return null;
  }

  public create(note: Note): boolean {
    return this.changeEntry(this._entries, 'created', null, note, false);
  }

  public update(id: string, note: Note): boolean {
    return this.changeEntry(this._entries, 'updated', id, note);
  }

  public delete(id: string): boolean {
    this.updateField(id, 'deleted_at', new Date());
    // TODO: Try to sync to back-end & re-read, in order to receive a deleted event and remove it from local store as well
    return true;
  }

  public updateField(id: string, field: string, value: any): boolean {
    return this.updateEntryField(this._entries, id, field, value);
  }

  public updateFields(id: string, fieldsValuesMap: object): boolean {
    return this.updateEntryFields(this._entries, id, fieldsValuesMap);
  }

  apiList(params: TNoteRequestParams = {}) {
    if(isLoggedIn() === false) {
      console.debug('Not performing apiList since user is not logged in');
      return of(List());
    }

    return this.httpClient
      .get<{content: Array<Note> }>(
        `${this.envService.gatewayUrl()}/notes${typeof params.id === 'string' ? '/' + params.id : ''}`,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken()
          })
        }
      )
      .pipe(
        map(res => {
          let itemsArray: Array<Note> = [];

          if(Array.isArray(res.content) === true) {
            itemsArray = res.content.map((item: Object): Note => {
              return new Note(item);
            });
          } else {
            itemsArray.push(new Note(res.content));
          }
          return List(itemsArray);
        }),
        catchError(err => {
          // We get 404 when no notes were found (e.g. because the user hasn't created any yet)
          if(err.status === 404) {
            return empty()
          }

          return throwError(err);
        })
      );
  }

}
