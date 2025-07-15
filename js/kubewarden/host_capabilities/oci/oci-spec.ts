interface Descriptor {
  mediaType: string;
  digest: string;
  size: number;
  urls?: string[];
  annotations?: Record<string, string>;
  data?: string;
  platform?: Platform;
  artifactType?: string;
}

interface Platform {
  architecture: string;
  os: string;
  osVersion?: string;
  osFeatures?: string[];
  variant?: string;
}

interface ImageConfig {
  user?: string;
  exposedPorts?: Record<string, object>;
  env?: string[];
  entrypoint?: string[];
  cmd?: string[];
  volumes?: Record<string, object>;
  workingDir?: string;
  labels?: Record<string, string>;
  stopSignal?: string;
  argsEscaped?: boolean;
}

interface RootFS {
  type: string;
  diffIds: string[];
}

interface History {
  created?: string;
  createdBy?: string;
  author?: string;
  comment?: string;
  emptyLayer?: boolean;
}

export interface Manifest {
  schemaVersion: number;
  mediaType?: string;
  artifactType?: string;
  config: Descriptor;
  layers: Descriptor[];
  subject?: Descriptor;
  annotations?: Record<string, string>;
}

export interface Index {
  schemaVersion: number;
  mediaType?: string;
  artifactType?: string;
  manifests: Descriptor[];
  subject?: Descriptor;
  annotations?: Record<string, string>;
}

export interface ImageConfiguration {
  created?: string;
  author?: string;
  architecture: string;
  os: string;
  osVersion?: string;
  osFeatures?: string[];
  variant?: string;
  config?: ImageConfig;
  rootfs: RootFS;
  history?: History[];
}

export const MediaTypeImageIndex = 'application/vnd.oci.image.index.v1+json';
export const MediaTypeImageManifest = 'application/vnd.oci.image.manifest.v1+json';
export const MediaTypeImageConfig = 'application/vnd.oci.image.config.v1+json';
export const MediaTypeDescriptor = 'application/vnd.oci.descriptor.v1+json';
export const MediaTypeImageLayer = 'application/vnd.oci.image.layer.v1.tar+gzip';
