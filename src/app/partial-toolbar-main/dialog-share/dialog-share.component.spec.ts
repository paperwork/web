import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShareComponent } from './dialog-share.component';

describe('DialogShareComponent', () => {
  let component: DialogShareComponent;
  let fixture: ComponentFixture<DialogShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
