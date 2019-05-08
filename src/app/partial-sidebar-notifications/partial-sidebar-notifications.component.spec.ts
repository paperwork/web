import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialSidebarNotificationsComponent } from './partial-sidebar-notifications.component';

describe('PartialSidebarNotificationsComponent', () => {
  let component: PartialSidebarNotificationsComponent;
  let fixture: ComponentFixture<PartialSidebarNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialSidebarNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialSidebarNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
