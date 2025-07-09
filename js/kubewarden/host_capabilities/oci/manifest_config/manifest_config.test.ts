import * as HostCall from '../../index';
import { MediaTypeImageManifest, MediaTypeImageConfig } from '../oci-spec';

import { ManifestConfig } from './manifest_config';
import type { OciImageManifestAndConfigResponse } from './types';

class MockWasmHost {
  private mockResponse: any;
  private knownImages: Record<string, any>;

  constructor(knownImages: Record<string, any> = {}) {
    this.knownImages = knownImages;
    this.mockResponse = null;
  }

  hostCall(
    binding: string,
    namespace: string,
    operation: string,
    payload: ArrayBuffer,
  ): Uint8Array {
    if (binding !== 'kubewarden' || namespace !== 'oci' || operation !== 'v1/oci_manifest_config') {
      throw new Error('Invalid host call parameters');
    }

    const image = JSON.parse(new TextDecoder().decode(payload)) as string;

    if (this.mockResponse) {
      return new TextEncoder().encode(JSON.stringify(this.mockResponse));
    }

    if (this.knownImages[image]) {
      return new TextEncoder().encode(JSON.stringify(this.knownImages[image]));
    }

    throw new Error(`image not found: ${image}`);
  }
}

function buildManifestAndConfigResponse(): OciImageManifestAndConfigResponse {
  return {
    manifest: {
      schemaVersion: 2,
      mediaType: MediaTypeImageManifest,
      config: {
        mediaType: MediaTypeImageConfig,
        digest: 'sha256:mydummydigest',
        size: 1024,
        annotations: { annotation: 'value' },
        platform: {
          architecture: 'amd64',
          os: 'linux',
        },
      },
      layers: [],
      annotations: { annotation: 'value' },
    },
    digest: 'sha256:mydummydigest',
    config: {
      created: new Date().toISOString(),
      author: 'kubewarden',
      architecture: 'amd64',
      os: 'linux',
      config: {
        user: '1000',
        cmd: ['echo', 'hello'],
        entrypoint: ['echo'],
        env: ['key=value'],
        workingDir: '/',
        labels: { label: 'value' },
        stopSignal: 'SIGTERM',
        exposedPorts: { '80/tcp': {} },
        volumes: { '/tmp': {} },
      },
      rootfs: {
        type: 'layers',
        diffIds: ['sha256:mydummydigest'],
      },
      history: [
        {
          created: new Date().toISOString(),
          createdBy: 'kubewarden',
          author: 'kubewarden',
          comment: 'initial commit',
        },
      ],
    },
  };
}

describe('ManifestConfig Unit Tests', () => {
  let originalHostCall: typeof HostCall.HostCall.hostCall;
  let mockHost: MockWasmHost;

  beforeEach(() => {
    originalHostCall = HostCall.HostCall.hostCall;
    mockHost = new MockWasmHost();
  });

  afterEach(() => {
    HostCall.HostCall.hostCall = originalHostCall;
    jest.restoreAllMocks();
  });

  it('should return manifest and config for valid image', () => {
    const image = 'myimage:latest';
    const expectedResponse = buildManifestAndConfigResponse();

    mockHost = new MockWasmHost({
      [image]: expectedResponse,
    });

    jest.spyOn(HostCall.HostCall, 'hostCall').mockImplementation(mockHost.hostCall.bind(mockHost));

    const result = ManifestConfig.getOCIManifestAndConfig(image);
    expect(result).toEqual(expectedResponse);
    expect(result.manifest).toBeDefined();
    expect(result.digest).toBe('sha256:mydummydigest');
    expect(result.config).toBeDefined();
  });

  it('should throw error for JSON serialization failure', () => {
    const image = { invalid: Symbol('test') }; // Symbol cannot be JSON serialized
    jest.spyOn(JSON, 'stringify').mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    expect(() => ManifestConfig.getOCIManifestAndConfig(image as any)).toThrow(
      'Cannot serialize image URI to JSON: Error: Invalid JSON',
    );
  });

  it('should throw error for invalid response parsing', () => {
    const image = 'myimage:latest';
    // Mock hostCall to return raw invalid JSON bytes
    jest.spyOn(HostCall.HostCall, 'hostCall').mockImplementation(() => {
      return new TextEncoder().encode('{'); // malformed JSON
    });
    expect(() => ManifestConfig.getOCIManifestAndConfig(image)).toThrow(
      /Failed to parse response from the host/,
    );
  });

  it('should throw error for unknown image', () => {
    const image = 'unknown:latest';
    mockHost = new MockWasmHost();

    jest.spyOn(HostCall.HostCall, 'hostCall').mockImplementation(mockHost.hostCall.bind(mockHost));

    expect(() => ManifestConfig.getOCIManifestAndConfig(image)).toThrow(
      `Image not found: ${image}`,
    );
  });
});
