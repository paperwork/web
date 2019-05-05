import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialNotesShowComponent } from './partial-notes-show.component';

describe('PartialNotesShowComponent', () => {
  let component: PartialNotesShowComponent;
  let fixture: ComponentFixture<PartialNotesShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialNotesShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialNotesShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
