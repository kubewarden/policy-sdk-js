// Import all modules
import * as admission from './kubewarden/admission';
import * as constants from './kubewarden/constants/constants';
import * as hostCapabilities from './kubewarden/host_capabilities';
import * as validation from './kubewarden/validation';
import * as protocol from './protocol';

// import path only in Node.js environment
let pluginPath: string | undefined;
try {
  // this will only work in Node.js, not in WASM
  if (typeof __dirname !== 'undefined') {
    const path = require('path');
    pluginPath = path.resolve(__dirname, '../plugin/javy-plugin-kubewarden.wasm');
  }
} catch {
  // in WASM environment, pluginPath remains undefined
  pluginPath = undefined;
}

// Export
const exported = {
  admission,
  validation,
  hostCapabilities,
  constants,
  protocol,
  ...(pluginPath && { pluginPath }), // only include pluginPath if it exists
};

export default exported;

// Named exports
export { validation as Validation };
export { protocol };
export { admission };
export { constants };
export { hostCapabilities };
export { pluginPath }; // undefined in WASM

export const { writeOutput } = protocol;
