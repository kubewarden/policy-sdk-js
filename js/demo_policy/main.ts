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
 * Validates a Kubernetes admission request to ensure that privileged containers
 * are not allowed unless they are in an ignored namespace.
 * @returns {void}
 */
function validate() {
  const validationRequest = Validation.readValidationRequest();
  const settings = validationRequest.settings as PolicySettings;
  let response: Validation.ValidationResponse;

  console.error('Settings:', JSON.stringify(settings));

  if (settings.testScenario === 'oci-manifest-digest-success') {
    const image = 'docker.io/library/busybox:1.36';
    let digest: string | null = null;
    try {
      digest = ManifestDigest.getOCIManifestDigest(image);
    } catch (e) {
      console.error('OCI manifest digest lookup failed:', e);
    }
    response = new Validation.ValidationResponse(
      !!digest,
      digest ? undefined : 'Failed to retrieve OCI manifest digest',
      undefined,
      undefined,
      { digest: digest || '' }
    );
  } else if (settings.testScenario === 'oci-manifest-digest-failure') {
    const image = 'registry.testing.lan/nonexistent-image:1.0.0';
    let digest: string | null = null;
    try {
      digest = ManifestDigest.getOCIManifestDigest(image);
    } catch (e) {
      console.error('OCI manifest digest lookup failed:', e);
      response = new Validation.ValidationResponse(
        false,
        `OCI manifest digest lookup failed: ${e}`,
        undefined,
        undefined,
        { digest: '' }
      );
      writeOutput(response);
      return;
    }
    // If digest is empty, treat as failure
    response = new Validation.ValidationResponse(
      false,
      'Unexpectedly retrieved OCI manifest digest',
      undefined,
      undefined,
      { digest: digest }
    );  
  } else if (settings.testScenario === 'dns-lookup-success') {
    let ips: string[] = [];
    try {
      ips = Network.dnsLookup('google.com').ips || [];
    } catch (e) {
      console.error('DNS lookup failed:', e);
    }
    response = new Validation.ValidationResponse(
      !!ips && ips.length > 0,
      ips && ips.length > 0 ? undefined : 'Failed to retrieve DNS lookup IPs',
      undefined,
      undefined,
      { ips: ips.join(', ') || '' }
    );
  } else if (settings.testScenario === 'dns-lookup-failure') {
    let ips: string[] = [];
    try {
      ips = Network.dnsLookup('invalid.nonexistent.tld').ips || [];
      if (ips.length > 0) {
        response = new Validation.ValidationResponse(
          false,
          'Unexpectedly retrieved DNS lookup IPs',
          undefined,
          undefined,
          { ips: ips.join(', ') }
        );
      } else {
        response = new Validation.ValidationResponse(
          false,
          'DNS lookup returned no results',
          undefined,
          undefined,
          { ips: '' }
        );
      }
    } catch (e) {
      console.error('DNS lookup failed:', e);
      response = new Validation.ValidationResponse(
        false,
        `DNS lookup failed: ${e}`,
        undefined,
        undefined,
        { ips: '' }
      );
    }  
  } else {
    const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
    const privileged =
      pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;

    if (privileged) {
      if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
        console.error('privileged container are allowed inside of ignored namespace');
        response = Validation.acceptRequest();
      } else {
        response = Validation.rejectRequest('privileged containers are not allowed');
      }
    } else {
      response = Validation.acceptRequest();
    }
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