import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialToolbarMainComponent } from './partial-toolbar-main.component';

describe('PartialToolbarMainComponent', () => {
  let component: PartialToolbarMainComponent;
  let fixture: ComponentFixture<PartialToolbarMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialToolbarMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialToolbarMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
