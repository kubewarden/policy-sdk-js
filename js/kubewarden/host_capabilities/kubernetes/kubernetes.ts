import { HostCall } from '../';

import type {
  GetResourceRequest,
  ListResourcesByNamespaceRequest,
  ListAllResourcesRequest,
  CanIRequest,
  SubjectAccessReviewStatus,
  List,
} from './types';

/**
 * Kubernetes Host Capability
 */
export namespace Kubernetes {
  export function listResourcesByNamespace<T = any>(req: ListResourcesByNamespaceRequest): List<T> {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(req)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize ListResourcesByNamespaceRequest: ${err}`);
    }

    const responsePayload = HostCall.hostCall(
      'kubewarden',
      'kubernetes',
      'list_resources_by_namespace',
      payload,
    );

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Failed to decode or parse listResourcesByNamespaceResponse: ${err}`);
    }
  }

  export function listAllResources<T = any>(req: ListAllResourcesRequest): List<T> {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(req)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize ListAllResourcesRequest: ${err}`);
    }

    const responsePayload = HostCall.hostCall(
      'kubewarden',
      'kubernetes',
      'list_resources_all',
      payload,
    );

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Failed to decode or parse listAllResourcesResponse: ${err}`);
    }
  }

  export function getResource<T = any>(req: GetResourceRequest): T {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(req)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize GetResourceRequest: ${err}`);
    }

    const responsePayload = HostCall.hostCall('kubewarden', 'kubernetes', 'get_resource', payload);

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Failed to decode or parse getResource response: ${err}`);
    }
  }

  export function canI(req: CanIRequest): SubjectAccessReviewStatus {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(req)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize CanIRequest: ${err}`);
    }

    const responsePayload = HostCall.hostCall('kubewarden', 'kubernetes', 'can_i', payload);

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      const parsed = JSON.parse(jsonString);
      return parsed as SubjectAccessReviewStatus;
    } catch (err) {
      throw new Error(`Failed to decode or parse canI response: ${err}`);
    }
  }
}
