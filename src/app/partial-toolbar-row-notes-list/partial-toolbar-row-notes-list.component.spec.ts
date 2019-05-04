import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialToolbarRowNotesListComponent } from './partial-toolbar-row-notes-list.component';

describe('PartialToolbarRowNotesListComponent', () => {
  let component: PartialToolbarRowNotesListComponent;
  let fixture: ComponentFixture<PartialToolbarRowNotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialToolbarRowNotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialToolbarRowNotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
