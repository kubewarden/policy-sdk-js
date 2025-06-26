import { ManifestDigest } from "./manifest_digest";
import * as HostCall from "../../index";

class MockWasmHost {
  private knownImages: Record<string, string>;

  constructor(imageDigests: Record<string, string> = {}) {
    this.knownImages = imageDigests
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

    if (this.knownImages[image]) {
        const digest = this.knownImages[image]!;
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
      const expectedDigest = "sha256:abc123def456";

      mockHost = new MockWasmHost({
          [image]: expectedDigest
      });

      jest.spyOn(HostCall.HostCall, "hostCall").mockImplementation(
          mockHost.hostCall.bind(mockHost)
      );

      const result = ManifestDigest.getOCIManifestDigest(image);
      expect(result).toBe(expectedDigest);
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