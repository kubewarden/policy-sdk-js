/**
 * Certificate encoding types
 */
export type CertificateEncoding = 'Der' | 'Pem';

/**
 * Certificate represents a x509 certificate
 * @param data - Certificate data as UTF-8 encoded bytes (array of numbers)
 */
export interface Certificate {
  encoding: CertificateEncoding;
  data: number[];
}

/**
 * CertificateVerificationRequest holds information about a certificate and
 * a chain to validate it with
 * @param cert - The certificate to verify
 * @param cert_chain - List of certs, ordered by trust usage (intermediates first, root last).
 *   If empty or missing, certificate is assumed trusted.
 * @param not_after - RFC 3339 time format string, to check expiration against.
 *   If undefined, certificate is assumed never expired
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface CertificateVerificationRequest {
  cert: Certificate;
  cert_chain?: Certificate[];
  not_after?: string;
}

/**
 * CertificateVerificationResponse holds the result of a certificate verification
 */
export interface CertificateVerificationResponse {
  trusted: boolean;
  reason: string;
}

/**
 * Helper utilities for working with Certificate objects
 */
export namespace CertificateUtils {
  /**
   * Creates a Certificate from a string
   * @param certString - The certificate string (PEM or DER encoded)
   * @param encoding - The encoding type of the certificate
   * @returns Certificate object with UTF-8 encoded data
   */
  export function fromString(certString: string, encoding: CertificateEncoding): Certificate {
    return {
      encoding,
      data: Array.from(new TextEncoder().encode(certString)), // always UTF-8
    };
  }

  /**
   * Converts a Certificate to a string
   * @param cert - The certificate object
   * @returns The certificate as a UTF-8 decoded string
   */
  export function toString(cert: Certificate): string {
    return new TextDecoder('utf-8').decode(new Uint8Array(cert.data));
  }
}
