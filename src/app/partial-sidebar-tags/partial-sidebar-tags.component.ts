import { Component, OnInit, OnDestroy } from '@angular/core';
import { Note } from '../notes/note';
import { NotesService } from '../notes/notes.service';
import { Subscription } from 'rxjs';
import { union } from 'lodash';
import { List } from 'immutable';

@Component({
  selector: 'partial-sidebar-tags',
  templateUrl: './partial-sidebar-tags.component.html',
  styleUrls: ['./partial-sidebar-tags.component.scss']
})
export class PartialSidebarTagsComponent implements OnInit, OnDestroy {
  private notesServiceSubscription: Subscription;
  tags: Array<string> = [];

  constructor(
    private notesService: NotesService
  ) {
  }

  ngOnInit() {
    this.notesServiceSubscription = this.notesService.entries.subscribe((notes: List<Note>) => {
      this.tags = notes.map((note: Note) => {
        return note.get('tags');
      }).reduce((res: Array<string>, tags: Array<string>) => {
        return union(res, tags);
      }, []);
    })
  }

  ngOnDestroy() {
    if(typeof this.notesServiceSubscription !== 'undefined') {
      this.notesServiceSubscription.unsubscribe();
    }
  }

}
