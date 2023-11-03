import { TestBed } from '@angular/core/testing';

import { NamevalidationService } from './namevalidation.service';

describe('NamevalidationService', () => {
  let service: NamevalidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NamevalidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
