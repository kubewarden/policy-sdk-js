import { HostCall } from '../index';

export namespace Network {
  /**
   * Represents the response of a DNS lookup operation.
   */
  export class DnsLookupResponse {
    ips: string[];

    constructor(ips: string[]) {
      this.ips = ips;
    }
  }

  /**
   * Performs a DNS lookup for the given hostname.
   *
   * @param {string} hostname - The hostname to look up.
   * @returns {DnsLookupResponse} The response containing DNS lookup results.
   */
  export function dnsLookup(hostname: string): DnsLookupResponse {
    const payload = new TextEncoder().encode(JSON.stringify(hostname));
    const response = HostCall.hostCall('kubewarden', 'net', 'v1/dns_lookup_host', payload.buffer);
    const responseString = new TextDecoder().decode(response);

    return JSON.parse(responseString) as DnsLookupResponse;
  }
}
