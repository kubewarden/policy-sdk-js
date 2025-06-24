import { ManifestDigest } from "./manifest_digest";
import * as HostCall from "../../index";

class MockWasmHost {
    private cache: Map<string, string> = new Map();

    hostCall(
        binding: string,
        namespace: string,
        operation: string,
        payload: ArrayBuffer
    ): Uint8Array {
        if (
            binding !== "kubewarden" ||
            namespace !== "oci" ||
            operation !== "v1/manifest_digest"
        ) {
            throw new Error("Invalid host call parameters");
        }

        const image = JSON.parse(new TextDecoder().decode(payload)) as string;
        const cacheKey = `${namespace}:${operation}:${image}`;

        if (this.cache.has(cacheKey)) {
            return new TextEncoder().encode(
                JSON.stringify({ digest: this.cache.get(cacheKey) })
            );
        }

        const digest = `sha256:${image.replace(/[^a-zA-Z0-9]/g, "")}`;
        this.cache.set(cacheKey, digest);
        return new TextEncoder().encode(JSON.stringify({ digest }));
    }
}

describe("ManifestDigest Integration Tests", () => {
    let mockHost: MockWasmHost;
    let originalHostCall: typeof HostCall.HostCall.hostCall;

    beforeEach(() => {
        mockHost = new MockWasmHost();
        originalHostCall = HostCall.HostCall.hostCall;
        jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(
            mockHost.hostCall.bind(mockHost)
        );
    });

    afterEach(() => {
        HostCall.HostCall.hostCall = originalHostCall;
        jest.restoreAllMocks();
    });

    it("should return digest for valid image", () => {
        const image = "myimage:latest";
        const expectedDigest = `sha256:${image.replace(/[^a-zA-Z0-9]/g, "")}`;
        const result = ManifestDigest.getOCIManifestDigest(image);
        expect(result).toBe(expectedDigest);
    });

    it("should use cache for repeated calls", () => {
        const image = "myimage:latest";
        const expectedDigest = `sha256:${image.replace(/[^a-zA-Z0-9]/g, "")}`;

        const result1 = ManifestDigest.getOCIManifestDigest(image);
        expect(result1).toBe(expectedDigest);

        const result2 = ManifestDigest.getOCIManifestDigest(image);
        expect(result2).toBe(expectedDigest);
    });

    it("should throw for invalid host call parameters", () => {
        jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(() => {
            throw new Error("Invalid host call parameters");
        });
        expect(() => ManifestDigest.getOCIManifestDigest("myimage:latest")).toThrow(
            "Invalid host call parameters"
        );
    });
});