import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoginComponent } from './view-login.component';

describe('ViewLoginComponent', () => {
  let component: ViewLoginComponent;
  let fixture: ComponentFixture<ViewLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
