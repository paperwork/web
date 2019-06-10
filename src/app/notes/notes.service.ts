import { Injectable } from '@angular/core';
import { Observable, of, empty, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import { ObjectId } from '../../lib/objectid.helper';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { EnvService } from '../env/env.service';
import { accessToken, tokenGetDecoded, isLoggedIn } from '../../lib/token.helper';
import { paramsToQuery, mapContent } from '../../lib/api.helper';
import { CollectionService, ICollectionService } from '../../lib/collection.service';
import { Note, INote, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER } from './note';

@Injectable({
  providedIn: 'root'
})
export class NotesService extends CollectionService<Note> implements ICollectionService<Note> {
  constructor(
    protected httpClient: HttpClient,
    protected envService: EnvService
  ) {
    super(
      httpClient,
      envService,
      () => {
        this.init({
          collectionName: 'notes',
          apiUrl: `${this.envService.gatewayUrl()}/notes`,
          entryInitializer: Note
        });
        this.envService.pushToStatusOf('initializedCollections', 'notes');
      }
    );
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
      this.memDbChangeEntry(changeType, changedEntryId, undefined);
    } else {
      this.memDbChangeEntry(changeType, changedEntryId, new Note(changedEntry));
    }
    return true;
  }

  public async mergeToLocalDb(notes: List<Note>): Promise<List<Note>> {
    const localDbNotes: List<Note> = await this.localDbList();

    const mergedNotes: List<Note> = notes.map((note: Note) => {
      console.debug('mergeToLocalDb: notes.map');
      const foundNote: Note|undefined = localDbNotes.find((localDbNote: Note) => localDbNote.id === note.id);
      if(typeof foundNote === 'undefined') { // Note ID not found in local db -> it's a new note we can simply add
        console.debug('mergeToLocalDb: Note not found in database, adding as new note ...');
        return note;
      }

      console.debug('mergeToLocalDb: Note found in database, merging ...');
      return this.mergeNotes(foundNote, note);
    });

    console.debug('mergeToLocalDb: Upserting merged notes', mergedNotes);
    const localDbReturn: Array<any> = await this.localDbUpsert(mergedNotes);

    console.debug('mergeToLocalDb: Retrieved upserting return', localDbReturn);
    const updatedNotes: List<Note> = mergedNotes.map((note: Note) => {
      const localDbReturnedEntry = localDbReturn.find((retEntry) => (retEntry.ok === true && retEntry.id === note.id));
      console.debug('mergeToLocalDb: Setting _rev of note %s ...', note.id);
      return note.set('_rev', get(localDbReturnedEntry, 'rev', undefined));
    });

    console.debug('mergeToLocalDb: Updated notes', updatedNotes);
    return updatedNotes;
  }

  public mergeNotes(leftNote: Note, rightNote: Note): Note {
    return leftNote;
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
    return this.memDbChangeEntry('created', null, note);
  }

  public update(id: string, note: Note): boolean {
    return this.memDbChangeEntry('updated', id, note);
  }

  public delete(id: string): boolean {
    this.updateField(id, 'deleted_at', new Date());
    // TODO: Try to sync to back-end & re-read, in order to receive a deleted event and remove it from local store as well
    return true;
  }

  public updateField(id: string, field: string, value: any): boolean {
    return this.memDbUpdateEntryField(id, field, value);
  }

  public updateFields(id: string, fieldsValuesMap: object): boolean {
    return this.memDbUpdateEntryFields(id, fieldsValuesMap);
  }

}
