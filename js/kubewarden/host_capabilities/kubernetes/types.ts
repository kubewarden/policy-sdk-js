import type { ListMeta } from 'kubernetes-types/meta/v1';

export interface ListResourcesByNamespaceRequest {
  api_version: string;
  kind: string;
  namespace: string;
  label_selector?: string | null;
  field_selector?: string | null;
  /**
   * A list of fields to include in the response.
   *
   * If strictly defined, the host will prune the Kubernetes resource to contain *only*
   * the specified fields, reducing memory usage and serialization overhead.
   *
   * # Behavior
   * - **Dot Notation:** Use `.` to traverse nested objects (e.g., `metadata.name`).
   * - **Implicit Arrays:** Paths automatically traverse through arrays. A path like
   *   `spec.containers.image` will include the `image` field for *every* item in the
   *   `spec.containers` list.
   * - **Allow-List:** Fields not specified in the mask are discarded. If the list is
   *   empty or `null`, the full resource is returned.
   *
   * # Example
   * ```typescript
   * [
   *   "metadata.name",
   *   "metadata.namespace",
   *   "spec.containers.image"
   * ]
   * ```
   */
  field_masks?: string[] | null;
}

export interface ListAllResourcesRequest {
  api_version: string;
  kind: string;
  label_selector?: string | null;
  field_selector?: string | null;
  /**
   * A list of fields to include in the response.
   *
   * If strictly defined, the host will prune the Kubernetes resource to contain *only*
   * the specified fields, reducing memory usage and serialization overhead.
   *
   * # Behavior
   * - **Dot Notation:** Use `.` to traverse nested objects (e.g., `metadata.name`).
   * - **Implicit Arrays:** Paths automatically traverse through arrays. A path like
   *   `spec.containers.image` will include the `image` field for *every* item in the
   *   `spec.containers` list.
   * - **Allow-List:** Fields not specified in the mask are discarded. If the list is
   *   empty or `null`, the full resource is returned.
   *
   * # Example
   * ```typescript
   * [
   *   "metadata.name",
   *   "metadata.namespace",
   *   "spec.containers.image"
   * ]
   * ```
   */
  field_masks?: string[] | null;
}

export interface GetResourceRequest {
  api_version: string;
  kind: string;
  name: string;
  namespace?: string | null;
  disable_cache: boolean;
  /**
   * A list of fields to include in the response.
   *
   * If strictly defined, the host will prune the Kubernetes resource to contain *only*
   * the specified fields, reducing memory usage and serialization overhead.
   *
   * # Behavior
   * - **Dot Notation:** Use `.` to traverse nested objects (e.g., `metadata.name`).
   * - **Implicit Arrays:** Paths automatically traverse through arrays. A path like
   *   `spec.containers.image` will include the `image` field for *every* item in the
   *   `spec.containers` list.
   * - **Allow-List:** Fields not specified in the mask are discarded. If the list is
   *   empty or `null`, the full resource is returned.
   *
   * # Example
   * ```typescript
   * [
   *   "metadata.name",
   *   "metadata.namespace",
   *   "spec.containers.image"
   * ]
   * ```
   */
  field_masks?: string[] | null;
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

export interface List<T> {
  apiVersion?: string;
  kind?: string;
  items: Array<T>;
  metadata?: ListMeta;
}
