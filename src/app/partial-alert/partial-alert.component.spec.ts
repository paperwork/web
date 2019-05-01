import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialAlertComponent } from './partial-alert.component';

describe('PartialAlertComponent', () => {
  let component: PartialAlertComponent;
  let fixture: ComponentFixture<PartialAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
