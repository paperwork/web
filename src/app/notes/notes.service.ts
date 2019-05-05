import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Note } from './note';
import { MockNotes } from './mock';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  constructor() { }

  getNotes(): Observable<Note[]> {
    return of(MockNotes);
  }

  public show(id: string) {
    return this.getNotes().pipe(
      map((notes: Note[]) => notes.find(note => note.id === id))
    );
  }
}
