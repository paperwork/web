import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

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
      title: ['', Validators.required],
      body: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.toolbarService.state = get(history, 'state.toolbarState', this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT);

    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.noteId = params.get('id');
        return this.notesService.show(this.noteId);
      }),
      tap(note => this.editor.patchValue(note))
    );

    this.editor.get('body').valueChanges.subscribe(value => this.notesService.updateField(this.noteId, 'body', value));
    this.editor.get('title').valueChanges.subscribe(value => this.notesService.updateField(this.noteId, 'title', value));
  }

  setAll(state: number) {
    console.log("Setting state:", state);
    this.toolbarState = state;
    if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT) {
      this.modeEdit = true;
    } else {
      this.modeEdit = false;
      console.log(this.editor)
    }
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if((value || '').trim()) {
      this.notesService.pushToField(this.noteId, 'tags', value.trim());
    }

    if(input) {
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    this.notesService.popFromField(this.noteId, 'tags', tag);
  }

  removeAttachment(attachment: string): void {
    this.notesService.popFromField(this.noteId, 'attachments', attachment);
  }
}
