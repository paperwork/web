import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { Note } from '../note';

@Component({
  selector: 'partial-notes-show',
  templateUrl: './partial-notes-show.component.html',
  styleUrls: ['./partial-notes-show.component.scss']
})
export class PartialNotesShowComponent implements OnInit {
  note$: Observable<Note>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private toolbarService: ToolbarService
  ) {
    this.toolbarService.state = 0;
  }

  ngOnInit() {
    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.notesService.show(params.get('id')))
    );
  }

}
