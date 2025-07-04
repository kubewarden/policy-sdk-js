import { constants } from '../../../constants/constants';
import * as HostCall from '../../index';
import type { Index, Manifest as OciManifestType } from '../oci-spec';
import {
  MediaTypeImageIndex,
  MediaTypeImageManifest,
  MediaTypeImageConfig,
  MediaTypeDescriptor,
  MediaTypeImageLayer,
} from '../oci-spec';

import { Manifest } from './manifest';
import { OciImageManifestResponse } from './types';

class MockWasmHost {
  private mockResponse: any;

  constructor(response: any) {
    this.mockResponse = response;
  }

  hostCall(
    binding: string,
    namespace: string,
    operation: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _payload: ArrayBuffer,
  ): Uint8Array {
    if (binding !== 'kubewarden' || namespace !== 'oci' || operation !== 'v1/oci_manifest') {
      throw new Error('Invalid host call parameters');
    }
    return new TextEncoder().encode(JSON.stringify(this.mockResponse));
  }
}

function buildImageManifest(mediaType: string): { image: OciManifestType } {
  return {
    image: {
      schemaVersion: 2,
      mediaType: mediaType,
      config: {
        mediaType: MediaTypeImageConfig,
        digest: 'sha256:mydummydigest',
        size: 1024,
      },
      layers: [],
    },
  };
}

function buildIndexManifest(mediaType: string): { index: Index } {
  return {
    index: {
      schemaVersion: 2,
      mediaType: mediaType,
      manifests: [
        {
          mediaType: MediaTypeImageManifest,
          digest: 'sha256:mydummydigest',
          size: 1024,
          platform: {
            architecture: 'amd64',
            os: 'linux',
          },
        },
      ],
    },
  };
}

describe('Manifest Unit Tests', () => {
  let originalHostCall: typeof HostCall.HostCall.hostCall;

  beforeEach(() => {
    originalHostCall = HostCall.HostCall.hostCall;
  });

  afterEach(() => {
    HostCall.HostCall.hostCall = originalHostCall;
    jest.restoreAllMocks();
  });

  const testCases = [
    // Valid image manifest media types
    {
      name: 'OCI image manifest',
      manifest: buildImageManifest(MediaTypeImageManifest),
      failsBecauseUnknownMediaType: false,
    },
    {
      name: 'Docker image manifest',
      manifest: buildImageManifest(constants.ImageManifestMediaType),
      failsBecauseUnknownMediaType: false,
    },
    // Valid index manifest media types
    {
      name: 'OCI image index',
      manifest: buildIndexManifest(MediaTypeImageIndex),
      failsBecauseUnknownMediaType: false,
    },
    {
      name: 'Docker manifest list',
      manifest: buildIndexManifest(constants.ImageManifestListMediaType),
      failsBecauseUnknownMediaType: false,
    },
    // Invalid media types for image manifest
    {
      name: 'Invalid media type - descriptor',
      manifest: buildImageManifest(MediaTypeDescriptor),
      failsBecauseUnknownMediaType: true,
    },
    {
      name: 'Invalid media type - config',
      manifest: buildImageManifest(MediaTypeImageConfig),
      failsBecauseUnknownMediaType: true,
    },
    {
      name: 'Invalid media type - layer',
      manifest: buildImageManifest(MediaTypeImageLayer),
      failsBecauseUnknownMediaType: true,
    },
    // Invalid media types for index manifest
    {
      name: 'Invalid index media type - descriptor',
      manifest: buildIndexManifest(MediaTypeDescriptor),
      failsBecauseUnknownMediaType: true,
    },
    {
      name: 'Invalid index media type - config',
      manifest: buildIndexManifest(MediaTypeImageConfig),
      failsBecauseUnknownMediaType: true,
    },
    {
      name: 'Invalid index media type - layer',
      manifest: buildIndexManifest(MediaTypeImageLayer),
      failsBecauseUnknownMediaType: true,
    },
  ];

  testCases.forEach(testCase => {
    it(`should handle ${testCase.name}`, () => {
      const mockHost = new MockWasmHost(testCase.manifest);
      jest
        .spyOn(HostCall.HostCall, 'hostCall')
        .mockImplementation(mockHost.hostCall.bind(mockHost));

      const imageURI = 'test:latest';

      if (testCase.failsBecauseUnknownMediaType) {
        expect(() => Manifest.getOCIManifest(imageURI)).toThrow('Cannot parse response');
        return;
      }

      const result = Manifest.getOCIManifest(imageURI);
      expect(result).toBeInstanceOf(OciImageManifestResponse);

      // Verify correct manifest type is returned
      const manifest = testCase.manifest as any;
      if (manifest.image) {
        expect(result.imageManifest()).toEqual(manifest.image);
        expect(result.indexManifest()).toBeUndefined();
      } else if (manifest.index) {
        expect(result.indexManifest()).toEqual(manifest.index);
        expect(result.imageManifest()).toBeUndefined();
      }
    });
  });

  it('should throw error for unknown image', () => {
    jest.spyOn(HostCall.HostCall, 'hostCall').mockImplementation(() => {
      throw new Error('Image not found: unknown:latest');
    });

    expect(() => Manifest.getOCIManifest('unknown:latest')).toThrow(
      'Image not found: unknown:latest',
    );
  });
});
