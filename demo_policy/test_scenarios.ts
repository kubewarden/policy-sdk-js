import type { Pod } from 'kubernetes-types/core/v1';

import { Kubernetes } from '../js/kubewarden/host_capabilities/kubernetes/kubernetes';
import { Network } from '../js/kubewarden/host_capabilities/net/network';
import { Manifest } from '../js/kubewarden/host_capabilities/oci/manifest/manifest';
import { ManifestConfig } from '../js/kubewarden/host_capabilities/oci/manifest_config/manifest_config';
import { ManifestDigest } from '../js/kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';
import { Validation } from '../js/kubewarden/validation';

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
  const manifest = Manifest.getOCIManifest(image);
  return new Validation.ValidationResponse(
    !!manifest,
    manifest ? undefined : 'Failed to retrieve OCI manifest',
    undefined,
    undefined,
    { manifest: manifest ? JSON.stringify(manifest) : '' },
  );
}

/**
 * Handles OCI manifest lookup failure scenario
 */
export function handleOciManifestFailure(): Validation.ValidationResponse {
  const image = 'example.test/nonexistent-image:1.0.0';
  const manifest = Manifest.getOCIManifest(image);
  return new Validation.ValidationResponse(
    !manifest,
    `Unexpectedly succeeded in manifest lookup`,
    undefined,
    undefined,
    { manifest: '' },
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

/**
 * Handles OCI manifest and config lookup success scenario
 */
export function handleOciManifestAndConfigSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  const response = ManifestConfig.getOCIManifestAndConfig(image);
  return new Validation.ValidationResponse(
    !!response.manifest && !!response.config,
    response.manifest && response.config ? undefined : 'Failed to retrieve OCI manifest and config',
    undefined,
    undefined,
    {
      manifest: response.manifest ? JSON.stringify(response.manifest) : '',
      digest: response.digest || '',
      config: response.config ? JSON.stringify(response.config) : '',
    },
  );
}

/**
 * Handles OCI manifest and config lookup failure scenario
 */
export function handleOciManifestAndConfigFailure(): Validation.ValidationResponse {
  const image = 'example.test/nonexistent-image';
  const response = ManifestConfig.getOCIManifestAndConfig(image); // host call should fail
  return new Validation.ValidationResponse(
    !response.manifest && !response.config,
    `Unexpectedly succeeded in manifest and config lookup`,
    undefined,
    undefined,
    {
      manifest: response.manifest ? JSON.stringify(response.manifest) : '',
      digest: response.digest || '',
      config: response.config ? JSON.stringify(response.config) : '',
    },
  );
}

export function handleGetResourceSuccess(): Validation.ValidationResponse {
  const ns = Kubernetes.getResource({
    api_version: 'v1',
    kind: 'Namespace',
    name: 'test-policy',
    disable_cache: false,
  });

  if (ns?.metadata?.labels?.['demo-namespace'] === 'true') {
    return Validation.acceptRequest();
  }

  return Validation.rejectRequest('Namespace does not have label demo-namespace=true');
}

export function handleGetResourceFailure(): Validation.ValidationResponse {
  Kubernetes.getResource({
    api_version: 'v1',
    kind: 'Namespace',
    name: 'test-policy',
    disable_cache: false,
  });

  return Validation.rejectRequest('Unexpectedly succeeded in getResource');
}
