import type { Pod } from 'kubernetes-types/core/v1';

import { Crypto } from '../js/kubewarden/host_capabilities/crypto/crypto';
import type { Certificate } from '../js/kubewarden/host_capabilities/crypto/types';
import { Kubernetes } from '../js/kubewarden/host_capabilities/kubernetes/kubernetes';
import type { CanIRequest } from '../js/kubewarden/host_capabilities/kubernetes/types';
import { Network } from '../js/kubewarden/host_capabilities/net/network';
import { Manifest } from '../js/kubewarden/host_capabilities/oci/manifest/manifest';
import { ManifestConfig } from '../js/kubewarden/host_capabilities/oci/manifest_config/manifest_config';
import { ManifestDigest } from '../js/kubewarden/host_capabilities/oci/manifest_digest/manifest_digest';
import { OciSignatureVerifier } from '../js/kubewarden/host_capabilities/oci/verify_v2/verifier';
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
/**
 * Handles signature verification using public keys success scenario
 */
export function handleSigstoreVerifyPubKeySuccess(): Validation.ValidationResponse {
  const image = 'registry.example.com/signed-app:v1.0.0';
  const pubKeys = [
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
  ];

  const result = OciSignatureVerifier.verifyPubKeysImage(image, pubKeys);
  return new Validation.ValidationResponse(
    result.is_trusted,
    result.is_trusted ? undefined : 'Image signature verification with public key failed',
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'public_key',
    },
  );
}

/**
 * Handles signature verification using public keys failure scenario
 */
export function handleSigstoreVerifyPubKeyFailure(): Validation.ValidationResponse {
  const image = 'registry.example.com/unsigned-app:v1.0.0';
  const pubKeys = [
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
  ];

  const result = OciSignatureVerifier.verifyPubKeysImage(image, pubKeys);
  return new Validation.ValidationResponse(
    !result.is_trusted,
    result.is_trusted ? 'Unexpectedly verified unsigned image with public key' : undefined,
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'public_key',
    },
  );
}

/**
 * Handles keyless signature verification (exact match) success scenario
 */
export function handleSigstoreVerifyKeylessExactSuccess(): Validation.ValidationResponse {
  const image = 'registry.example.com/ci-signed-app:v1.0.0';
  const keyless = [
    {
      issuer: 'https://github.com/login/oauth',
      subject: 'user@example.com',
    },
  ];

  const result = OciSignatureVerifier.verifyKeylessExactMatch(image, keyless);
  return new Validation.ValidationResponse(
    result.is_trusted,
    result.is_trusted ? undefined : 'Keyless exact match signature verification failed',
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'keyless_exact',
    },
  );
}

/**
 * Handles keyless signature verification (exact match) failure scenario
 */
export function handleSigstoreVerifyKeylessExactFailure(): Validation.ValidationResponse {
  const image = 'registry.example.com/untrusted-app:v1.0.0';
  const keyless = [
    {
      issuer: 'https://github.com/login/oauth',
      subject: 'untrusted@example.com',
    },
  ];

  const result = OciSignatureVerifier.verifyKeylessExactMatch(image, keyless);
  return new Validation.ValidationResponse(
    !result.is_trusted,
    result.is_trusted ? 'Unexpectedly verified untrusted keyless signature' : undefined,
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'keyless_exact',
    },
  );
}

/**
 * Handles keyless signature verification (prefix match) success scenario
 */
export function handleSigstoreVerifyKeylessPrefixSuccess(): Validation.ValidationResponse {
  const image = 'registry.example.com/org-signed-app:v1.0.0';
  const keylessPrefix = [
    {
      issuer: 'https://github.com/login/oauth',
      url_prefix: 'https://github.com/trusted-org/',
    },
  ];

  const result = OciSignatureVerifier.verifyKeylessPrefixMatch(image, keylessPrefix);
  return new Validation.ValidationResponse(
    result.is_trusted,
    result.is_trusted ? undefined : 'Keyless prefix match signature verification failed',
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'keyless_prefix',
    },
  );
}

/**
 * Handles keyless signature verification (prefix match) failure scenario
 */
