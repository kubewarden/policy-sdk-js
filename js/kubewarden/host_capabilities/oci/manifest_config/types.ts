import type { Image, Manifest } from '../oci-spec';

export interface OciImageManifestAndConfigResponse {
  manifest: Manifest;
  digest: string;
  config: Image;
}
