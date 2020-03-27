import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ToolbarService, ToolbarAction, ToolbarActionPayload } from '../../partial-toolbar-main/toolbar.service';
import { NotesService } from '../notes.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Note, TNoteAccess } from '../note';
import { get } from 'lodash';
import { Record, List } from 'immutable';
import { AlertService } from '../../partial-alert/alert.service';

@Component({
  selector: 'partial-notes-show',
  templateUrl: './partial-notes-show.component.html',
  styleUrls: ['./partial-notes-show.component.scss']
})
export class PartialNotesShowComponent implements OnInit, OnDestroy {
  private toolbarStateSubscription: Subscription;
  private toolbarServiceActionsSubscription: Subscription;

  note: Note;
  noteId: string;
  note$: Observable<Note>;
  toolbarState: number;
  modeEdit: boolean;
  editor: FormGroup;
  noteAccessUpdate: TNoteAccess | null = null;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    public toolbarService: ToolbarService,
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {
    this.editor = formBuilder.group({
      color: 'primary',
      title: ['', Validators.required],
      tags: formBuilder.array([]),
      body: ['', Validators.required],
      path: [''],
      _rev: [''],
    });
  }

  ngOnInit() {
    this.note$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.noteId = params.get('id');
        return this.notesService.memDbShowObservable(this.noteId);
      }),
      tap((note?: Note) => {
        if(typeof note !== 'object'
        || (note.deleted_at instanceof Date && note.deleted_at <= new Date())
          ) {
          return this.router.navigate(['/notes']);
        }

        this.note = note;
        const noteObject = note.toJS();
        const additionalTagControlsRequired: number = noteObject.tags.length - this.tags.length;
        for(let i = 0; i < additionalTagControlsRequired; i++) {
          this.tags.push(new FormControl());
        }

        this.editor.patchValue(noteObject);
        this.noteAccessUpdate = null;
        this.toolbarService.targetNotes = List([note]);
      })
    );

    this.toolbarStateSubscription = this.toolbarService.state$.subscribe((state: number) => {
      this.setAll(state);
    });

    this.toolbarServiceActionsSubscription = this.toolbarService.actions$.subscribe((toolbarAction: ToolbarAction) => {
      switch(toolbarAction.action) {
        case 'duplicate': return this.toolbarActionDuplicate(toolbarAction.payload);
        case 'move':      return this.toolbarActionMove(toolbarAction.payload);
        case 'print':     return this.toolbarActionPrint(toolbarAction.payload);
        case 'export':    return this.toolbarActionExport(toolbarAction.payload);
        case 'share':     return this.toolbarActionShare(toolbarAction.payload);
        case 'delete':    return this.toolbarActionDelete(toolbarAction.payload);
        case '0x90':      return true;
        default: console.log('Unhandled action: %s', toolbarAction.action); return false;
      }
    });

    this.toolbarService.state = get(history, 'state.toolbarState', this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT);
  }

  ngOnDestroy() {
    if(typeof this.toolbarStateSubscription !== 'undefined') {
      this.toolbarStateSubscription.unsubscribe();
    }

    if(typeof this.toolbarServiceActionsSubscription !== 'undefined') {
      this.toolbarServiceActionsSubscription.unsubscribe();
    }
  }

  setAll(state: number) {
    this.toolbarState = state;
    if(state === this.toolbarService.TOOLBAR_STATE_BACK_MODE_EDIT) {
      this.modeEdit = true;
    } else if(state === this.toolbarService.TOOLBAR_STATE_BACK_DEFAULT) {
      this.modeEdit = false;

      // Store all values
      this.saveNote();
    }
  }

  saveNote(id?: string, fieldsToSave?: object) {
    if(typeof id !== 'string') {
      id = this.noteId;
    }

    let allFields = {
      'title': this.editor.get(['title']).value,
      'tags': this.tags.controls.map((tagControl) => tagControl.value),
      'body': this.editor.get(['body']).value,
      'path': this.editor.get(['path']).value,
      'updated_at': (new Date()).toISOString(),

      '_rev': this.editor.get(['_rev']).value,
      '$_original': this.note,
    };

    if(this.noteAccessUpdate !== null) {
      allFields['access'] = this.noteAccessUpdate;
    }

    let toBeSavedFields: Object = allFields;

    if(typeof fieldsToSave === 'object') {
      toBeSavedFields = Object.keys(allFields).reduce((newFields: object, field: string) => {
        if(fieldsToSave[field] === false) {
          delete newFields[field];
        }

        return newFields;
      }, allFields);
    }

    console.log(toBeSavedFields);

    this.notesService.updateFields(id, toBeSavedFields);
    this.notesService.memDbToLocalDb();
  }

  deleteNote(id?: string) {
    if(typeof id !== 'string') {
      id = this.noteId;
    }

    this.notesService.delete(id);
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

  private toolbarActionDuplicate(payload: ToolbarActionPayload) {
    const id: string|null = this.notesService.newNote();

    if(id === null) {
      this.alertService.error('Could not duplicate note!');
      return false;
    }

    this.saveNote(id, payload);
    this.alertService.success(`Duplicated note! <a color="white" href="/notes/${id}">Click here to open duplicate now.</a>`);
  }

  private toolbarActionMove(payload: ToolbarActionPayload) {
    this.editor.get(['path']).setValue(payload.path);
    this.saveNote();
    this.alertService.success(`Moved note to folder '${payload.path}'!`);
  }

  private toolbarActionPrint(payload: ToolbarActionPayload) {
    return this.router.navigate([]).then(result => {
      window.open(`/print/notes/${this.noteId}`, '_blank');
    });
  }

  private toolbarActionExport(payload: ToolbarActionPayload) {
    this.saveNote();
    // TODO: Save to back-end, request export endpoint
  }

  private toolbarActionShare(payload: ToolbarActionPayload) {
    this.noteAccessUpdate = payload.access;
    this.saveNote();
    this.alertService.success(`Shared note!`);
  }

  private toolbarActionDelete(payload: ToolbarActionPayload) {
    this.deleteNote();
    this.alertService.success(`Deleted note!`);
  }

}
