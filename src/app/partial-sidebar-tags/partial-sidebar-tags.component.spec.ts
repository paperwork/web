import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialSidebarTagsComponent } from './partial-sidebar-tags.component';

describe('PartialSidebarTagsComponent', () => {
  let component: PartialSidebarTagsComponent;
  let fixture: ComponentFixture<PartialSidebarTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialSidebarTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialSidebarTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
