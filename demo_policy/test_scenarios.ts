import type { Pod } from 'kubernetes-types/core/v1';

import { Crypto } from '../js/kubewarden/host_capabilities/crypto/crypto';
import type { Certificate } from '../js/kubewarden/host_capabilities/crypto/types';
import { Kubernetes } from '../js/kubewarden/host_capabilities/kubernetes/kubernetes';
import type { CanIRequest } from '../js/kubewarden/host_capabilities/kubernetes/types';
import { Network } from '../js/kubewarden/host_capabilities/net/network';
import { Manifest } from '../js/kubewarden/host_capabilities/oci/manifest/manifest';
import { ManifestConfig } from '../js/kubewarden/host_capabilities/oci/manifest_config/manifest_config';
import { ManifestDigest } from '../js/kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';
import { Validation } from '../js/kubewarden/validation';

import type { PolicySettings } from './policy_settings';

/**
 * Handles OCI manifest digest lookup success scenario
 */
export function handleOciManifestDigestSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  const digest = ManifestDigest.getOCIManifestDigest(image);
  return new Validation.ValidationResponse(
    !!digest,
    digest ? undefined : 'Failed to retrieve OCI manifest digest',
    undefined,
    undefined,
    { digest: digest || '' },
  );
}

/**
 * Handles OCI manifest digest lookup failure scenario
 */
export function handleOciManifestDigestFailure(): Validation.ValidationResponse {
  const image = 'registry.testing.lan/nonexistent-image:1.0.0';
  const digest = ManifestDigest.getOCIManifestDigest(image); //host call should fail
  return new Validation.ValidationResponse(
    !digest,
    `Unexpectedly succeeded in manifest digest lookup`,
    undefined,
    undefined,
    { digest: digest || '' },
  );
}

/**
 * Handles DNS lookup success scenario
 */
export function handleDnsLookupSuccess(): Validation.ValidationResponse {
  const ips = Network.dnsLookup('google.com').ips;
  return new Validation.ValidationResponse(
    !!ips && ips.length > 0,
    ips && ips.length > 0 ? undefined : 'Failed to retrieve DNS lookup IPs',
    undefined,
    undefined,
    { ips: ips.join(', ') || '' },
  );
}

/**
 * Handles DNS lookup failure scenario
 */
export function handleDnsLookupFailure(): Validation.ValidationResponse {
  const ips = Network.dnsLookup('invalid.nonexistent.tld').ips; // host call should fail
  return new Validation.ValidationResponse(
    false,
    'Unexpectedly retrieved DNS lookup IPs',
    undefined,
    undefined,
    { ips: ips.join(', ') },
  );
}

/**
 * Handles OCI manifest lookup success scenario
 */
export function handleOciManifestSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  const manifest = Manifest.getOCIManifest(image);
  return new Validation.ValidationResponse(
    !!manifest,
    manifest ? undefined : 'Failed to retrieve OCI manifest',
    undefined,
    undefined,
    { manifest: manifest ? JSON.stringify(manifest) : '' },
  );
}

/**
 * Handles OCI manifest lookup failure scenario
 */
export function handleOciManifestFailure(): Validation.ValidationResponse {
  const image = 'example.test/nonexistent-image:1.0.0';
  const manifest = Manifest.getOCIManifest(image);
  return new Validation.ValidationResponse(
    !manifest,
    `Unexpectedly succeeded in manifest lookup`,
    undefined,
    undefined,
    { manifest: '' },
  );
}

/**
 * Handles the default privileged container validation
 */
export function handlePrivilegedContainerValidation(
  validationRequest: any,
  settings: PolicySettings,
): Validation.ValidationResponse {
  if (settings.ignoredNamespaces?.includes(validationRequest.request.namespace || '')) {
    console.error('Privileged containers are allowed inside of ignored namespace');
    return Validation.acceptRequest();
  }

  const pod = JSON.parse(JSON.stringify(validationRequest.request.object)) as Pod;
  const privileged =
    pod.spec?.containers?.some(container => container.securityContext?.privileged) || false;
  if (privileged) {
    return Validation.rejectRequest('privileged containers are not allowed');
  }
  return Validation.acceptRequest();
}

/**
 * Handles OCI manifest and config lookup success scenario
 */
