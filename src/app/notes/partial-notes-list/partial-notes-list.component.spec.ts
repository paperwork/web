import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialNotesListComponent } from './partial-notes-list.component';

describe('PartialNotesListComponent', () => {
  let component: PartialNotesListComponent;
  let fixture: ComponentFixture<PartialNotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialNotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialNotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
