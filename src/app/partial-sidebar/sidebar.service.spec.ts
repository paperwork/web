import { TestBed } from '@angular/core/testing';

import { SidebarService } from './sidebar.service';

describe('SidebarnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidebarnService = TestBed.get(SidebarnService);
    expect(service).toBeTruthy();
  });
});
