import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPrintComponent } from './view-print.component';

describe('ViewPrintComponent', () => {
  let component: ViewPrintComponent;
  let fixture: ComponentFixture<ViewPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
