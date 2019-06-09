import { TestBed } from '@angular/core/testing';

import { UsersJournalsService } from './journals.service';

describe('UsersJournalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UsersJournalsService = TestBed.get(UsersJournalsService);
    expect(service).toBeTruthy();
  });
});
