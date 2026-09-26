// Import all modules

import * as admission from './kubewarden/admission';
import * as constants from './kubewarden/constants/constants';
import * as hostCapabilities from './kubewarden/host_capabilities';
import * as logging from './kubewarden/logging';
import * as validation from './kubewarden/validation';
import * as protocol from './protocol';

// Export
const exported = {
  admission,
  validation,
  hostCapabilities,
  logging,
  constants,
  protocol,
};

export default exported;

// Named exports
export { validation as Validation };
export { protocol };
export { admission };
export { constants };
export { hostCapabilities };
export { logging };
export { Logging } from './kubewarden/logging';

export const { writeOutput } = protocol;
