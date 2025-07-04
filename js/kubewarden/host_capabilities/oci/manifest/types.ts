import { constants } from '../../../constants/constants';
import type { Manifest, Index } from '../oci-spec';
import { MediaTypeImageIndex, MediaTypeImageManifest } from '../oci-spec';

type OciManifest = ImageManifest | IndexManifest;

interface ImageManifest {
  kind: 'image';
  image: Manifest;
}

interface IndexManifest {
  kind: 'index';
  index: Index;
}

export class OciImageManifestResponse {
  private readonly manifest: OciManifest;

  constructor(manifest: OciManifest) {
    this.manifest = manifest;
  }

  static fromJSON(json: string): OciImageManifestResponse {
    try {
      const data = JSON.parse(json);
      // Check if data has image or index field
      if ('image' in data) {
        const imageManifest = data.image as Manifest;
        if (imageManifest.mediaType && isImageMediaType(imageManifest.mediaType)) {
          return new OciImageManifestResponse({ kind: 'image', image: imageManifest });
        }
      }
      if ('index' in data) {
        const indexManifest = data.index as Index;
        if (indexManifest.mediaType && isImageIndexMediaType(indexManifest.mediaType)) {
          return new OciImageManifestResponse({ kind: 'index', index: indexManifest });
        }
      }
      throw new Error('Cannot decode response');
    } catch {
      throw new Error('Cannot decode response');
    }
  }

  imageManifest(): Manifest | undefined {
    return this.manifest.kind === 'image' ? this.manifest.image : undefined;
  }

  indexManifest(): Index | undefined {
    return this.manifest.kind === 'index' ? this.manifest.index : undefined;
  }
}

function isImageIndexMediaType(mediaType: string): boolean {
  return mediaType === MediaTypeImageIndex || mediaType === constants.ImageManifestListMediaType;
}

function isImageMediaType(mediaType: string): boolean {
  return mediaType === MediaTypeImageManifest || mediaType === constants.ImageManifestMediaType;
}
