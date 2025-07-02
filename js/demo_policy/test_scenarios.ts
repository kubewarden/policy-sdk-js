import type { Pod } from 'kubernetes-types/core/v1';
import { Manifest } from '../kubewarden/host_capabilities/oci/manifest/manifest';
import { OciImageManifestResponse } from '../kubewarden/host_capabilities/oci/manifest/types';

import { Network } from '../kubewarden/host_capabilities/network';
import { ManifestDigest } from '../kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';
import { Validation } from '../kubewarden/validation';

import type { PolicySettings } from './policy_settings';

/**
 * Handles OCI manifest digest lookup success scenario
 */
export function handleOciManifestDigestSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  const digest = ManifestDigest.getOCIManifestDigest(image);
  return new Validation.ValidationResponse(
    !!digest,
    digest ? undefined : 'Failed to retrieve OCI manifest digest',
    undefined,
    undefined,
    { digest: digest || '' },
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
    { digest: digest || '' },
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
    { ips: ips.join(', ') || '' },
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
    { ips: ips.join(', ') },
  );
}

/**
 * Handles OCI manifest lookup success scenario
 */
export function handleOciManifestSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  let manifest: OciImageManifestResponse | null = null;
  try {
    manifest = Manifest.getOCIManifest(image);
  } catch (e) {
    console.error('OCI manifest lookup failed:', e);
  }
  const manifestType = manifest?.image ? 'image' : manifest?.index ? 'index' : '';
  return new Validation.ValidationResponse(
    !!manifest && manifestType !== '',
    manifestType ? undefined : 'Failed to retrieve OCI manifest',
    undefined,
    undefined,
    { manifestType }
  );
}

/**
 * Handles OCI manifest lookup failure scenario
 */
export function handleOciManifestFailure(): Validation.ValidationResponse {
  const image = 'registry.testing.lan/nonexistent-image:1.0.0';
  let manifest: OciImageManifestResponse | null = null;
  try {
    manifest = Manifest.getOCIManifest(image);
  } catch (e) {
    console.error('OCI manifest lookup failed:', e);
    return new Validation.ValidationResponse(
      false,
      `OCI manifest lookup failed: ${e}`,
      undefined,
      undefined,
      { manifestType: '' }
    );
  }
  // If manifest is retrieved, treat as failure
  const manifestType = manifest?.image ? 'image' : manifest?.index ? 'index' : '';
  return new Validation.ValidationResponse(
    false,
    'Unexpectedly retrieved OCI manifest',
    undefined,
    undefined,
    { manifestType }
  );
}

/**
 * Handles the default privileged container validation
 */
export function handlePrivilegedContainerValidation(
  validationRequest: any,
  settings: PolicySettings,
): Validation.ValidationResponse {
  if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
    console.error('Privileged containers are allowed inside of ignored namespace');
    return Validation.acceptRequest();
  }

  const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
  const privileged =
    pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;
  if (privileged) {
    return Validation.rejectRequest('privileged containers are not allowed');
  }
  return Validation.acceptRequest();
}
