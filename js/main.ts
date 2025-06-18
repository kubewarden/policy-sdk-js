import type { Pod } from 'kubernetes-types/core/v1';

import { Network } from './kubewarden/host_capabilities/network';
import { Validation } from './kubewarden/validation';
import { writeOutput } from './protocol';

declare function policyAction(): string;

class PolicySetttings {
  ignoredNamespaces?: [string];

  constructor(ignoredNamespaces: [string]) {
    this.ignoredNamespaces = ignoredNamespaces;
  }
}

/**
 * Validates a Kubernetes admission request to ensure that privileged containers
 * are not allowed unless they are in an ignored namespace.
 * @returns {void}
 */
function validate() {
  const validationRequest = Validation.readValidationRequest();
  const settings = validationRequest.settings as PolicySetttings;

  const image = "docker.io/library/busybox:1.36";
      const digest = ManifestDigest.getOCIManifestDigest(image);  
  const ips = Network.dnsLookup('google.com').ips.join(', ');
  const annotations = {
    ips: ips,
  };

  const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
  const privileged =
    pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;

  let response: Validation.ValidationResponse;
  if (privileged) {
    if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
      console.error('privileged container are allowed inside of ignored namespace');
      response = Validation.acceptRequest();
    } else {
      response = Validation.rejectRequest('privileged containers are not allowed');
    }
  } else {
    response = new Validation.ValidationResponse(
      true,
      undefined,
      undefined,
      undefined,
      annotations,
    );
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