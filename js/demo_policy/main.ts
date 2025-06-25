import type { Pod } from 'kubernetes-types/core/v1';

import { Network } from '../kubewarden/host_capabilities/network';
import { Validation } from '../kubewarden/validation';
import { writeOutput } from '../protocol';
import { ManifestDigest } from '../kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';

declare function policyAction(): string;

interface PolicySettings {
  ignoredNamespaces?: string[];
  testScenario?: string;
}

class PolicySettings {
  constructor(ignoredNamespaces: string[] = [], testScenario?: string) {
    this.ignoredNamespaces = ignoredNamespaces;
    this.testScenario = testScenario;
  }
}

/**
 * Handles OCI manifest digest lookup success scenario
 */
function handleOciManifestDigestSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  let digest: string | null = null;
  try {
    digest = ManifestDigest.getOCIManifestDigest(image);
  } catch (e) {
    console.error('OCI manifest digest lookup failed:', e);
  }
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
function handleOciManifestDigestFailure(): Validation.ValidationResponse {
  const image = 'registry.testing.lan/nonexistent-image:1.0.0';
  let digest: string | null = null;
  try {
    digest = ManifestDigest.getOCIManifestDigest(image);
  } catch (e) {
    console.error('OCI manifest digest lookup failed:', e);
    return new Validation.ValidationResponse(
      false,
      `OCI manifest digest lookup failed: ${e}`,
      undefined,
      undefined,
      { digest: '' }
    );
  }
  // If digest is empty, treat as failure
  return new Validation.ValidationResponse(
    false,
    'Unexpectedly retrieved OCI manifest digest',
    undefined,
    undefined,
    { digest: digest }
  );
}

/**
 * Handles DNS lookup success scenario
 */
function handleDnsLookupSuccess(): Validation.ValidationResponse {
  let ips: string[] = [];
  try {
    ips = Network.dnsLookup('google.com').ips || [];
  } catch (e) {
    console.error('DNS lookup failed:', e);
  }
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
function handleDnsLookupFailure(): Validation.ValidationResponse {
  let ips: string[] = [];
  try {
    ips = Network.dnsLookup('invalid.nonexistent.tld').ips || [];
    if (ips.length > 0) {
      return new Validation.ValidationResponse(
        false,
        'Unexpectedly retrieved DNS lookup IPs',
        undefined,
        undefined,
        { ips: ips.join(', ') }
      );
    } else {
      return new Validation.ValidationResponse(
        false,
        'DNS lookup returned no results',
        undefined,
        undefined,
        { ips: '' }
      );
    }
  } catch (e) {
    console.error('DNS lookup failed:', e);
    return new Validation.ValidationResponse(
      false,
      `DNS lookup failed: ${e}`,
      undefined,
      undefined,
      { ips: '' }
    );
  }
}

/**
 * Handles the default privileged container validation
 */
function handlePrivilegedContainerValidation(validationRequest: any, settings: PolicySettings): Validation.ValidationResponse {
  const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
  const privileged =
    pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;

  if (privileged) {
    if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
      console.error('privileged container are allowed inside of ignored namespace');
      return Validation.acceptRequest();
    } else {
      return Validation.rejectRequest('privileged containers are not allowed');
    }
  } else {
    return Validation.acceptRequest();
  }
}

/**
 * Validates a Kubernetes admission request to ensure that privileged containers
 * are not allowed unless they are in an ignored namespace.
 * @returns {void}
 */
function validate() {
  const validationRequest = Validation.readValidationRequest();
  const settings = validationRequest.settings as PolicySettings;
  let response: Validation.ValidationResponse;

  console.error('Settings:', JSON.stringify(settings));

  switch (settings.testScenario) {
    case 'oci-manifest-digest-success':
      response = handleOciManifestDigestSuccess();
      break;
    case 'oci-manifest-digest-failure':
      response = handleOciManifestDigestFailure();
      break;
    case 'dns-lookup-success':
      response = handleDnsLookupSuccess();
      break;
    case 'dns-lookup-failure':
      response = handleDnsLookupFailure();
      break;
    default:
      response = handlePrivilegedContainerValidation(validationRequest, settings);
      break;
  }

  writeOutput(response);
}
/**
 * Validates the settings and writes the validation response.
 */
function validateSettings() {
  const response = new Validation.SettingsValidationResponse(true);
  writeOutput(response);
}

try {
  const action = policyAction();
  console.error('Action:', action);

  if (action === 'validate') {
    validate();
  } else if (action === 'validate-settings') {
    validateSettings();
  } else {
    console.error('Unknown action:', action);
    const response = new Validation.ValidationResponse(false, 'wrong invocation');
    writeOutput(response);
  }
} catch (error) {
  console.error('error:', error);
  const response = new Validation.ValidationResponse(false, 'wrong invocation');
  writeOutput(response);
}