import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialToolbarLogoComponent } from './partial-toolbar-logo.component';

describe('PartialToolbarLogoComponent', () => {
  let component: PartialToolbarLogoComponent;
  let fixture: ComponentFixture<PartialToolbarLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialToolbarLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialToolbarLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
