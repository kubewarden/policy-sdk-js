import type { Pod } from 'kubernetes-types/core/v1';
import { Validation } from '../kubewarden/validation';
import { writeOutput } from '../protocol';
import { PolicySettings } from './policy_settings';
import { 
  handleOciManifestDigestSuccess,
  handleOciManifestDigestFailure,
  handleDnsLookupSuccess,
  handleDnsLookupFailure
} from './test_scenarios';

declare function policyAction(): string;

/**
 * Handles the default privileged container validation
 */
function handlePrivilegedContainerValidation(validationRequest: any, settings: PolicySettings): Validation.ValidationResponse {
  const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
  const privileged =
    pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;

    if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
      console.error('Privileged containers are allowed inside of ignored namespace');
      return Validation.acceptRequest();
    }
    if (privileged) {
      return Validation.rejectRequest('privileged containers are not allowed');
    }
    return Validation.acceptRequest();
    
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

function validateSettings() {
  try {
    const settingsInput = Validation.readValidationRequest(); // already the settings
    const settings = new PolicySettings(settingsInput);
    const response = settings.validate();
    writeOutput(response);
  } catch (err) {
    console.error("validateSettings error:", err);
    const response = new Validation.SettingsValidationResponse(false, `${err}`);
    writeOutput(response);
  }
}

try {
  const action = policyAction();
  console.error('Action:', action);

  switch(action) {
    case 'validate':
      validate();
      break;
    case 'validate-settings':
      validateSettings();
      break;
    default:
      console.error('Unknown action:', action);
      const response = new Validation.ValidationResponse(false, 'wrong invocation');
      writeOutput(response);
  }
} catch (error) {
  console.error('error:', error);
  const response = new Validation.ValidationResponse(false, 'wrong invocation');
  writeOutput(response);
}