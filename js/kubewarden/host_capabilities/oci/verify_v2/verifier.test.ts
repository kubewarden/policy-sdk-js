import { HostCall } from '../..';

import type { VerificationResponse, KeylessInfo, KeylessPrefixInfo } from './types';
import { OciSignatureVerifier } from './verifier';

// Mock the HostCall module
jest.mock('../..', () => ({
  HostCall: {
    hostCall: jest.fn(),
  },
}));

const mockHostCall = HostCall.hostCall as jest.MockedFunction<typeof HostCall.hostCall>;

interface V2VerifyTestCase {
  request: any;
  expectedPayload: string;
  verifyFunc: () => VerificationResponse;
}

describe('OciSignatureVerifier V2 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases: Record<string, V2VerifyTestCase> = {
    PubKeysImage: {
      request: {
        image: 'myimage:latest',
        pubKeys: ['pubkey1', 'pubkey2'],
        annotations: undefined,
      },
      expectedPayload:
        '{"type":"SigstorePubKeyVerify","image":"myimage:latest","pub_keys":["pubkey1","pubkey2"]}',
      verifyFunc: () =>
        OciSignatureVerifier.verifyPubKeysImage(
          'myimage:latest',
          ['pubkey1', 'pubkey2'],
          undefined,
        ),
    },
    KeylessExactMatch: {
      request: {
        image: 'myimage:latest',
        keyless: [
          { issuer: 'https://github.com/login/oauth', subject: 'mail@example.com' },
        ] as KeylessInfo[],
        annotations: undefined,
      },
      expectedPayload:
        '{"type":"SigstoreKeylessVerify","image":"myimage:latest","keyless":[{"issuer":"https://github.com/login/oauth","subject":"mail@example.com"}]}',
      verifyFunc: () =>
        OciSignatureVerifier.verifyKeylessExactMatch(
          'myimage:latest',
          [{ issuer: 'https://github.com/login/oauth', subject: 'mail@example.com' }],
          undefined,
        ),
    },
    KeylessPrefixMatch: {
      request: {
        image: 'myimage:latest',
        keylessPrefix: [
          { issuer: 'https://github.com/login/oauth', url_prefix: 'https://example.com' },
        ] as KeylessPrefixInfo[],
        annotations: undefined,
      },
      expectedPayload:
        '{"type":"SigstoreKeylessPrefixVerify","image":"myimage:latest","keyless_prefix":[{"issuer":"https://github.com/login/oauth","url_prefix":"https://example.com"}]}',
      verifyFunc: () =>
        OciSignatureVerifier.verifyKeylessPrefixMatch(
          'myimage:latest',
          [{ issuer: 'https://github.com/login/oauth', url_prefix: 'https://example.com' }],
          undefined,
        ),
    },
    KeylessGithubActionsWithOrgAndRepo: {
      request: {
        image: 'myimage:latest',
        owner: 'myorg',
        repo: 'myrepo',
        annotations: undefined,
      },
      expectedPayload:
        '{"type":"SigstoreGithubActionsVerify","image":"myimage:latest","owner":"myorg","repo":"myrepo"}',
      verifyFunc: () =>
        OciSignatureVerifier.verifyKeylessGithubActions(
          'myimage:latest',
          'myorg',
          'myrepo',
          undefined,
        ),
    },
    KeylessGithubActionsWithOrgNoRepo: {
      request: {
        image: 'myimage:latest',
        owner: 'myorg',
        annotations: undefined,
      },
      expectedPayload:
        '{"type":"SigstoreGithubActionsVerify","image":"myimage:latest","owner":"myorg"}',
      verifyFunc: () =>
        OciSignatureVerifier.verifyKeylessGithubActions(
          'myimage:latest',
          'myorg',
          undefined,
          undefined,
        ),
    },
  };

  Object.entries(testCases).forEach(([description, testCase]) => {
    it(`should verify ${description}`, () => {
      // Setup mock response
      const verificationResponse: VerificationResponse = {
        is_trusted: true,
        digest: '',
      };

      const responsePayload = new Uint8Array(
        new TextEncoder().encode(JSON.stringify(verificationResponse)),
      );
      mockHostCall.mockReturnValueOnce(responsePayload);

      // Execute the verification function
      const result = testCase.verifyFunc();

      // Verify the host call was made with correct parameters
      expect(mockHostCall).toHaveBeenCalledTimes(1);
      expect(mockHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'oci',
        'v2/verify',
        new TextEncoder().encode(testCase.expectedPayload).buffer,
      );

      // Verify the result
      expect(result).toEqual(verificationResponse);
      expect(result.is_trusted).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON serialization errors', () => {
      // Create a circular reference to cause JSON.stringify to fail
      const circularObj: any = {};
      circularObj.self = circularObj;

      expect(() => {
        // We need to access the internal performVerify function, but since it's not exported,
        // we'll test through one of the public methods with invalid data
        OciSignatureVerifier.verifyPubKeysImage(circularObj, [], undefined);
      }).toThrow(/Cannot serialize verification request/);
    });

    it('should handle host call response parsing errors', () => {
      // Mock host call to return invalid JSON
      const invalidResponse = new Uint8Array(new TextEncoder().encode('invalid json'));
      mockHostCall.mockReturnValueOnce(invalidResponse);

      expect(() => {
        OciSignatureVerifier.verifyPubKeysImage('test:latest', ['key1'], undefined);
      }).toThrow(/Failed to decode or parse verification response/);
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      const mockResponse: VerificationResponse = { is_trusted: true, digest: 'sha256:abc123' };
      const responsePayload = new Uint8Array(
        new TextEncoder().encode(JSON.stringify(mockResponse)),
      );
      mockHostCall.mockReturnValue(responsePayload);
    });

    it('should handle empty public keys array', () => {
      const result = OciSignatureVerifier.verifyPubKeysImage('test:latest', [], undefined);
      expect(result.is_trusted).toBe(true);
    });

    it('should handle empty keyless array', () => {
      const result = OciSignatureVerifier.verifyKeylessExactMatch('test:latest', [], undefined);
      expect(result.is_trusted).toBe(true);
    });

    it('should handle empty keyless prefix array', () => {
      const result = OciSignatureVerifier.verifyKeylessPrefixMatch('test:latest', [], undefined);
      expect(result.is_trusted).toBe(true);
    });

    it('should handle annotations with various data types', () => {
      const annotations = {
        'string-key': 'string-value',
        'number-key': '123',
        'boolean-key': 'true',
      };

      const result = OciSignatureVerifier.verifyPubKeysImage('test:latest', ['key1'], annotations);
      expect(result.is_trusted).toBe(true);

      // Verify the annotations were serialized correctly
      const expectedPayload = JSON.stringify({
        type: 'SigstorePubKeyVerify',
        image: 'test:latest',
        pub_keys: ['key1'],
        annotations: annotations,
      });

      expect(mockHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'oci',
        'v2/verify',
        new TextEncoder().encode(expectedPayload).buffer,
      );
    });
  });
});
