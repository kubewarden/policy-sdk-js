import { HostCall } from '../..';

import type {
  SigstorePubKeyVerifyRequest,
  SigstoreKeylessVerifyRequest,
  SigstoreKeylessPrefixVerifyRequest,
  SigstoreGithubActionsVerifyRequest,
  VerificationResponse,
  KeylessInfo,
  KeylessPrefixInfo,
  SigstoreVerifyRequest,
} from './types';

function performVerify(request: SigstoreVerifyRequest): VerificationResponse {
  let payload: ArrayBuffer;
  try {
    payload = new TextEncoder().encode(JSON.stringify(request)).buffer;
  } catch (err) {
    throw new Error(`Cannot serialize verification request: ${err}`);
  }

  const responsePayload = HostCall.hostCall('kubewarden', 'oci', 'v2/verify', payload);

  try {
    const jsonString = new TextDecoder().decode(responsePayload);
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Failed to decode or parse verification response: ${err}`);
  }
}

/**
 * OCI Signature Verifier Host Capability
 */
export namespace OciSignatureVerifier {
  /**
   * Verifies sigstore signatures of an image using public keys
   *
   * @param image - Image to be verified (e.g.: `registry.testing.lan/busybox:1.0.0`)
   * @param pubKeys - List of PEM encoded keys that must have been used to sign the OCI object
   * @param annotations - Annotations that must have been provided by all signers when they signed the OCI artifact
   * @returns Verification response
   */
  export function verifyPubKeysImage(
    image: string,
    pubKeys: string[],
    annotations?: { [key: string]: string },
  ): VerificationResponse {
    const request: SigstorePubKeyVerifyRequest = {
      type: 'SigstorePubKeyVerify',
      image,
      pub_keys: pubKeys,
      annotations,
    };

    return performVerify(request);
  }

  /**
   * Verifies sigstore signatures of an image using keyless signing
   *
   * @param image - Image to be verified (e.g.: `registry.testing.lan/busybox:1.0.0`)
   * @param keyless - List of KeylessInfo pairs, containing Issuer and Subject info from OIDC providers
   * @param annotations - Annotations that must have been provided by all signers when they signed the OCI artifact
   * @returns Verification response
   */
  export function verifyKeylessExactMatch(
    image: string,
    keyless: KeylessInfo[],
    annotations?: { [key: string]: string },
  ): VerificationResponse {
    const request: SigstoreKeylessVerifyRequest = {
      type: 'SigstoreKeylessVerify',
      image,
      keyless,
      annotations,
    };

    return performVerify(request);
  }

  /**
   * Verifies sigstore signatures of an image using keyless signing with prefix matching.
   * The provided subject string is treated as a URL prefix, and sanitized to a valid URL
   * by appending `/` to prevent typosquatting. The provided subject will satisfy the signature
   * only if it is a prefix of the signature subject.
   *
   * @param image - Image to be verified
   * @param keylessPrefix - List of issuers and subject prefixes
   * @param annotations - Annotations that must have been provided by all signers when they signed the OCI artifact
   * @returns Verification response
   */
  export function verifyKeylessPrefixMatch(
    image: string,
    keylessPrefix: KeylessPrefixInfo[],
    annotations?: { [key: string]: string },
  ): VerificationResponse {
    const request: SigstoreKeylessPrefixVerifyRequest = {
      type: 'SigstoreKeylessPrefixVerify',
      image,
      keyless_prefix: keylessPrefix,
      annotations,
    };

    return performVerify(request);
  }

  /**
   * Verifies sigstore signatures of an image using keyless signatures made via Github Actions
   *
   * @param image - Image to be verified
   * @param owner - Owner of the repository. E.g: octocat
   * @param repo - Optional. Repo of the GH Action workflow that signed the artifact. E.g: example-repo
   * @param annotations - Annotations that must have been provided by all signers when they signed the OCI artifact
   * @returns Verification response
   */
  export function verifyKeylessGithubActions(
    image: string,
    owner: string,
    repo?: string,
    annotations?: { [key: string]: string },
  ): VerificationResponse {
    const request: SigstoreGithubActionsVerifyRequest = {
      type: 'SigstoreGithubActionsVerify',
      image,
      owner,
      repo,
      annotations,
    };

    return performVerify(request);
  }
}

/**
 * Utility function to convert a PEM certificate string to the byte array format expected by the API
 */
export function pemToByteArray(pemString: string): number[] {
  return Array.from(new TextEncoder().encode(pemString));
}
