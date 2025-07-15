import { HostCall } from '../';

import type { GetResourceRequest } from './types';

/**
 * Kubernetes Host Capability: get_resource
 */
export namespace Kubernetes {
  export function getResource<T = any>(req: GetResourceRequest): T {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(JSON.stringify(req)).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize GetResourceRequest: ${err}`);
    }

    let responsePayload: ArrayBuffer;
    try {
      responsePayload = HostCall.hostCall('kubewarden', 'kubernetes', 'get_resource', payload);
    } catch (err) {
      throw new Error(`${err}`);
    }

    try {
      const jsonString = new TextDecoder().decode(responsePayload);
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error(`Failed to decode or parse getResource response: ${err}`);
    }
  }
}
