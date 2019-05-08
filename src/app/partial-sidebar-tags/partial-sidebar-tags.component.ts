import { Component, OnInit } from '@angular/core';
import { Note } from '../notes/note';
import { MockNotes } from '../notes/mock';
import { map, reduce, merge } from 'lodash';

@Component({
  selector: 'partial-sidebar-tags',
  templateUrl: './partial-sidebar-tags.component.html',
  styleUrls: ['./partial-sidebar-tags.component.scss']
})
export class PartialSidebarTagsComponent implements OnInit {
  tags: Array<string> = [];

  constructor() {
  }

  ngOnInit() {
    this.tags = reduce(map(MockNotes, (note: Note) => {
      return note.tags;
    }), (res: Array<string>, tags: Array<string>) => {
      return merge(res, tags);
    }, []);
  }

}
