/**
 * Certificate encoding types
 */
export type CertificateEncoding = 'Der' | 'Pem';

/**
 * Certificate represents a x509 certificate
 */
export interface Certificate {
  encoding: CertificateEncoding;
  data: number[];
}

/**
 * CertificateVerificationRequest holds information about a certificate and
 * a chain to validate it with
 */
export interface CertificateVerificationRequest {
  cert: Certificate;
  cert_chain: Certificate[];
  /** RFC 3339 time format string, to check expiration against. If empty,
   * certificate is assumed never expired */
  not_after: string;
}

/**
 * CertificateVerificationResponse holds the result of a certificate verification
 */
export interface CertificateVerificationResponse {
  trusted: boolean;
  reason: string;
}
