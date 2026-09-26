import { HostCall } from '../host_capabilities';

import { Logging } from './index';

jest.mock('../host_capabilities', () => ({
  HostCall: {
    hostCall: jest.fn(),
  },
}));

const mockedHostCall = HostCall.hostCall as jest.MockedFunction<typeof HostCall.hostCall>;

function decodeLastPayload(): Record<string, unknown> {
  const payload = mockedHostCall.mock.calls[mockedHostCall.mock.calls.length - 1][3];
  return JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>;
}

describe('Logging', () => {
  beforeEach(() => {
    mockedHostCall.mockClear();
    mockedHostCall.mockReturnValue(new Uint8Array());
  });

  it('should send log entries through the Kubewarden tracing host capability', () => {
    Logging.info('demo-policy', 'request accepted', {
      namespace: 'default',
      allowed: true,
    });

    expect(mockedHostCall).toHaveBeenCalledWith(
      'kubewarden',
      'tracing',
      'log',
      expect.any(ArrayBuffer),
    );
    expect(decodeLastPayload()).toEqual({
      level: 'info',
      message: 'request accepted',
      context: 'demo-policy',
      namespace: 'default',
      allowed: true,
    });
  });

  it('should keep reserved log fields under SDK control', () => {
    Logging.warn('demo-policy', 'settings ignored', {
      level: 'debug',
      message: 'overwritten',
      context: 'other-context',
      setting: 'ignoredNamespaces',
    });

    expect(decodeLastPayload()).toEqual({
      level: 'warning',
      message: 'settings ignored',
      context: 'demo-policy',
      setting: 'ignoredNamespaces',
    });
  });

  it('should expose generic and convenience level helpers', () => {
    Logging.log(Logging.Level.Trace, 'demo-policy', 'trace message');
    Logging.debug('demo-policy', 'debug message');
    Logging.error('demo-policy', 'error message');

    expect(mockedHostCall).toHaveBeenCalledTimes(3);
    expect(decodeLastPayload()).toEqual({
      level: 'error',
      message: 'error message',
      context: 'demo-policy',
    });
  });

  it('should fail before calling the host when log fields cannot be serialized', () => {
    const fields: Logging.Fields = {};
    fields.self = fields;

    expect(() => Logging.info('demo-policy', 'bad log entry', fields)).toThrow(
      'Cannot serialize policy log entry',
    );
    expect(mockedHostCall).not.toHaveBeenCalled();
  });
});
