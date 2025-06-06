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

const DescriptorEmptyJSON: Descriptor = {
    mediaType: 'application/vnd.oci.empty.v1+json',
    digest: 'sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
    size: 2,
    data: '{}',
};

interface ImageConfig {
    user?: string;
    exposedPorts?: Record<string, {}>;
    env?: string[];
    entrypoint?: string[];
    cmd?: string[];
    volumes?: Record<string, {}>;
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

export interface Config {
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