export function handleOciManifestAndConfigSuccess(): Validation.ValidationResponse {
  const image = 'docker.io/library/busybox:1.36';
  const response = ManifestConfig.getOCIManifestAndConfig(image);
  return new Validation.ValidationResponse(
    !!response.manifest && !!response.config,
    response.manifest && response.config ? undefined : 'Failed to retrieve OCI manifest and config',
    undefined,
    undefined,
    {
      manifest: response.manifest ? JSON.stringify(response.manifest) : '',
      digest: response.digest || '',
      config: response.config ? JSON.stringify(response.config) : '',
    },
  );
}

/**
 * Handles OCI manifest and config lookup failure scenario
 */
export function handleOciManifestAndConfigFailure(): Validation.ValidationResponse {
  const image = 'example.test/nonexistent-image';
  const response = ManifestConfig.getOCIManifestAndConfig(image); // host call should fail
  return new Validation.ValidationResponse(
    !response.manifest && !response.config,
    `Unexpectedly succeeded in manifest and config lookup`,
    undefined,
    undefined,
    {
      manifest: response.manifest ? JSON.stringify(response.manifest) : '',
      digest: response.digest || '',
      config: response.config ? JSON.stringify(response.config) : '',
    },
  );
}

/**
 * Handles get resource success scenario
 */
export function handleGetResourceSuccess(): Validation.ValidationResponse {
  const ns = Kubernetes.getResource({
    api_version: 'v1',
    kind: 'Namespace',
    name: 'test-policy',
    disable_cache: false,
  });

  if (ns?.metadata?.labels?.['demo-namespace'] === 'true') {
    return Validation.acceptRequest();
  }

  return Validation.rejectRequest('Namespace does not have label demo-namespace=true');
}

/**
 * Handles get resource failure scenario
 */
export function handleGetResourceFailure(): Validation.ValidationResponse {
  Kubernetes.getResource({
    api_version: 'v1',
    kind: 'Namespace',
    name: 'test-policy',
    disable_cache: false,
  });

  return Validation.rejectRequest('Unexpectedly succeeded in getResource');
}

/**
 * Handles list all resources success scenario
 */
export function handleListAllResourcesSuccess(): Validation.ValidationResponse {
  const pods = Kubernetes.listAllResources({
    api_version: 'v1',
    kind: 'Pod',
    label_selector: 'app=nginx',
  });

  const podCount = pods.items?.length || 0;
  return new Validation.ValidationResponse(
    podCount > 0,
    podCount > 0 ? undefined : 'Failed to retrieve pods',
    undefined,
    undefined,
    { podCount: podCount.toString(), pods: JSON.stringify(pods) },
  );
}

/**
 * Handles list all resources failure scenario
 */
export function handleListAllResourcesFailure(): Validation.ValidationResponse {
  const pods = Kubernetes.listAllResources({
    api_version: 'v1',
    kind: 'InvalidResource',
  }); // host call should fail

  return new Validation.ValidationResponse(
    false,
    'Unexpectedly succeeded in listAllResources',
    undefined,
    undefined,
    { pods: JSON.stringify(pods) },
  );
}

/**
 * Handles list resources by namespace success scenario
 */
export function handleListResourcesByNamespaceSuccess(): Validation.ValidationResponse {
  const configMaps = Kubernetes.listResourcesByNamespace({
    api_version: 'v1',
    kind: 'ConfigMap',
    namespace: 'kube-system',
    label_selector: 'component=kube-proxy',
  });

  const configMapCount = configMaps?.items?.length || 0;
  return new Validation.ValidationResponse(
    configMapCount > 0,
    configMapCount > 0 ? undefined : 'Failed to retrieve configmaps',
    undefined,
    undefined,
    {
      configMapCount: configMapCount.toString(),
      configMaps: JSON.stringify(configMaps),
    },
  );
}

/**
 * Handles list resources by namespace failure scenario
 */
export function handleListResourcesByNamespaceFailure(): Validation.ValidationResponse {
  const resources = Kubernetes.listResourcesByNamespace({
    api_version: 'v1',
    kind: 'Pod',
    namespace: 'nonexistent-namespace',
  }); // host call should fail

  return new Validation.ValidationResponse(
    false,
    'Unexpectedly succeeded in listResourcesByNamespace',
    undefined,
    undefined,
    { resources: JSON.stringify(resources) },
  );
}

/**
 * Handles canI success scenario - checking if we can create pods in default namespace
 */
