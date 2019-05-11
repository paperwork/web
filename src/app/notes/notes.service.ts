import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { CollectionService } from '../../lib/collection.service';
import { Note } from './note';
import { MockNotes } from './mock';

@Injectable({
  providedIn: 'root'
})
export class NotesService extends CollectionService {
  collectionName: string = 'notes';
  index: string = 'id,created_at';

  constructor() {
    super();
  }

  async onCollectionInit(): Promise<boolean> {
    const test = await this.collection.toArray();
    console.log(test);
    return true;
  }

  getNotes(): Observable<Note[]> {
    return of(MockNotes);
  }

  public show(id: string) {
    return this.getNotes().pipe(
      map((notes: Note[]) => notes.find(note => note.id === id))
    );
  }

  public updateField(id: string, field: string, value: any) {
    let note: Note = MockNotes.find(note => note.id === id);
    note[field] = value;
  }

  public pushToField(id: string, field: string, value: any) {
    let note: Note = MockNotes.find(note => note.id === id);
    note[field].push(value);
  }

  public popFromField(id: string, field: string, value: any) {
    let note: Note = MockNotes.find(note => note.id === id);
    const idx = note[field].indexOf(value);

    if(idx >= 0) {
      note[field].splice(idx, 1);
    }
  }
}
