import type { ImageConfiguration, Manifest } from '../oci-spec';

export interface OciImageManifestAndConfigResponse {
  manifest: Manifest;
  digest: string;
  config: ImageConfiguration;
}
