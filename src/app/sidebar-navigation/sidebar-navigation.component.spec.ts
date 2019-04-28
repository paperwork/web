import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNavigationComponent } from './sidebar-navigation.component';

describe('SidebarNavigationComponent', () => {
  let component: SidebarNavigationComponent;
  let fixture: ComponentFixture<SidebarNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
