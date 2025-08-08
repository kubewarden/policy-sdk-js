import { HostCall } from '../';

import { Kubernetes } from './kubernetes';
import type {
  GetResourceRequest,
  ListResourcesByNamespaceRequest,
  ListAllResourcesRequest,
  CanIRequest,
} from './types';

// Mock the HostCall
jest.mock('../', () => ({
  HostCall: {
    hostCall: jest.fn(),
  },
}));

// Get the mocked function
const mockedHostCall = HostCall.hostCall as jest.MockedFunction<typeof HostCall.hostCall>;

describe('Kubernetes', () => {
  beforeEach(() => {
    mockedHostCall.mockClear();
  });

  describe('getResource', () => {
    it('should call hostCall with correct parameters and return parsed resource', () => {
      const expectedResponse = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: 'test-policy',
          labels: {
            'demo-namespace': 'true',
          },
        },
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const req: GetResourceRequest = {
        api_version: 'v1',
        kind: 'Namespace',
        name: 'test-policy',
        disable_cache: false,
      };

      const result = Kubernetes.getResource(req);

      // Verify hostCall was called with correct parameters
      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'kubernetes',
        'get_resource',
        new TextEncoder().encode(JSON.stringify(req)).buffer,
      );

      // Verify result
      expect(result.kind).toBe('Namespace');
      expect(result.metadata?.labels?.['demo-namespace']).toBe('true');
    });

    it('should handle hostCall errors', () => {
      mockedHostCall.mockImplementation(() => {
        throw new Error('Host call failed');
      });

      const req: GetResourceRequest = {
        api_version: 'v1',
        kind: 'Pod',
        name: 'nginx',
        namespace: 'default',
        disable_cache: false,
      };

      expect(() => Kubernetes.getResource(req)).toThrow('Host call failed');
    });
  });

  describe('listResourcesByNamespace', () => {
    it('should call hostCall with correct parameters', () => {
      const expectedResponse = {
        kind: 'PodList',
        items: [{ metadata: { name: 'pod1' } }, { metadata: { name: 'pod2' } }],
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const req: ListResourcesByNamespaceRequest = {
        api_version: 'v1',
        kind: 'Pod',
        namespace: 'default',
        label_selector: 'app=nginx',
        field_selector: 'status.phase=Running',
      };

      const result = Kubernetes.listResourcesByNamespace(req);

      // Verify hostCall was called with correct parameters
      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'kubernetes',
        'list_resources_by_namespace',
        new TextEncoder().encode(JSON.stringify(req)).buffer,
      );

      // Verify result
      expect(result.kind).toBe('PodList');
      expect(result.items).toHaveLength(2);
    });

    it('should handle hostCall errors', () => {
      mockedHostCall.mockImplementation(() => {
        throw new Error('Namespace not found');
      });

      const req: ListResourcesByNamespaceRequest = {
        api_version: 'v1',
        kind: 'Pod',
        namespace: 'nonexistent',
      };

      expect(() => Kubernetes.listResourcesByNamespace(req)).toThrow('Namespace not found');
    });
  });

  describe('listAllResources', () => {
    it('should call hostCall with correct parameters', () => {
      const expectedResponse = {
        kind: 'PodList',
        items: [
          { metadata: { name: 'pod1', namespace: 'default' } },
          { metadata: { name: 'pod2', namespace: 'kube-system' } },
        ],
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const req: ListAllResourcesRequest = {
        api_version: 'v1',
        kind: 'Pod',
        label_selector: 'app=nginx',
        field_selector: 'status.phase=Running',
      };

      const result = Kubernetes.listAllResources(req);

      // Verify hostCall was called with correct parameters
      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'kubernetes',
        'list_resources_all',
        new TextEncoder().encode(JSON.stringify(req)).buffer,
      );

      // Verify result
      expect(result.kind).toBe('PodList');
      expect(result.items).toHaveLength(2);
    });

    it('should handle invalid resource kind', () => {
      mockedHostCall.mockImplementation(() => {
        throw new Error('Invalid resource kind');
      });

      const req: ListAllResourcesRequest = {
        api_version: 'v1',
        kind: 'InvalidResource',
      };

      expect(() => Kubernetes.listAllResources(req)).toThrow('Invalid resource kind');
    });
  });

  describe('canI', () => {
    it('should call hostCall with correct parameters and return access review result', () => {
      const expectedResponse = {
        allowed: true,
        denied: false,
        reason: 'User is authorized',
        evaluationError: '',
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const req: CanIRequest = {
        subject_access_review: {
          groups: ['developers'],
          resource_attributes: {
            namespace: 'default',
            verb: 'get',
            group: '',
            resource: 'pods',
          },
          user: 'jane.doe@example.com',
        },
        disable_cache: false,
      };

      const result = Kubernetes.canI(req);

      // Verify hostCall was called with correct parameters
      expect(mockedHostCall).toHaveBeenCalledWith(
        'kubewarden',
        'kubernetes',
        'can_i',
        new TextEncoder().encode(JSON.stringify(req)).buffer,
      );

      // Verify result
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('User is authorized');
    });

    it('should handle authorization denial', () => {
      const expectedResponse = {
        allowed: false,
        denied: true,
        reason: 'User lacks permissions',
        evaluationError: '',
      };

      mockedHostCall.mockReturnValue(new TextEncoder().encode(JSON.stringify(expectedResponse)));

      const req: CanIRequest = {
        subject_access_review: {
          groups: [],
          resource_attributes: {
            namespace: '',
            verb: 'delete',
            group: '',
            resource: 'nodes',
          },
          user: 'system:serviceaccount:kubewarden:kubewarden-controller',
        },
        disable_cache: false,
      };

      const result = Kubernetes.canI(req);

      expect(result.allowed).toBe(false);
      expect(result.denied).toBe(true);
      expect(result.reason).toBe('User lacks permissions');
    });

    it('should handle hostCall errors', () => {
      mockedHostCall.mockImplementation(() => {
        throw new Error('Authorization service unavailable');
      });

      const req: CanIRequest = {
        subject_access_review: {
          groups: undefined,
          resource_attributes: {
            namespace: undefined,
            verb: 'create',
            group: '',
            resource: 'pods',
          },
          user: 'system:serviceaccount:default:my-service-account',
        },
        disable_cache: false,
      };

      expect(() => Kubernetes.canI(req)).toThrow('Authorization service unavailable');
    });
  });

  describe('error handling', () => {
    it('should handle JSON serialization errors', () => {
      const invalidRequest = {
        api_version: 'v1',
        kind: 'Pod',
        name: 'test',
        // Create a circular reference to cause JSON.stringify to fail
        circular: {} as any,
      };
      invalidRequest.circular.self = invalidRequest;

      expect(() => Kubernetes.getResource(invalidRequest as any)).toThrow(/Cannot serialize/);
    });

    it('should handle JSON parsing errors in response', () => {
      // Return invalid JSON
      mockedHostCall.mockReturnValue(new TextEncoder().encode('invalid json'));

      const req: GetResourceRequest = {
        api_version: 'v1',
        kind: 'Pod',
        name: 'test',
        disable_cache: false,
      };

      expect(() => Kubernetes.getResource(req)).toThrow(/Failed to decode or parse/);
    });
  });
});
