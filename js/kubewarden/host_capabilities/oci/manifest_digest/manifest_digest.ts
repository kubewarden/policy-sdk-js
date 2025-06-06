import { OciManifestResponse } from "./types";
import { HostCall } from "../..";

/**
 * Namespace for manifest digest operations.
 */
export namespace ManifestDigest {
    /**
     * Computes the digest of the OCI object referenced by the image.
     * @param {string} image - The image to be verified (e.g.: `registry.testing.lan/busybox:1.0.0`)
     * @returns A promise resolving to the image digest string
     * @throws Error is JSON serialization fails or the host call returns an error
     */

    export function getOCIManifestDigest(image: string): string {
        // build request payload, e.g: `"ghcr.io/kubewarden/policies/pod-privileged:v0.1.10"`
        let payload: ArrayBuffer;
        try {
            payload = new TextEncoder().encode(JSON.stringify(image)).buffer;
        } catch (err) {
            throw new Error(`cannot serialize image to JSON: ${err}`);
        }

        // perform host callback
        let responsePayload: Uint8Array;
        try {
            responsePayload = HostCall.hostCall('kubewarden', 'oci', 'v1/manifest_digest', payload);
        } catch (err) {
            throw err;
        }

        let response: OciManifestResponse;
        try {
            const responseString = new TextDecoder().decode(responsePayload);
            response = JSON.parse(responseString) as OciManifestResponse;
        } catch (err) {
            throw new Error(`cannot parse response: ${err}`);
        }

        return response.digest;
        
    }
}