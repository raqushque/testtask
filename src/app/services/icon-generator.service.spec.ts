import { TestBed } from '@angular/core/testing';

import { IconGeneratorService } from './icon-generator.service';

describe('IconGeneratorService', () => {
  let service: IconGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
