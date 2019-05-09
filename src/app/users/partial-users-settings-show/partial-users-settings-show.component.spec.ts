import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialUsersSettingsShowComponent } from './partial-users-settings-show.component';

describe('PartialUsersSettingsShowComponent', () => {
  let component: PartialUsersSettingsShowComponent;
  let fixture: ComponentFixture<PartialUsersSettingsShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialUsersSettingsShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialUsersSettingsShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
