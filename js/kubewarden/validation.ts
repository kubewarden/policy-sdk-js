import { KubernetesAdmission } from "./admission";
import { readInput } from "../protocol";

export namespace Validation {
  /**
   * Represents the response of a settings validation.
   */
  export class SettingsValidationResponse {
    /**
     * Indicates whether the settings are valid.
     */
    valid: boolean;

    /**
     * Optional message providing additional information about the validation result.
     */
    message?: string;

    /**
     * Creates an instance of SettingsValidationResponse.
     * @param valid - A boolean indicating if the settings are valid.
     * @param message - An optional message providing additional information about the validation result.
     */
    constructor(valid: boolean, message?: string) {
      this.valid = valid;
      this.message = message;
    }
  }

  /**
   * Represents the response of a validation process.
   */
  export class ValidationResponse {
    /**
     * Indicates whether the validation was accepted.
     */
    accepted: boolean;

    /**
     * Optional message providing additional information about the validation.
     */
    message?: string;

    /**
     * Optional code representing the status of the validation.
     */
    code?: number;

    /**
     * Optional mutated object resulting from the validation.
     */
    mutated_object?: string;

    /**
     * Optional audit annotations related to the validation.
     */
    audit_annotations?: { [key: string]: string };

    /**
     * Optional warnings generated during the validation.
     */
    warnings?: string[];

    /**
     * Creates an instance of ValidationResponse.
     * @param accepted - Indicates whether the validation was accepted.
     * @param message - Optional message providing additional information about the validation.
     * @param code - Optional code representing the status of the validation.
     * @param mutated_object - Optional mutated object resulting from the validation.
     * @param audit_annotations - Optional audit annotations related to the validation.
     * @param warnings - Optional warnings generated during the validation.
     */
    constructor(
      accepted: boolean,
      message?: string,
      code?: number,
      mutated_object?: string,
      audit_annotations?: { [key: string]: string },
      warnings?: string[]
    ) {
      this.accepted = accepted;
      this.message = message;
      this.code = code;
      this.mutated_object = mutated_object;
      this.audit_annotations = audit_annotations;
      this.warnings = warnings;
    }
  }

  /**
   * Represents a validation request in the Kubernetes admission process.
   */
  export class ValidationRequest {
    /**
     * The admission request from Kubernetes.
     */
    request: KubernetesAdmission.AdmissionRequest;

    /**
     * The settings for the validation request.
     */
    settings: any;

    /**
     * Creates an instance of ValidationRequest.
     * 
     * @param request - The admission request from Kubernetes.
     * @param settings - The settings for the validation request.
     */
    constructor(request: KubernetesAdmission.AdmissionRequest, settings: any) {
      this.request = request;
      this.settings = settings;
    }
  }

  /**
   * Accepts the request by returning a successful `ValidationResponse`.
   *
   * @returns {ValidationResponse} A new `ValidationResponse` instance indicating the request is accepted.
   */
  export function acceptRequest(): ValidationResponse {
    return new ValidationResponse(true);
  }

  /**
   * Creates a `ValidationResponse` indicating that the request is rejected.
   *
   * @param message - A message describing the reason for the rejection.
   * @param code - An optional error code associated with the rejection.
   * @returns A `ValidationResponse` object with the rejection details.
   */
  export function rejectRequest(message: string, code?: number): ValidationResponse {
    return new ValidationResponse(false, message, code);
  }

  /**
   * Reads the validation request from the input, decodes it from a UTF-8 string,
   * and parses it as a `Validation.ValidationRequest` object.
   *
   * @returns {Validation.ValidationRequest} The parsed validation request.
   */
  export function readValidationRequest(): Validation.ValidationRequest {
    const inputString = new TextDecoder().decode(readInput());
    return JSON.parse(inputString) as Validation.ValidationRequest;
  }
}