import { readInput } from '../../protocol';

// this function is provided by the Kubewarden Javy plugin
declare function __hostCall(binding: string, ns: string, op: string, payload: ArrayBuffer): boolean;

export namespace HostCall {
  /**
   * Makes a host call with the specified binding, namespace, operation, and payload.
   *
   * @param {string} binding - The binding to use for the host call.
   * @param {string} ns - The namespace for the host call.
   * @param {string} op - The operation to perform in the host call.
   * @param {ArrayBuffer} payload - The payload to send with the host call.
   * @returns {Uint8Array} - The response from the host call.
   * @throws {Error} - Throws an error if the host call is unsuccessful.
   */
  export function hostCall(
    binding: string,
    ns: string,
    op: string,
    payload: ArrayBuffer,
  ): Uint8Array {
    const isSuccessful = __hostCall(binding, ns, op, payload);
    const response = readInput();

    if (!isSuccessful) {
      const responseText = new TextDecoder('utf-8').decode(response);
      console.error('Host call failed: ', responseText);
      throw new Error('Host call failed');
    }

    return response;
  }
}
