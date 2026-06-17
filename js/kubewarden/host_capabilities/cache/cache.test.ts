import * as HostCall from '../index';

import { Cache } from './cache';

describe('Cache Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send a set request with the encoded key, ttl and value', () => {
    const key = 'my-key';
    const value = new Uint8Array([1, 2, 3]);
    const ttl = 60;

    const expectedRequest = { key, ttl, value: Array.from(value) };
    const expectedPayload = new TextEncoder().encode(JSON.stringify(expectedRequest));
    const mockResponse = new TextEncoder().encode(JSON.stringify({ code: 0, message: 'ok' }));

    const mockHostCall = jest.spyOn(HostCall.HostCall, 'hostCall').mockReturnValue(mockResponse);

    Cache.set(key, value, ttl);

    expect(mockHostCall).toHaveBeenCalledWith('kubewarden', 'cache', 'set', expectedPayload.buffer);
  });

  it('should return the stored value on a cache hit', () => {
    const stored = [1, 2, 3];
    const mockResponse = new TextEncoder().encode(
      JSON.stringify({ code: 0, message: 'hit', value: stored }),
    );

    jest.spyOn(HostCall.HostCall, 'hostCall').mockReturnValue(mockResponse);

    const result = Cache.get('my-key');

    expect(result).toEqual(new Uint8Array(stored));
  });

  it('should return null on a cache miss', () => {
    const mockResponse = new TextEncoder().encode(JSON.stringify({ code: 0, message: 'miss' }));

    jest.spyOn(HostCall.HostCall, 'hostCall').mockReturnValue(mockResponse);

    const result = Cache.get('absent');

    expect(result).toBeNull();
  });

  it('should throw when the host rejects a reserved key', () => {
    const mockResponse = new TextEncoder().encode(
      JSON.stringify({ code: 1, message: "the key prefix 'kubewarden_internal_' is reserved" }),
    );

    jest.spyOn(HostCall.HostCall, 'hostCall').mockReturnValue(mockResponse);

    expect(() => Cache.set('kubewarden_internal_x', new Uint8Array([1]), 60)).toThrow();
  });
});
