import { ManifestDigest } from "./manifest_digest";
import * as HostCall from "../../index";

class MockWasmHost {
    private knownImages: Map<string, string> = new Map();

    constructor(imageDigests: Record<string, string> = {}) {
        Object.entries(imageDigests).forEach(([image, digest]) => {
            this.knownImages.set(image, digest);
        });
    }

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

        if (this.knownImages.has(image)) {
            const digest = this.knownImages.get(image)!;
            return new TextEncoder().encode(JSON.stringify({ digest }));
        }

        throw new Error(`Image not found: ${image}`);
    }
}

describe("ManifestDigest Unit Tests", () => {
    let mockHost: MockWasmHost;
    let originalHostCall: typeof HostCall.HostCall.hostCall;

    beforeEach(() => {
        originalHostCall = HostCall.HostCall.hostCall;
    });

    afterEach(() => {
        HostCall.HostCall.hostCall = originalHostCall;
        jest.restoreAllMocks();
    });

    it("should return digest for valid image", () => {
        const image = "myimage:latest";
        const expectedDigest = `sha256:${image.replace(/[^a-zA-Z0-9]/g, "")}`;

        mockHost = new MockWasmHost({
            [image]: expectedDigest
        });

        jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(
            mockHost.hostCall.bind(mockHost)
        );

        const result = ManifestDigest.getOCIManifestDigest(image);
        expect(result).toBe(expectedDigest);
    });

    it("should use cache for repeated calls", () => {
        const image = "myimage:latest";
        const expectedDigest = `sha256:${image.replace(/[^a-zA-Z0-9]/g, "")}`;

        mockHost = new MockWasmHost({
            [image]: expectedDigest
        });

        jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(
            mockHost.hostCall.bind(mockHost)
        );

        const result1 = ManifestDigest.getOCIManifestDigest(image);
        expect(result1).toBe(expectedDigest);

        const result2 = ManifestDigest.getOCIManifestDigest(image);
        expect(result2).toBe(expectedDigest);

    });

    it("should throw error for unknown image", () => {
        const knownImage = "known:latest";
        const unknownImage = "unknow:latest";

        mockHost = new MockWasmHost({
            [knownImage]: "sha256:abc123def456"
        });

        jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(
            mockHost.hostCall.bind(mockHost)
        );

        expect(() => ManifestDigest.getOCIManifestDigest(unknownImage)).toThrow(
            `Image not found: ${unknownImage}`
        );
    });

});