import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialToolbarNotesListComponent } from './partial-toolbar-notes-list.component';

describe('PartialToolbarNotesListComponent', () => {
  let component: PartialToolbarNotesListComponent;
  let fixture: ComponentFixture<PartialToolbarNotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialToolbarNotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialToolbarNotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
