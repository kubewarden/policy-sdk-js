import { HostCall } from '../..';

import type { OciImageManifestAndConfigResponse } from './types';

/**
 * Namespace for manifest and config operations.
 */
export namespace ManifestConfig {
  /**
   * Fetches the OCI manifest and configuration for the given image URI.
   * @param {string} image - The image to be verified (e.g.: `registry.testing.lan/busybox:1.0.0`)
   * @returns {OciImageManifestAndConfigResponse} The manifest and config response
   * @throws {Error} If JSON serialization fails or the host call returns an error
   */
  export function getOCIManifestAndConfig(image: string): OciImageManifestAndConfigResponse {
    // Serialize the image to JSON
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(image)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize image URI to JSON: ${err}`);
    }

    // Perform host call
    const responsePayload = HostCall.hostCall(
      'kubewarden',
      'oci',
      'v1/oci_manifest_config',
      payload,
    );

    let response: OciImageManifestAndConfigResponse;
    try {
      const responseString = new TextDecoder().decode(responsePayload);
      response = JSON.parse(responseString) as OciImageManifestAndConfigResponse;
    } catch (err) {
      throw new Error(`Failed to parse response from the host: ${err}`);
    }

    return response;
  }
}
