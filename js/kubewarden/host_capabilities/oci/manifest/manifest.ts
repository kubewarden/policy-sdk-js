import { HostCall } from '../..';

import type { OciImageManifestResponse } from './types';
import { OciImageManifestResponseImpl } from './types';

/**
 * Namespace for OCI manifest operations.
 */
export namespace Manifest {
  /**
   * Fetches the OCI manifest for the given image URI.
   * The returned value could be an OCI image manifest or an OCI index image manifest.
   * See more at:
   * https://github.com/opencontainers/image-spec/blob/main/manifest.md
   * https://github.com/opencontainers/image-spec/blob/main/image-index.md
   * @param {string} image - The image reference (e.g., `registry.testing.lan/busybox:1.0.0`)
   * @returns {OciImageManifestResponse} The OCI manifest response
   * @throws {Error} If JSON serialization fails, the host call returns an error, or response parsing fails
   */
  export function getOCIManifest(image: string): OciImageManifestResponse {
    // Serialize the image to JSON
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(image)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize image to JSON: ${err}`);
    }

    // Perform host call
    const responsePayload = HostCall.hostCall('kubewarden', 'oci', 'v1/oci_manifest', payload);
    try {
      const responseString = new TextDecoder().decode(responsePayload);
      return OciImageManifestResponseImpl.fromJSON(responseString);
    } catch (err) {
      throw new Error(`Cannot parse response: ${err}`);
    }
  }
}
