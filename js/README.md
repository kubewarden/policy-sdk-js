[![Sandbox](https://img.shields.io/badge/status-sandbox-red?style=for-the-badge)](https://github.com/kubewarden/community/blob/main/REPOSITORIES.md#sandbox)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache2.0-brightgreen.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/kubewarden-policy-sdk.svg)](https://www.npmjs.com/package/kubewarden-policy-sdk)

# Kubewarden Policy SDK for JavaScript/TypeScript

> [!WARNING] 
> The SDK is experimental and under active development.

The official JavaScript/TypeScript SDK for writing [Kubewarden](https://kubewarden.io/) policies. This SDK allows you to write Kubernetes admission policies using TypeScript/JavaScript that compile to WebAssembly modules.

## Installation

```bash
npm install kubewarden-policy-sdk
```

## Quick Start

### Basic Policy Structure

```typescript
import { Validation, writeOutput } from 'kubewarden-policy-sdk';

function validate() {
  // Read the admission request
  const validationRequest = Validation.readValidationRequest();
  const settings = validationRequest.settings;

  // Your policy logic here
  const isValid = yourValidationLogic(validationRequest.request);

  // Create response
  const response = new Validation.ValidationResponse(
    isValid,
    isValid ? undefined : 'Request rejected by policy',
    undefined, // mutated_object (for mutating policies)
    undefined, // warnings
    { customData: 'example' }, // annotations
  );

  // Write the response
  writeOutput(response);
}

// Export the validate function
(globalThis as any).validate = validate;
```

### Using Host Capabilities

> [!IMPORTANT]  
> Logging to `stdout` will break your policy. Always use `console.error()` for logging instead of `console.log()` to avoid policy failures.

The SDK provides access to Kubewarden's host capabilities:

#### Network Operations

```typescript
import { hostCapabilities } from 'kubewarden-policy-sdk';

// DNS lookup
const dnsResult = hostCapabilities.Net.lookupHost('example.com');
console.error('IPs:', dnsResult.ips);
```

#### OCI Registry Operations

```typescript
import { hostCapabilities } from 'kubewarden-policy-sdk';

// Get OCI manifest
const manifest = hostCapabilities.OciManifest.getManifest('registry.io/image:tag');
console.error('Manifest:', manifest);

// Verify image signatures
const verificationResult = hostCapabilities.OciSignatureVerifier.verifyPubKeysImage(
  'registry.io/image:tag',
  ['-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'],
);
```

#### Kubernetes API Access

```typescript
import { hostCapabilities } from 'kubewarden-policy-sdk';

// Get a Kubernetes resource
const resource = hostCapabilities.Kubernetes.getResource({
  apiVersion: 'v1',
  kind: 'Pod',
  name: 'my-pod',
  namespace: 'default',
});

// List resources
const pods = hostCapabilities.Kubernetes.listResourcesByNamespace({
  apiVersion: 'v1',
  kind: 'Pod',
  namespace: 'default',
});
```

#### Cryptographic Operations

```typescript
import { hostCapabilities } from 'kubewarden-policy-sdk';

// Verify certificate
const cert = hostCapabilities.Crypto.CertificateUtils.fromString(
  '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----',
  'Pem',
);

const verificationResult = hostCapabilities.Crypto.verifyCert(
  cert,
  [], // certificate chain
  '2025-12-31T23:59:59Z', // not_after
);
```

### Complete Example Policy

```typescript
import { Validation, writeOutput } from 'kubewarden-policy-sdk';
import type { Pod } from 'kubernetes-types/core/v1';

interface PolicySettings {
  ignoredNamespaces?: string[];
  allowPrivileged?: boolean;
}

function validate() {
  const validationRequest = Validation.readValidationRequest();
  const settings = validationRequest.settings as PolicySettings;
  const pod = validationRequest.request.object as Pod;

  // Skip validation for ignored namespaces
  if (settings.ignoredNamespaces?.includes(pod.metadata?.namespace || '')) {
    writeOutput(new Validation.ValidationResponse(true));
    return;
  }

  // Check for privileged containers
  const hasPrivilegedContainers =
    pod.spec?.containers?.some(container => container.securityContext?.privileged === true) ||
    false;

  if (hasPrivilegedContainers && !settings.allowPrivileged) {
    writeOutput(
      new Validation.ValidationResponse(
        false,
        'Privileged containers are not allowed',
        undefined,
        undefined,
        { violationType: 'privileged-container' },
      ),
    );
    return;
  }

  writeOutput(new Validation.ValidationResponse(true));
}

(globalThis as any).validate = validate;
```

## API Reference

### Core Classes

#### `Validation.ValidationResponse`

```typescript
new ValidationResponse(
  accepted: boolean,           // Whether the request is accepted
  message?: string,           // Optional rejection message
  mutated_object?: any,       // For mutating admission controllers
  warnings?: string[],        // Optional warnings
  annotations?: Record<string, string> // Custom annotations
)
```

#### `Validation.readValidationRequest()`

Reads and parses the incoming Kubernetes admission request.

### Host Capabilities

#### Network

- `lookupHost(hostname: string)`: DNS resolution

#### Container Registry

- `getManifest(image: string)`: Get OCI manifest
- `getManifestConfig(image: string)`: Get manifest configuration
- `getManifestDigest(image: string)`: Get manifest digest

#### Signature Verifier

- `verifyPubKeysImage(image: string, pubKeys: string[])`: Verify with public keys
- `verifyKeylessExactMatch(image: string, keyless: KeylessInfo[])`: Keyless verification
- `verifyKeylessPrefix(image: string, keyless: KeylessPrefixInfo[])`: Prefix-based keyless verification
- `verifyGithubActions(image: string, owner: string)`: GitHub Actions verification

#### Kubernetes

- `getResource(request: GetResourceRequest)`: Get a specific resource
- `listResourcesByNamespace(request: ListResourcesRequest)`: List resources in namespace
- `listAllResources(request: ListResourcesRequest)`: List all resources
- `canI(request: CanIRequest)`: Check permissions using the Kubernetes authorization API

#### Cryptographic

- `verifyCert(cert: Certificate, certChain: Certificate[], notAfter?: string)`: Verify certificates
- `CertificateUtils.fromString(certString: string, encoding: CertificateEncoding)`: Create certificate from string
- `CertificateUtils.toString(cert: Certificate)`: Convert certificate to string

For complete documentation of all available host capabilities, see the [Kubewarden Host Capabilities Reference](https://docs.kubewarden.io/reference/spec/host-capabilities/intro-host-capabilities).

## Building Policies

### Prerequisites

- Node.js and npm
- [Javy](https://github.com/bytecodealliance/javy) - JavaScript to WebAssembly compiler
- [kwctl](https://github.com/kubewarden/kwctl) - Kubewarden CLI tool

### Build Process

1. **Install the SDK**:

   ```bash
   npm install kubewarden-policy-sdk
   ```

2. **Write your policy** (e.g., `main.ts`)

3. **Set up your project structure** with appropriate `package.json`, `tsconfig.json`, and `webpack.config.js`

4. **Build the policy**:

   ```bash
   make build           # Compile TypeScript and bundle JavaScript
   make annotated-policy.wasm  # Compile to WebAssembly and annotate
   ```

5. **Test your policy**:
   ```bash
   kwctl run annotated-policy.wasm -r request.json
   ```

### Plugin Location

The Javy plugin required for compilation is included in the package at:

```
node_modules/kubewarden-policy-sdk/plugin/javy-plugin-kubewarden.wasm
```

## Testing

The SDK includes comprehensive testing utilities. See the [demo policy](https://github.com/kubewarden/policy-sdk-js/tree/main/demo_policy) for examples of:

- Unit testing with Jest
- End-to-end testing with BATS
- Mock host capabilities for testing

## Examples

The best way to get started is with the [JavaScript Policy Template](https://github.com/kubewarden/js-policy-template) which provides a ready-to-use project structure and examples.

You can also check out the [demo policy](https://github.com/kubewarden/policy-sdk-js/tree/main/demo_policy) in this repository for a complete working example that demonstrates:

- Basic admission control logic
- Host capabilities usage
- Configuration handling
- Testing strategies

## Contributing

We welcome contributions! Please see the [contributing guidelines](https://github.com/kubewarden/policy-sdk-js/blob/main/CONTRIBUTING.md) for more information.

### Development Setup

```bash
git clone https://github.com/kubewarden/policy-sdk-js.git
cd policy-sdk-js/js
npm install
npm test
```

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](https://github.com/kubewarden/policy-sdk-js/blob/main/LICENSE) file for details.

## Support

- [Documentation](https://docs.kubewarden.io/)
- [Slack](https://kubernetes.slack.com/archives/C01T3GTC3L7) (#kubewarden)
- [Issues](https://github.com/kubewarden/policy-sdk-js/issues)
