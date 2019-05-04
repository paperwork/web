import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialToolbarRowLogoComponent } from './partial-toolbar-row-logo.component';

describe('PartialToolbarRowLogoComponent', () => {
  let component: PartialToolbarRowLogoComponent;
  let fixture: ComponentFixture<PartialToolbarRowLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialToolbarRowLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialToolbarRowLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
