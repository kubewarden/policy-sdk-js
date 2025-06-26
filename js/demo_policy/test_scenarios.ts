import { Network } from '../kubewarden/host_capabilities/network';
import { Validation } from '../kubewarden/validation';
import { ManifestDigest } from '../kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';

/**
 * Handles OCI manifest digest lookup success scenario
 */
export function handleOciManifestDigestSuccess(): Validation.ValidationResponse {
const image = 'ghcr.io/kubewarden/kubectl:v1.31.0';
const digest = ManifestDigest.getOCIManifestDigest(image);
return new Validation.ValidationResponse(
  !!digest,
  digest ? undefined : 'Failed to retrieve OCI manifest digest',
  undefined,
  undefined,
  { digest: digest || '' }
);
}

/**
 * Handles OCI manifest digest lookup failure scenario
 */
export function handleOciManifestDigestFailure(): Validation.ValidationResponse {
  const image = 'registry.testing.lan/nonexistent-image:1.0.0';
  const digest = ManifestDigest.getOCIManifestDigest(image); //host call should fail
  return new Validation.ValidationResponse(
    !digest,
    `Unexpectedly succeeded in manifest digest lookup`,
    undefined,
    undefined,
    { digest: digest || '' }
  );
}

/**
 * Handles DNS lookup success scenario
 */
export function handleDnsLookupSuccess(): Validation.ValidationResponse {
  const ips = Network.dnsLookup('google.com').ips;
  return new Validation.ValidationResponse(
    !!ips && ips.length > 0,
    ips && ips.length > 0 ? undefined : 'Failed to retrieve DNS lookup IPs',
    undefined,
    undefined,
    { ips: ips.join(', ') || '' }
  );
}

/**
 * Handles DNS lookup failure scenario
 */
export function handleDnsLookupFailure(): Validation.ValidationResponse {
  const ips = Network.dnsLookup('invalid.nonexistent.tld').ips; // host call should fail
  return new Validation.ValidationResponse(
    false,
    'Unexpectedly retrieved DNS lookup IPs',
    undefined,
    undefined,
    { ips: ips.join(', ') }
  );
}
