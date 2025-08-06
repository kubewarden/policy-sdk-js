export interface ListResourcesByNamespaceRequest {
  api_version: string;
  kind: string;
  namespace: string;
  label_selector?: string | null;
  field_selector?: string | null;
}

export interface ListAllResourcesRequest {
  api_version: string;
  kind: string;
  label_selector?: string | null;
  field_selector?: string | null;
}

export interface GetResourceRequest {
  api_version: string;
  kind: string;
  name: string;
  namespace?: string | null;
  disable_cache: boolean;
}

export interface CanIRequest {
  subject_access_review: SubjectAccessReview;
  disable_cache: boolean;
}

export interface SubjectAccessReview {
  groups?: string[];
  resource_attributes: ResourceAttributes;
  user: string;
}

export interface ResourceAttributes {
  group?: string;
  name?: string;
  namespace?: string;
  resource: string;
  subresource?: string;
  verb: string;
  version?: string;
}

export interface SubjectAccessReviewStatus {
  allowed: boolean;
  denied?: boolean;
  reason?: string;
  evaluationError?: string;
}
