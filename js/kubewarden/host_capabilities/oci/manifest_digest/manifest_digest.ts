import { OciManifestResponse } from "./types";
import { HostCall } from "../..";

/**
 * Namespace for manifest digest operations.
 */
export namespace ManifestDigest {
    /**
     * Computes the digest of the OCI object referenced by the image.
     * @param {string} image - The image to be verified (e.g.: `registry.testing.lan/busybox:1.0.0`)
     * @returns {string} The image digest string
     * @throws {Error} If JSON serialization fails or the host call returns an error
     */
    export function getOCIManifestDigest(image: string): string {
        // Serialize the image to JSON
        let payload: ArrayBuffer;
        try {
            payload = new TextEncoder().encode(JSON.stringify(image)).buffer;
        } catch (err) {
            throw new Error(`Cannot serialize image to JSON: ${err}`);
        }

        // Perform host call
        const responsePayload = HostCall.hostCall('kubewarden', 'oci', 'v1/manifest_digest', payload);
        let response: OciManifestResponse;
        try {
            const responseString = new TextDecoder().decode(responsePayload);
            response = JSON.parse(responseString) as OciManifestResponse;
        } catch (err) {
            throw new Error(`Cannot parse response: ${err}`);
        }

        return response.digest;
    }
}