import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'partial-users-settings-show',
  templateUrl: './partial-users-settings-show.component.html',
  styleUrls: ['./partial-users-settings-show.component.scss']
})
export class PartialUsersSettingsShowComponent implements OnInit {
  settings: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.settings = formBuilder.group({
      emailWhenSomeoneSharedNoteWithMe: {value: '', disabled: true},
      emailWhenSomeoneAddedToSharedNote: {value: '', disabled: true},
      emailWhenSomeoneLeftSharedNote: {value: '', disabled: true},
      displayThemeAlwaysDark: {value: '', disabled: true},
      displayThemeAutoDark: {value: '', disabled: true},
    });
  }

  ngOnInit() {
  }

}
