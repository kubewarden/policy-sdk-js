import { Kubernetes } from './kubernetes';
import type { GetResourceRequest } from './types';

// Mock the HostCall
jest.mock('../', () => ({
  HostCall: {
    hostCall: jest.fn(() => {
      const response = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: 'test-policy',
          labels: {
            'demo-namespace': 'true',
          },
        },
      };
      return new TextEncoder().encode(JSON.stringify(response)).buffer;
    }),
  },
}));

describe('Kubernetes.getResource', () => {
  it('should return parsed Kubernetes resource object', () => {
    const req: GetResourceRequest = {
      api_version: 'v1',
      kind: 'Namespace',
      name: 'test-policy',
      disable_cache: false,
    };

    const result = Kubernetes.getResource(req);
    expect(result.kind).toBe('Namespace');
    expect(result.metadata?.labels?.['demo-namespace']).toBe('true');
  });
});
