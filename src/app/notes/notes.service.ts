import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import { ObjectId } from '../../lib/objectid.helper';

import { tokenGetDecoded } from '../../lib/token.helper';
import { CollectionService, ICollectionService } from '../../lib/collection.service';
import { Note, INote, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER } from './note';

@Injectable({
  providedIn: 'root'
})
export class NotesService extends CollectionService implements ICollectionService {
  collectionName: string = 'notes';
  index: string = 'id,created_at';

  private _entries: BehaviorSubject<List<Note>> = new BehaviorSubject(List([]));
  public readonly entries: Observable<List<Note>> = this._entries.asObservable();

  constructor() {
    super();
  }

  async onCollectionInit(): Promise<boolean> {
    const rows = await this.collection.toArray();
    let entries = (<Object[]>rows).map((note: any) => new Note(note));
    this._entries.next(List(entries));

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
      this.changeEntry(this._entries, changeType, changedEntryId);
    } else {
      this.changeEntry(this._entries, changeType, changedEntryId, new Note(changedEntry));
    }
    return true;
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
    const note: Note = (new Note(fields).addAccess(userGid, NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER));

    if(this.create(note) === true) {
      return id;
    }

    return null;
  }

  public create(note: Note): boolean {
    return this.changeEntry(this._entries, 'created', null, note);
  }

  public update(id: string, note: Note): boolean {
    return this.changeEntry(this._entries, 'updated', id, note);
  }

  public delete(id: string): boolean {
    return this.changeEntry(this._entries, 'updated', id);
  }

  public updateFields(id: string, fieldsValuesMap: object): boolean {
    const note: Note|null = this.getEntryById(this._entries, id);

    if(note === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedNote: Note = note.merge(fieldsValuesMap);

    return this.update(id, updatedNote);
  }

  public updateField(id: string, field: string, value: any): boolean {
    const note: Note|null = this.getEntryById(this._entries, id);

    if(note === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    const updatedNote: Note = note.merge({
      [field]: value
    });

    return this.update(id, updatedNote);
  }

  public pushToField<T>(id: string, field: string, value: T) {
    const note: Note|null = this.getEntryById(this._entries, id);

    if(note === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    let fieldList: List<T>;
    if(note[field].length > 0) {
      fieldList = List.of(note[field]);
    }  else {
      fieldList = List();
    }

    const updatedNote: Note = note.merge({
      [field]: fieldList.push(value).toArray()
    });

    return this.update(id, updatedNote);
  }

  public popFromField<T>(id: string, field: string, value: T) {
    const note: Note|null = this.getEntryById(this._entries, id);

    if(note === null) {
      console.log('Entry with ID %s not found!', id);
      return false;
    }

    if(note[field].length === 0) {
      return false;
    }

    const currentValues: List<T> = List.of(note[field]);
    const idx: number = currentValues.indexOf(value);

    if(idx === -1) {
      return false;
    }

    const updatedNote: Note = note.merge({
      [field]: currentValues.delete(idx).toArray()
    });

    return this.update(id, updatedNote);
  }
}
