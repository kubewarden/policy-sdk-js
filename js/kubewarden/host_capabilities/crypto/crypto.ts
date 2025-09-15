import { HostCall } from '../';

import type { Certificate, CertificateVerificationResponse } from './types';

/**
 * Crypto Host Capability
 */
export namespace Crypto {
  /**
   * Verifies cert's trust against the passed cert_chain, and
   * expiration and validation time of the certificate.
   * @param cert - PEM/DER-encoded certificate to verify
   * @param certChain - list of PEM/DER-encoded certs, ordered by trust usage
   *   (intermediates first, root last). If empty, certificate is assumed trusted.
   * @param notAfter - string in RFC 3339 time format, to check expiration against.
   *   If undefined, certificate is assumed never expired.
   * @returns CertificateVerificationResponse
   */
  export function verifyCert(
    cert: Certificate,
    certChain: Certificate[],
    notAfter?: string,
  ): CertificateVerificationResponse {
    const requestObj: {
      cert: Certificate;
      cert_chain: Certificate[];
      not_after?: string;
    } = {
      cert,
      cert_chain: certChain,
    };

    // Only include not_after if it's provided
    if (notAfter !== undefined) {
      requestObj.not_after = notAfter;
    }

    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(requestObj)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize CertificateVerificationRequest: ${err}`);
    }

    const responsePayload = HostCall.hostCall(
      'kubewarden',
      'crypto',
      'v1/is_certificate_trusted',
      payload,
    );

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      return JSON.parse(jsonString) as CertificateVerificationResponse;
    } catch (err) {
      throw new Error(`Failed to decode or parse certificate verification response: ${err}`);
    }
  }
}
