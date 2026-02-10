import { TestBed } from '@angular/core/testing';

import { ApiServiceTs } from './api.service.ts';

describe('ApiServiceTs', () => {
  let service: ApiServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
