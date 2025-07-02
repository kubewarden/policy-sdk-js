import { Manifest, Index, MediaTypeImageIndex, MediaTypeImageManifest } from "../oci-spec";
import { constants } from "../../../constants/constants";

export interface OciImageManifestResponse { 
    image?: Manifest;
    index?: Index;
}

export class OciImageManifestResponseImpl implements OciImageManifestResponse {
  image?: Manifest;
  index?: Index;

  constructor(data: Partial<OciImageManifestResponse> = {}) {
      this.image = data.image;
      this.index = data.index;
  }

  imageManifest(): Manifest | undefined {
      return this.image;
  }

  indexManifest(): Index | undefined {
    return this.index;
  }

  static fromJSON(json: string): OciImageManifestResponseImpl {
    try {
      const data = JSON.parse(json);
      // Check if data has image or index field
      if ('image' in data) {
        const imageManifest = data.image as Manifest;
        if (imageManifest.mediaType && isImageMediaType(imageManifest.mediaType)) {
          return new OciImageManifestResponseImpl({ image: imageManifest });
        }
      }
      if ('index' in data) {
        const indexManifest = data.index as Index;
        if (indexManifest.mediaType && isImageIndexMediaType(indexManifest.mediaType)) {
          return new OciImageManifestResponseImpl({ index: indexManifest });
        }
      }
      throw new Error('Cannot decode response');
    } catch (e) {
      throw new Error('Cannot decode response');
    }
  }
}

function isImageIndexMediaType(mediaType: string): boolean {
  return (
    mediaType === MediaTypeImageIndex ||
    mediaType === constants.ImageManifestListMediaType
  );
}

function isImageMediaType(mediaType: string): boolean {
  return (
    mediaType === MediaTypeImageManifest ||
    mediaType === constants.ImageManifestMediaType
  );
}

