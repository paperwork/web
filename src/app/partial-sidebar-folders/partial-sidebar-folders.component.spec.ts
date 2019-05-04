import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialSidebarFoldersComponent } from './partial-sidebar-folders.component';

describe('PartialSidebarFoldersComponent', () => {
  let component: PartialSidebarFoldersComponent;
  let fixture: ComponentFixture<PartialSidebarFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialSidebarFoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialSidebarFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
