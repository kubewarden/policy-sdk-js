import { ManifestDigest } from "./manifest_digest";
import * as HostCall from "../../index";

// Mock HostCall module
jest.mock("../../index");

describe("ManifestDigest.getOCIManifestDigest", () => {
    // Use jest.spyOn to mock the hostCall function within the HostCall namespace
    const mockHostCall = jest.spyOn(HostCall.HostCall, "hostCall");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return digest for valid image", () => {
        const expectedDigest = "myhash";
        const digestResponse = { digest: expectedDigest };
        const digestPayload = new TextEncoder().encode(JSON.stringify(digestResponse));
        const expectedInputPayload = new TextEncoder().encode(JSON.stringify("myimage:latest")).buffer;

        mockHostCall.mockReturnValue(digestPayload);

        const result = ManifestDigest.getOCIManifestDigest("myimage:latest");
        expect(result).toBe(expectedDigest);
        expect(mockHostCall).toHaveBeenCalledWith(
            "kubewarden",
            "oci",
            "v1/manifest_digest",
            expectedInputPayload
        );
        expect(mockHostCall).toHaveBeenCalledTimes(1);
    });
});