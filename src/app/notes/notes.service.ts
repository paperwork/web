import { Injectable } from '@angular/core';
import { Observable, of, empty, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { EnvService } from '../env/env.service';
import { accessToken, tokenGetDecoded, isLoggedIn } from '../../lib/token.helper';
import { paramsToQuery, mapContent } from '../../lib/api.helper';
import { getRevisionNumber } from '../../lib/sync.helper';
import { CollectionService, ICollectionService } from '../../lib/collection.service';
import { Note, INote, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER } from './note';

import ObjectID from 'bson-objectid';

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
        this.localDbToMemDb();
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

  public async mergeToLocalDb(notes: List<Note>, source: string): Promise<List<Note>> {
    const localDbNotes: List<Note> = await this.localDbList();
    let replaceNoteIds: Array<string> = [];
    let appendNoteIds: Array<string> = [];

    const mergedNotes: List<Note|null> = notes.map((note: Note): Note|null => {
      console.debug('mergeToLocalDb: notes.map');
      const foundNote: Note|undefined = localDbNotes.find((localDbNote: Note) => localDbNote.id === note.id);

      if(typeof foundNote === 'undefined'
       || foundNote === null) {
        appendNoteIds.push(note.id);
      } else {
        replaceNoteIds.push(note.id);
      }

      console.debug('mergeToLocalDb: Merging notes...');
      return this.mergeNotes(foundNote, note, source);
    });

    console.debug('mergeToLocalDb: Upserting merged notes', mergedNotes.toJS());
    const localDbReturn: Array<any> = await this.localDbUpsert(mergedNotes);

    console.debug('mergeToLocalDb: Retrieved upserting return', localDbReturn);

    const updatedNotes: List<Note> = mergedNotes.map((note: Note) => {
      const localDbReturnedEntry = localDbReturn.find((retEntry) => (retEntry.id === note.id));

      if(typeof localDbReturnedEntry === 'undefined' || localDbReturnedEntry === null) {
        console.error('mergeToLocalDb: Did not find return entry for note %s! That is bad.', note.id);
        return note;
      }

      if(localDbReturnedEntry.hasOwnProperty('ok') === false || localDbReturnedEntry.ok === false) {
        console.error('mergeToLocalDb: Return for note %s was not ok:', note.id, localDbReturnedEntry);
        return note;
      }

      console.debug('mergeToLocalDb: Setting _rev of note %s ...', note.id);
      return note.set('_rev', get(localDbReturnedEntry, 'rev', undefined));
    });

    console.debug('mergeToLocalDb: Updated notes', updatedNotes);

    const localDbNotesReplacedWithUpdated: List<Note> = localDbNotes.map((note: Note): Note => {
      if(replaceNoteIds.indexOf(note.id) > -1) {
        return updatedNotes.find((updatedNote: Note) => updatedNote.id === note.id);
      }

      return note;
    });

    const notesNotYetInLocalDb: List<Note> = updatedNotes.reduce((newList: List<Note>, note: Note) => {
      if(appendNoteIds.indexOf(note.id) > -1) {
        return newList.push(note);
      }

      return newList;
    }, List());

    return localDbNotesReplacedWithUpdated.concat(notesNotYetInLocalDb);
  }

  public mergeNotes(leftNote: Note, rightNote: Note, source: string): Note|null {
    const LN_rev: string = get(leftNote, '_rev', '');
    const RN_rev: string = get(rightNote, '_rev', '');

    const LNVersion: string|null = get(leftNote, 'version', null);
    const RNVersion: string|null = get(rightNote, 'version', null);

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    if(typeof leftNote === 'undefined' && typeof rightNote !== 'undefined') {
      console.debug('mergeNotes: leftNote is undefined, adding as new note ...');
      return rightNote.set$_api(source, true);
    } else
    if(typeof leftNote !== 'undefined' && typeof rightNote === 'undefined') {
      console.debug('mergeNotes: rightNote is undefined, adding as new note ...');
      return leftNote.set$_api(source, true);
    } else
    if(typeof leftNote === 'undefined' && typeof rightNote === 'undefined') {
      console.error('mergeNotes: Whoops, something bad happened. Both sides (leftNote, rightNote) are undefined.');
      return null;
    }

    console.debug('mergeNotes: leftNote', leftNote.toJS());
    console.debug('mergeNotes: rightNote', rightNote.toJS());

    [oldNote, newNote] = this.mergeNotesGetOldAndNewByRevision(leftNote, rightNote);
    if(oldNote !== null && newNote !== null) {
      return oldNote.mergeWithNote(newNote).set$_api(source, false);
    } else {
      console.debug('mergeNotes: Could not determine old or new based on revision number, trying version ...');
      [oldNote, newNote] = this.mergeNotesGetOldAndNewByVersion(leftNote, rightNote);
      if(oldNote !== null && newNote !== null) {
        return oldNote.mergeWithNote(newNote).set$_api(source, false);
      } else {
        console.debug('mergeNotes: Could not determine old or new based on version, tryingt updated_at ...');
        [oldNote, newNote] = this.mergeNotesGetOldAndNewByUpdatedAt(leftNote, rightNote);
        if(oldNote !== null && newNote !== null) {
          return oldNote.mergeWithNote(newNote).set$_api(source, false);
        } else {
          console.debug('mergeNotes: Looks like both notes are identical, returning the rightNote ...');
          return rightNote.set$_api(source, false);
        }
      }
    }

    console.warn('mergeNotes: This code shall never be reached.');
    return rightNote.set$_api(source, false);
  }

  private mergeNotesGetOldAndNewByRevision(leftNote: Note, rightNote: Note): [Note, Note] {
    const LN_rev: string = get(leftNote, '_rev', '');
    const RN_rev: string = get(rightNote, '_rev', '');

    const LNRevision: number = getRevisionNumber(LN_rev);
    const RNRevision: number = getRevisionNumber(RN_rev);

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    if(LNRevision < RNRevision
    && LN_rev !== '' && RN_rev !== '') { // Left is the older one
      console.debug('mergeNotesGetOldAndNewByRevision: Left is old, right is new, based on revision number (%s < %s)...', LNRevision, RNRevision);
      oldNote = leftNote;
      newNote = rightNote;
    } else
    if(LNRevision > RNRevision
    && LN_rev !== '' && RN_rev !== '') {
      console.debug('mergeNotesGetOldAndNewByRevision: Right is old, left is new, based on revision number (%s > %s)...', LNRevision, RNRevision);
      oldNote = rightNote;
      newNote = leftNote;
    } else {
      // Return null null
    }

    return [oldNote, newNote];
  }

  private mergeNotesGetOldAndNewByVersion(leftNote: Note, rightNote: Note): [Note, Note] {
    const LNVersion: string|null = get(leftNote, 'version', null);
    const RNVersion: string|null = get(rightNote, 'version', null);

    const LNVersionOID: ObjectID|null = LNVersion !== null ? new ObjectID(LNVersion) : null;
    const RNVersionOID: ObjectID|null = RNVersion !== null ? new ObjectID(RNVersion) : null;

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    if(LNVersionOID !== null && RNVersionOID !== null
    && LNVersionOID.getTimestamp() < RNVersionOID.getTimestamp()) {
      console.debug('mergeNotesGetOldAndNewByVersion: Left is old, right is new, based on version ...');
      oldNote = leftNote;
      newNote = rightNote;
    } else
    if(LNVersionOID !== null && RNVersionOID !== null
    && RNVersionOID.getTimestamp() < LNVersionOID.getTimestamp()) {
      console.debug('mergeNotesGetOldAndNewByVersion: Right is old, left is new, based on version ...');
      oldNote = rightNote;
      newNote = leftNote;
    } else {
      // Return null null
    }

    return [oldNote, newNote];
  }

  private mergeNotesGetOldAndNewByUpdatedAt(leftNote: Note, rightNote: Note): [Note, Note] {
    const LNUpdatedAt: Date = new Date(get(leftNote, 'updated_at', (new Date()).toISOString()));
    const RNUpdatedAt: Date = new Date(get(rightNote, 'updated_at', (new Date()).toISOString()));

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    if(LNUpdatedAt < RNUpdatedAt) {
      console.debug('mergeNotesGetOldAndNewByUpdatedAt: Left is old, right is new, based on updated_at ...');
      oldNote = leftNote;
      newNote = rightNote;
    } else if(LNUpdatedAt > RNUpdatedAt) {
      console.debug('mergeNotesGetOldAndNewByUpdatedAt: Right is old, left is new, based on updated_at ...');
      oldNote = rightNote;
      newNote = leftNote;
    } else {
      // Return null null
    }

    return [oldNote, newNote];
  }

  public newNote(fields?: INote): string|null {
    const objectId: ObjectID = new ObjectID();
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
