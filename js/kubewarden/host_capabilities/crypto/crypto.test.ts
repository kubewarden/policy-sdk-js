import { HostCall } from '../';

import { Crypto } from './crypto';
import type { Certificate, CertificateVerificationResponse } from './types';

// Mock the HostCall
jest.mock('../', () => ({
  HostCall: {
    hostCall: jest.fn(),
  },
}));

// Get the mocked function
const mockedHostCall = HostCall.hostCall as jest.MockedFunction<typeof HostCall.hostCall>;

describe('Crypto', () => {
  beforeEach(() => {
    mockedHostCall.mockClear();
  });

  describe('verifyCert', () => {
    it('should call hostCall with correct parameters and return trusted result', () => {
      const cert: Certificate = {
        encoding: 'Pem',
        data: new Uint8Array([99, 101, 114, 116, 105, 102, 105, 99, 97, 116, 101, 48]), // "certificate0"
      };

      const certChain: Certificate[] = [
        {
          encoding: 'Pem',
          data: new Uint8Array([99, 101, 114, 116, 105, 102, 105, 99, 97, 116, 101, 49]), // "certificate1"
        },
        {
          encoding: 'Pem',
          data: new Uint8Array([99, 101, 114, 116, 105, 102, 105, 99, 97, 116, 101, 50]), // "certificate2"
        },
      ];

      const notAfter = '2021-10-01T00:00:00Z';

      const expectedResponse: CertificateVerificationResponse = {
        trusted: true,
        reason: '',
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const result = Crypto.verifyCert(cert, certChain, notAfter);

      // Verify hostCall was called with correct parameters
      const expectedPayload = JSON.stringify({
        cert,
        cert_chain: certChain,
        not_after: notAfter,
      });

      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'crypto',
        'v1/is_certificate_trusted',
        new TextEncoder().encode(expectedPayload).buffer,
      );

      // Verify result
      expect(result.trusted).toBe(true);
      expect(result.reason).toBe('');
    });

    it('should handle untrusted certificate', () => {
      const cert: Certificate = {
        encoding: 'Der',
        data: new Uint8Array([98, 97, 100, 99, 101, 114, 116]), // "badcert"
      };

      const certChain: Certificate[] = [];

      const expectedResponse: CertificateVerificationResponse = {
        trusted: false,
        reason: 'certificate not trusted',
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const result = Crypto.verifyCert(cert, certChain);

      // Verify result
      expect(result.trusted).toBe(false);
      expect(result.reason).toBe('certificate not trusted');
    });

    it('should handle empty not_after when undefined', () => {
      const cert: Certificate = {
        encoding: 'Pem',
        data: new Uint8Array([116, 101, 115, 116]), // "test"
      };

      const certChain: Certificate[] = [];

      const expectedResponse: CertificateVerificationResponse = {
        trusted: true,
        reason: '',
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const result = Crypto.verifyCert(cert, certChain);

      // Verify hostCall was called without not_after field when undefined
      const expectedPayload = JSON.stringify({
        cert,
        cert_chain: certChain,
      });

      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'crypto',
        'v1/is_certificate_trusted',
        new TextEncoder().encode(expectedPayload).buffer,
      );

      expect(result.trusted).toBe(true);
    });

    it('should handle hostCall errors', () => {
      mockedHostCall.mockImplementation(() => {
        throw new Error('Host call failed');
      });

      const cert: Certificate = {
        encoding: 'Pem',
        data: new Uint8Array([116, 101, 115, 116]),
      };

      expect(() => Crypto.verifyCert(cert, [])).toThrow('Host call failed');
    });

    it('should handle JSON serialization errors', () => {
      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error('JSON serialization failed');
      });

      const cert: Certificate = {
        encoding: 'Pem',
        data: new Uint8Array([116, 101, 115, 116]),
      };

      expect(() => Crypto.verifyCert(cert, [])).toThrow(/Cannot serialize/);
      
      // Restore original JSON.stringify
      JSON.stringify = originalStringify;
    });

    it('should handle JSON parsing errors in response', () => {
      // Return invalid JSON
      mockedHostCall.mockReturnValue(new TextEncoder().encode('invalid json'));

      const cert: Certificate = {
        encoding: 'Pem',
        data: new Uint8Array([116, 101, 115, 116]),
      };

      expect(() => Crypto.verifyCert(cert, [])).toThrow(/Failed to decode or parse/);
    });
  });
});
