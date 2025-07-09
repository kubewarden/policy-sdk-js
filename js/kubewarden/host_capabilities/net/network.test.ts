import * as HostCall from '../index';

import { Network } from './network';

describe('Network Unit Tests', () => {
  it('should return correct IPs for given hostname', () => {
    const hostname = 'localhost';
    const expectedResponse = { ips: ['127.0.0.1'] };

    const expectedPayload = new TextEncoder().encode(JSON.stringify(hostname));
    const mockResponse = new TextEncoder().encode(JSON.stringify(expectedResponse));

    const mockHostCall = jest.spyOn(HostCall.HostCall, 'hostCall').mockReturnValue(mockResponse);

    const result = Network.dnsLookup(hostname);

    expect(mockHostCall).toHaveBeenCalledWith(
      'kubewarden',
      'net',
      'v1/dns_lookup_host',
      expectedPayload,
    );
    expect(result.ips[0]).toEqual(expectedResponse.ips[0]);
  });
});
