import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { Note } from '../note';
import { get } from 'lodash';

@Component({
  selector: 'partial-notes-show',
  templateUrl: './partial-notes-show.component.html',
  styleUrls: ['./partial-notes-show.component.scss']
})
export class PartialNotesShowComponent implements OnInit {
  note$: Observable<Note>;
  toolbarState: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private toolbarService: ToolbarService
  ) {
    this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });
  }

  ngOnInit() {
    this.toolbarService.state = get(history, 'state.toolbarState', this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT);

    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.notesService.show(params.get('id')))
    );
  }

  setAll(state: number) {
    this.toolbarState = state;
  }
}
