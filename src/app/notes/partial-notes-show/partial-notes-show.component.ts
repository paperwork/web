import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ToolbarService } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Note } from '../note';
import { get } from 'lodash';
import { Record } from 'immutable';

@Component({
  selector: 'partial-notes-show',
  templateUrl: './partial-notes-show.component.html',
  styleUrls: ['./partial-notes-show.component.scss']
})
export class PartialNotesShowComponent implements OnInit, OnDestroy {
  private toolbarStateSubscription: Subscription;

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
    this.editor = formBuilder.group({
      color: 'primary',
      title: ['', Validators.required],
      body: ['', Validators.required],
      tags: formBuilder.array([])
    });
  }

  ngOnInit() {
    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.noteId = params.get('id');
        return this.notesService.show(this.noteId);
      }),
      tap((note?: Note) => {
        if(typeof note !== 'object') {
          return this.router.navigate(['/notes']);
        }

        const noteObject = note.toJS();
        const additionalTagControlsRequired: number = noteObject.tags.length - this.tags.length;
        for(let i = 0; i < additionalTagControlsRequired; i++) {
          this.tags.push(new FormControl());
        }

        this.editor.patchValue(noteObject);
      })
    );

    this.toolbarStateSubscription = this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });

    this.toolbarService.state = get(history, 'state.toolbarState', this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT);
  }

  ngOnDestroy() {
    if(typeof this.toolbarStateSubscription !== 'undefined') {
      this.toolbarStateSubscription.unsubscribe();
    }
  }

  setAll(state: number) {
    this.toolbarState = state;
    if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT) {
      this.modeEdit = true;
    } else if(state === this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT) {
      this.modeEdit = false;

      // Store all values
      this.notesService.updateFields(this.noteId, {
        'title': this.editor.get(['title']).value,
        'tags': this.tags.controls.map((tagControl) => tagControl.value),
        'body': this.editor.get(['body']).value
      });
    }
  }

  get tags(): FormArray {
    return this.editor.get('tags') as FormArray;
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if((value || '').trim().length > 0) {
      this.tags.push(this.formBuilder.control(value.trim()));
    }

    if(typeof input !== 'undefined') {
      input.value = '';
    }
  }

  removeTag(tagIndex: number): void {
    this.tags.removeAt(tagIndex);
  }


  get attachments(): FormArray {
    return this.editor.get('attachments') as FormArray;
  }

  // TODO
  addAttachment(): void {
  }

  removeAttachment(attachmentIndex: number): void {
    this.attachments.removeAt(attachmentIndex);
  }
}
