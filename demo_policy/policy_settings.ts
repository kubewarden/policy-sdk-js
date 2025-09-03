import { Validation } from '../js/kubewarden/validation';

export class PolicySettings {
  ignoredNamespaces?: string[];
  testScenario?: string;

  constructor(obj: any) {
    this.ignoredNamespaces = obj.ignoredNamespaces || [];
    this.testScenario = obj.testScenario;

    const knownScenarios = [
      'oci-manifest-digest-success',
      'oci-manifest-digest-failure',
      'dns-lookup-success',
      'dns-lookup-failure',
      'oci-manifest-success',
      'oci-manifest-failure',
      'oci-manifest-and-config-success',
      'oci-manifest-and-config-failure',
      'get-resource-success',
      'get-resource-failure',
      'list-all-resources-success',
      'list-all-resources-failure',
      'list-resources-by-namespace-success',
      'list-resources-by-namespace-failure',
      'can-i-success',
      'can-i-failure',
      'crypto-verify-cert-success',
      'crypto-verify-cert-failure',
    ];

    if (this.testScenario && !knownScenarios.includes(this.testScenario)) {
      throw new Error(`Unknown testScenario: ${this.testScenario}`);
    }
  }

  /**
   * Validates the settings and writes the validation response.
   */
  validate(): Validation.SettingsValidationResponse {
    return new Validation.SettingsValidationResponse(true);
  }
}
