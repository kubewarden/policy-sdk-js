import { HostCall } from '../index';

export namespace Cache {
  /**
   * Stores a value in the policy-controlled cache under the given key, keeping
   * it for `ttl` seconds.
   *
   * Keys reserved for Kubewarden's internal caches (those starting with
   * `kubewarden_internal_`) are rejected by the host.
   *
   * @param {string} key - The key to store the value under.
   * @param {Uint8Array} value - The value to store.
   * @param {number} ttl - The lifespan of the entry, in seconds.
   * @throws {Error} If the host rejects the request (e.g. a reserved key).
   */
  export function set(key: string, value: Uint8Array, ttl: number): void {
    const request = { key, ttl, value: Array.from(value) };
    const payload = new TextEncoder().encode(JSON.stringify(request));
    const response = HostCall.hostCall('kubewarden', 'cache', 'set', payload.buffer);
    const { code, message } = JSON.parse(new TextDecoder().decode(response)) as {
      code: number;
      message: string;
    };

    if (code !== 0) {
      throw new Error(`cache.set failed: ${message}`);
    }
  }

  /**
   * Retrieves the value stored under the given key.
   *
   * @param {string} key - The key to look up.
   * @returns {Uint8Array | null} The stored value, or `null` on a cache miss.
   * @throws {Error} If the host returns an error.
   */
  export function get(key: string): Uint8Array | null {
    const request = { key };
    const payload = new TextEncoder().encode(JSON.stringify(request));
    const response = HostCall.hostCall('kubewarden', 'cache', 'get', payload.buffer);
    const parsed = JSON.parse(new TextDecoder().decode(response)) as {
      code: number;
      message: string;
      value?: number[] | null;
    };

    if (parsed.code !== 0) {
      throw new Error(`cache.get failed: ${parsed.message}`);
    }

    return parsed.value != null ? new Uint8Array(parsed.value) : null;
  }
}
