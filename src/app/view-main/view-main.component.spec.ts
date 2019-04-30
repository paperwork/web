import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMainComponent } from './view-main.component';

describe('ViewMainComponent', () => {
  let component: ViewMainComponent;
  let fixture: ComponentFixture<ViewMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
