import {
  CertificateUtils,
  Crypto,
  HostCall,
  Kubernetes,
  Manifest,
  ManifestConfig,
  ManifestDigest,
  Network,
  OciSignatureVerifier,
} from './index';

describe('host capabilities exports', () => {
  it('exports capability namespaces from the barrel module', () => {
    expect(HostCall.hostCall).toBeDefined();
    expect(Crypto.verifyCert).toBeDefined();
    expect(CertificateUtils.fromString).toBeDefined();
    expect(Kubernetes.getResource).toBeDefined();
    expect(Network.dnsLookup).toBeDefined();
    expect(Manifest.getOCIManifest).toBeDefined();
    expect(ManifestConfig.getOCIManifestAndConfig).toBeDefined();
    expect(ManifestDigest.getOCIManifestDigest).toBeDefined();
    expect(OciSignatureVerifier.verifyPubKeysImage).toBeDefined();
  });
});