export function handleCanISuccess(): Validation.ValidationResponse {
  const review: CanIRequest = {
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

  const result = Kubernetes.canI(review);
  return new Validation.ValidationResponse(result.allowed, result.reason);
}

/**
 * Handles canI failure scenario - checking if we can delete cluster-scoped resources
 */
export function handleCanIFailure(): Validation.ValidationResponse {
  const canIResponse = Kubernetes.canI({
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
  }); // host call should return denied

  return new Validation.ValidationResponse(
    canIResponse.allowed === false,
    canIResponse.allowed === false ? undefined : 'Unexpectedly allowed forbidden action',
    undefined,
    undefined,
    {
      allowed: canIResponse.allowed?.toString() || 'false',
      reason: canIResponse.reason || '',
      evaluationError: canIResponse.evaluationError || '',
    },
  );
}

/**
 * Handles crypto certificate verification success scenario
 */
export function handleCryptoVerifyCertSuccess(): Validation.ValidationResponse {
  // Non-CA certificate (end-entity)
  const certString = `-----BEGIN CERTIFICATE-----
MIICbzCCAhWgAwIBAgIJAOHUuhpytCbWMAoGCCqGSM49BAMCMIGFMQswCQYDVQQG
EwJERTEQMA4GA1UECAwHQmF2YXJpYTESMBAGA1UEBwwJTnVyZW1iZXJnMRMwEQYD
VQQKDApLdWJld2FyZGVuMRowGAYDVQQLDBFLdWJld2FyZGVuIFNlcnZlcjEfMB0G
A1UEAwwWa3ViZXdhcmRlbi5leGFtcGxlLmNvbTAeFw0yNTA4MjIwMzI3MTRaFw0z
MDA4MjEwMzI3MTRaMIGFMQswCQYDVQQGEwJERTEQMA4GA1UECAwHQmF2YXJpYTES
MBAGA1UEBwwJTnVyZW1iZXJnMRMwEQYDVQQKDApLdWJld2FyZGVuMRowGAYDVQQL
DBFLdWJld2FyZGVuIFNlcnZlcjEfMB0GA1UEAwwWa3ViZXdhcmRlbi5leGFtcGxl
LmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABFDqqIXTRLsVkdUrVEEuXywc
PbfkgPZ+7OhD56ULZvg94Cff8lLHJNegQ3nS5kiPXgN774eqBnq0e0ZhBSUfKjaj
bDBqMAkGA1UdEwQCMAAwCwYDVR0PBAQDAgSwMBMGA1UdJQQMMAoGCCsGAQUFBwMB
MDsGA1UdEQQ0MDKCFmt1YmV3YXJkZW4uZXhhbXBsZS5jb22CGCoua3ViZXdhcmRl
bi5leGFtcGxlLmNvbTAKBggqhkjOPQQDAgNIADBFAiEA51zpbLQ1zTEppycb7aPs
ZLADjOXvUdmrRej3qXMCWVYCIClFFiL/JpzP9/ZCTzs1XjePGjIhMAgs1Up6yVg8
kLQM
-----END CERTIFICATE-----`;

  const cert: Certificate = {
    encoding: 'Pem',
    data: Array.from(new TextEncoder().encode(certString)),
  };

  // Empty certificate chain - certificate is assumed trusted when chain is empty
  const certChain: Certificate[] = [];

  const notAfter = '2025-12-31T23:59:59Z';

  const result = Crypto.verifyCert(cert, certChain, notAfter);

  return new Validation.ValidationResponse(
    result.trusted,
    result.trusted ? undefined : result.reason,
    undefined,
    undefined,
    {
      trusted: result.trusted.toString(),
      reason: result.reason || '',
      certEncoding: cert.encoding,
      chainLength: certChain.length.toString(),
      notAfter,
      certData: certString,
    },
  );
}

/**
 * Handles crypto certificate verification failure scenario
 */
export function handleCryptoVerifyCertFailure(): Validation.ValidationResponse {
  const invalidCert: Certificate = {
    encoding: 'Pem',
    data: Array.from(new TextEncoder().encode('invalid certificate data')),
  };

  const certChain: Certificate[] = [];
  const notAfter = '2020-01-01T00:00:00Z'; // expired date

  const result = Crypto.verifyCert(invalidCert, certChain, notAfter);
  return new Validation.ValidationResponse(
    false,
    result.reason || 'Expected failure', // reason
    undefined,
    undefined,
    {
      trusted: result.trusted.toString(),
      reason: result.reason || 'Expected failure',
      certEncoding: invalidCert.encoding,
      chainLength: certChain.length.toString(),
      notAfter,
      certData: 'invalid certificate data',
    },
  );
}
