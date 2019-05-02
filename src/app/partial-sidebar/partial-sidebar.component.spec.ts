import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {PartialSidebarComponent } from './partial-sidebar.component';

describe('PartialSidebarComponent', () => {
  let component:PartialSidebarComponent;
  let fixture: ComponentFixture<PartialSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PartialSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
