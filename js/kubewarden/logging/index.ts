import { HostCall } from '../host_capabilities';

export namespace Logging {
  export enum Level {
    Trace = 'trace',
    Debug = 'debug',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
  }

  export type Fields = Record<string, unknown>;

  /**
   * Sends a policy log entry to the Kubewarden host.
   *
   * The log is propagated through the Kubewarden tracing host capability instead
   * of writing to stdout or stderr.
   */
  export function log(level: Level, context: string, message: string, fields: Fields = {}): void {
    let payload: ArrayBuffer;
    try {
      payload = new TextEncoder().encode(
        JSON.stringify({
          ...fields,
          level,
          message,
          context,
        }),
      ).buffer;
    } catch (err) {
      throw new Error(`Cannot serialize policy log entry: ${err}`);
    }

    HostCall.hostCall('kubewarden', 'tracing', 'log', payload);
  }

  export function trace(context: string, message: string, fields: Fields = {}): void {
    log(Level.Trace, context, message, fields);
  }

  export function debug(context: string, message: string, fields: Fields = {}): void {
    log(Level.Debug, context, message, fields);
  }

  export function info(context: string, message: string, fields: Fields = {}): void {
    log(Level.Info, context, message, fields);
  }

  export function warn(context: string, message: string, fields: Fields = {}): void {
    log(Level.Warning, context, message, fields);
  }

  export function error(context: string, message: string, fields: Fields = {}): void {
    log(Level.Error, context, message, fields);
  }
}
