import { TestBed } from '@angular/core/testing';

import { SharedCommunication } from './shared-communication';

describe('SharedCommunication', () => {
  let service: SharedCommunication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCommunication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