export function handleSigstoreVerifyKeylessPrefixFailure(): Validation.ValidationResponse {
  const image = 'registry.example.com/untrusted-org-app:v1.0.0';
  const keylessPrefix = [
    {
      issuer: 'https://github.com/login/oauth',
      url_prefix: 'https://github.com/trusted-org/',
    },
  ];

  const result = OciSignatureVerifier.verifyKeylessPrefixMatch(image, keylessPrefix);
  return new Validation.ValidationResponse(
    !result.is_trusted,
    result.is_trusted ? 'Unexpectedly verified untrusted keyless prefix signature' : undefined,
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'keyless_prefix',
    },
  );
}

/**
 * Handles GitHub Actions signature verification success scenario
 */
export function handleSigstoreVerifyGithubActionsSuccess(): Validation.ValidationResponse {
  const image = 'registry.example.com/github-actions-app:v1.0.0';
  const owner = 'trusted-org';
  const repo = 'trusted-repo';

  const result = OciSignatureVerifier.verifyKeylessGithubActions(image, owner, repo);
  return new Validation.ValidationResponse(
    result.is_trusted,
    result.is_trusted ? undefined : 'GitHub Actions signature verification failed',
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'github_actions',
      owner,
      repo,
    },
  );
}

/**
 * Handles GitHub Actions signature verification failure scenario
 */
export function handleSigstoreVerifyGithubActionsFailure(): Validation.ValidationResponse {
  const image = 'registry.example.com/untrusted-github-app:v1.0.0';
  const owner = 'untrusted-org';
  const repo = 'untrusted-repo';

  const result = OciSignatureVerifier.verifyKeylessGithubActions(image, owner, repo);
  return new Validation.ValidationResponse(
    !result.is_trusted,
    result.is_trusted ? 'Unexpectedly verified untrusted GitHub Actions signature' : undefined,
    undefined,
    undefined,
    {
      is_trusted: result.is_trusted.toString(),
      digest: result.digest,
      verification_method: 'github_actions',
      owner,
      repo,
    },
  );
}

/**
 * Handles crypto certificate verification success scenario
 */
export function handleCryptoVerifyCertSuccess(): Validation.ValidationResponse {
  // Use the same certificate as in the Go test - simple string converted to byte array
  const certString = 'certificate0';
  const cert: Certificate = {
    encoding: 'Pem',
    data: Array.from(new TextEncoder().encode(certString)),
  };

  const certChain: Certificate[] = [];

  const notAfter = '2025-12-31T23:59:59Z';

  try {
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
        certData: certString, // for debugging
      },
    );
  } catch (error) {
    return new Validation.ValidationResponse(
      false,
      `Certificate verification failed: ${error}`,
      undefined,
      undefined,
      {
        trusted: 'false',
        reason: `Error: ${error}`,
        certEncoding: cert.encoding,
        chainLength: certChain.length.toString(),
        notAfter,
        certData: certString,
      },
    );
  }
}

/**
 * Handles crypto certificate verification failure scenario
 */
export function handleCryptoVerifyCertFailure(): Validation.ValidationResponse {
  // Invalid certificate data that will cause verification to fail
  const invalidCert: Certificate = {
    encoding: 'Pem',
    data: Array.from(new TextEncoder().encode('invalid certificate data')),
  };

  const certChain: Certificate[] = [];
  const notAfter = '2020-01-01T00:00:00Z'; // expired date

  try {
    const result = Crypto.verifyCert(invalidCert, certChain, notAfter);
    return new Validation.ValidationResponse(
      !result.trusted,
      result.trusted ? 'Unexpectedly trusted invalid certificate' : undefined,
      undefined,
      undefined,
      {
        trusted: result.trusted.toString(),
        reason: result.reason || '',
        certEncoding: invalidCert.encoding,
        chainLength: certChain.length.toString(),
        notAfter,
      },
    );
  } catch (error) {
    // Expected to fail - this is the success case for this test
    return new Validation.ValidationResponse(true, undefined, undefined, undefined, {
      trusted: 'false',
      reason: `Expected failure: ${error}`,
      certEncoding: invalidCert.encoding,
      chainLength: certChain.length.toString(),
      notAfter,
    });
  }
}
