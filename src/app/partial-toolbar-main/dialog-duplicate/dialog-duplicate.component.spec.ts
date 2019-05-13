import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDuplicateComponent } from './dialog-duplicate.component';

describe('DialogDuplicateComponent', () => {
  let component: DialogDuplicateComponent;
  let fixture: ComponentFixture<DialogDuplicateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDuplicateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDuplicateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
