import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialSidebarNavigationComponent } from './partial-sidebar-navigation.component';

describe('PartialSidebarNavigationComponent', () => {
  let component: PartialSidebarNavigationComponent;
  let fixture: ComponentFixture<PartialSidebarNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialSidebarNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialSidebarNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
