import { OLMapOptions } from './olmap-options';

describe('OLMapOptions', () => {
  it('should create an instance', () => {
    expect(new OLMapOptions([0,0], 0)).toBeTruthy();
  });
});
