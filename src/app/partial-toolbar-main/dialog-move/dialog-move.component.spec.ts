import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMoveComponent } from './dialog-move.component';

describe('DialogMoveComponent', () => {
  let component: DialogMoveComponent;
  let fixture: ComponentFixture<DialogMoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogMoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
