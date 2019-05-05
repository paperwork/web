import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Note } from '../note';
import { get } from 'lodash';

@Component({
  selector: 'partial-notes-show',
  templateUrl: './partial-notes-show.component.html',
  styleUrls: ['./partial-notes-show.component.scss']
})
export class PartialNotesShowComponent implements OnInit {
  noteId: string;
  note$: Observable<Note>;
  toolbarState: number;
  modeEdit: boolean;
  editor: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private toolbarService: ToolbarService,
    private formBuilder: FormBuilder
  ) {
    this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });

    this.editor = formBuilder.group({
      color: 'primary',
      body: ['', Validators.min(10)],
    });
  }

  ngOnInit() {
    this.setAll(get(history, 'state.toolbarState', this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT));

    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.noteId = params.get('id');
        return this.notesService.show(this.noteId);
      }),
      tap(note => this.editor.patchValue(note))
    );

    this.editor.get('body').valueChanges.subscribe(value => this.notesService.updateField(this.noteId, 'body', value));
  }

  setAll(state: number) {
    this.toolbarState = state;
    if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT) {
      this.modeEdit = true;
    } else {
      this.modeEdit = false;
      console.log(this.editor)
    }
  }
}
