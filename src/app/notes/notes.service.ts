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

import DiffMatchPatch from 'diff-match-patch';
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
    const LN_rev: string = get(leftNote, '_rev', '');
    const RN_rev: string = get(rightNote, '_rev', '');

    const LNVersion: string|null = get(leftNote, 'version', null);
    const RNVersion: string|null = get(rightNote, 'version', null);

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    /*
      Let's see if both notes still have the same version (relevant for api <-> localDb sync) and the same _rev
      (relevant for localDb <-> memDb sync). If so, it means that we're simply dealing with an edited note.
    */
    if(LN_rev === RN_rev
    && LN_rev !== '') {
      [oldNote, newNote] = this.mergeNotesGetOldAndNewByUpdatedAt(leftNote, rightNote);
      if(oldNote !== null && newNote !== null) {
        return newNote;
      } else {
        return rightNote;
      }
    } else
    if(LN_rev === RN_rev
    && LN_rev === '') {
      if(LNVersion === RNVersion) {
        [oldNote, newNote] = this.mergeNotesGetOldAndNewByUpdatedAt(leftNote, rightNote);
        if(oldNote !== null && newNote !== null) {
          return newNote;
        } else {
          return rightNote;
        }
      } else {
        /*
          Here, we have the case that a note has changed on the server side, is coming in through the api and shall now
          be synced into the localDb, so it's api -> localDb. When we sync with the api, we don't have _rev, but we
          do have the version available. It's pretty much the same thing, it's just a different format. While _rev is
          a hash prefixed with an incrementing number that's used by PouchDB, version is a MongoDB ObjectID. The cool
          thing about using an ObjectID as version is, that we have information like a timestamp encoded in the ID.

          In order to find out, which whether a version succeeds another, we can simply compare their timestamps with
          each other.
        */
        [oldNote, newNote] = this.mergeNotesGetOldAndNewByVersion(leftNote, rightNote);
        if(oldNote !== null && newNote !== null) {
          return this.mergeNotesOldToNew(oldNote, newNote);
        } else {
          [oldNote, newNote] = this.mergeNotesGetOldAndNewByUpdatedAt(leftNote, rightNote);
          if(oldNote !== null && newNote !== null) {
            return this.mergeNotesOldToNew(oldNote, newNote);
          } else {
            console.debug('mergeNotes: Man, what the... will simply return one of the notes now.');
            return rightNote;
          }
        }
      }


    /*
      Next, let's see if _rev is different. If that's the case, it means that one note has been updated in the
      background. The scenario could look like this:

      The user opened a note from memDb that was previously synced from localDb and contained the same _rev,
      e.g. 1-03a137fe0... . The kept it open for editing, meanwhile the sync between api <-> localDb updated this note,
      resulting in its _rev to be increased to e.g. 2-e8a451cf9... . After that, the user finished editing his note and
      saves it to memDb. This also triggers a memDb <-> localDb sync. In this case, leftNote would be the one from
      localDb (2-e8a451cf9...) and rightNote would be the one that the user edited (still 1-03a137fe0...). This means
      we now need to try to merge the changes, by taking a look at what changed from the initial
      version (1-03a137fe0...) to the edited version (also 1-03a137fe0...) and see if we can apply those changes onto
      the current localDb version (2-e8a451cf9...).
    */
    } else if(LN_rev !== RN_rev) {
      [oldNote, newNote] = this.mergeNotesGetOldAndNewByRevision(leftNote, rightNote);
      if(oldNote !== null && newNote !== null) {
        return this.mergeNotesOldToNew(oldNote, newNote);
      } else {
        console.debug('mergeNotes: Could not determine old or new based on revision number, trying version ...');
        [oldNote, newNote] = this.mergeNotesGetOldAndNewByVersion(leftNote, rightNote);
        if(oldNote !== null && newNote !== null) {
          return this.mergeNotesOldToNew(oldNote, newNote);
        } else {
          console.debug('mergeNotes: Could not determine old or new based on version, tryingt updated_at ...');
          [oldNote, newNote] = this.mergeNotesGetOldAndNewByUpdatedAt(leftNote, rightNote);
          if(oldNote !== null && newNote !== null) {
            return this.mergeNotesOldToNew(oldNote, newNote);
          } else {
            console.debug('mergeNotes: Dude, what the... will simply return one of the notes now.');
            return rightNote;
          }
        }
      }
    }

    console.warn('mergeNotes: This code shall never be reached.');
    return rightNote;
  }

  private mergeNotesOldToNew(oldNote: Note, newNote: Note): Note {
    const dmp = new DiffMatchPatch();

    const ON_original: Note|null = get(oldNote, '_original', null);

    let diffAgainstNote: Note;

    if(ON_original === null) {
      console.warn('mergeNotesOldToNew: Old note has no _original included, will diff against new note.');
      diffAgainstNote = newNote;
    } else {
       diffAgainstNote = ON_original;
    }

    const mergedNote: Note = List(['title', 'body', 'attachments', 'tags', 'path']).reduce((note: Note, prop: string): Note => {
      let diffAgainstNotePropVal: string;
      let oldNotePropVal: string;
      let newNotePropVal: string;

      if(typeof newNote[prop] === 'object'
      && Array.isArray(newNote[prop]) === true) {
        diffAgainstNotePropVal = diffAgainstNote[prop].join('≠');
        oldNotePropVal = oldNote[prop].join('≠');
        newNotePropVal = newNote[prop].join('≠');
      } else if(typeof newNote[prop] === 'string') {
        diffAgainstNotePropVal = diffAgainstNote[prop];
        oldNotePropVal = oldNote[prop];
        newNotePropVal = newNote[prop];
      } else {
        console.warn('mergeNotesOldToNew: Dealing with an unknown property type, will not do anything and simply return the (new) note for this property ...');
        return note;
      }

      console.debug('mergeNotesOldToNew: diffAgainstNotePropVal', diffAgainstNotePropVal);
      console.debug('mergeNotesOldToNew: oldNotePropVal', oldNotePropVal);
      console.debug('mergeNotesOldToNew: newNotePropVal', newNotePropVal);

      let diff = dmp.diff_main(diffAgainstNotePropVal, oldNotePropVal, true);
      dmp.diff_cleanupSemantic(diff);
      let patch_list = dmp.patch_make(diffAgainstNotePropVal, oldNotePropVal, diff);
      let [newPropValue, lineByLineStatus] = dmp.patch_apply(patch_list, newNotePropVal);

      if(typeof newNote[prop] === 'object'
      && Array.isArray(newNote[prop]) === true) {
        return note.merge({
          [prop]: newPropValue.split('≠')
        });
      } else if(typeof newNote[prop] === 'string') {
        return note.merge({
          [prop]: newPropValue
        });
      }
    }, newNote);

    return mergedNote;
  }

  private mergeNotesGetOldAndNewByRevision(leftNote: Note, rightNote: Note): [Note, Note] {
    const LN_rev: string = get(leftNote, '_rev', '');
    const RN_rev: string = get(rightNote, '_rev', '');

    const LNRevision: number = getRevisionNumber(LN_rev);
    const RNRevision: number = getRevisionNumber(RN_rev);

    let oldNote: Note|null = null;
    let newNote: Note|null = null;

    if(LNRevision < RNRevision) { // Left is the older one
      console.debug('mergeNotesGetOldAndNewByRevision: Left is old, right is new, based on revision number ...');
      oldNote = leftNote;
      newNote = rightNote;
    } else if(LNRevision > RNRevision) {
      console.debug('mergeNotesGetOldAndNewByRevision: Right is old, left is new, based on revision number ...');
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

    if(LNVersionOID.getTimestamp() < RNVersionOID.getTimestamp()) {
      console.debug('mergeNotesGetOldAndNewByVersion: Left is old, right is new, based on version ...');
      oldNote = leftNote;
      newNote = rightNote;
    } else if(RNVersionOID.getTimestamp() < LNVersionOID.getTimestamp()) {
      console.debug('mergeNotesGetOldAndNewByVersion: Right is old, left is new, based on version ...');
      oldNote = rightNote;
      newNote = leftNote;
    } else {
      // Return null null
    }

    return [oldNote, newNote];
  }

  private mergeNotesGetOldAndNewByUpdatedAt(leftNote: Note, rightNote: Note): [Note, Note] {
    const LNUpdatedAt: Date = get(leftNote, 'updated_at', new Date());
    const RNUpdatedAt: Date = get(rightNote, 'updated_at', new Date());

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
