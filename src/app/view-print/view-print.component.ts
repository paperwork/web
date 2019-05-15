import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Note } from '../notes/note';
import { NotesService } from '../notes/notes.service';
import { List } from 'immutable';

@Component({
  selector: 'view-print',
  templateUrl: './view-print.component.html',
  styleUrls: ['./view-print.component.scss']
})
export class ViewPrintComponent implements OnInit {
  private resource: string;
  private resourceIds: Array<string>;
  private entities: List<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private notesService: NotesService
  ) { }

  ngOnInit() {
    this.resource = this.activatedRoute.snapshot.params['resource'];
    this.resourceIds = this.activatedRoute.snapshot.params['ids'].split(',');

    switch(this.resource) {
    case 'notes':
      this.entities = this.notesService.listSnapshot().filter((note: Note) => {
        return this.resourceIds.indexOf(note.id) > -1;
      });
      break;
    default:
      break;
    }

    window.print();
  }

}
