/**
 * This namespace contains the types representing the objects used by
 * Kubernetes Admission Webhooks.
 *
 * These types are not part of the openapi spec, hence they are not
 * automatically generated.
 */
export namespace KubernetesAdmission {
  export type ExtraValue = string[];

  /**
   * Represents an admission request in Kubernetes.
   *
   * @remarks
   * This class encapsulates the details of an admission request sent to the Kubernetes API server.
   *
   * @param uid - A unique identifier for the request.
   * @param kind - The kind of the resource being accessed.
   * @param resource - The resource being accessed.
   * @param subResource - The sub-resource being accessed, if any.
   * @param requestKind - The kind of the resource being requested, if different from the accessed resource.
   * @param requestResource - The resource being requested, if different from the accessed resource.
   * @param requestSubResource - The sub-resource being requested, if any.
   * @param name - The name of the resource being accessed.
   * @param namespace - The namespace of the resource being accessed.
   * @param operation - The operation being performed (e.g., CREATE, UPDATE, DELETE).
   * @param userInfo - Information about the user making the request.
   * @param object - The object being accessed or modified.
   * @param dryRun - Indicates if the request is a dry run.
   * @param options - Additional options for the request.
   */
  export class AdmissionRequest {
    uid: string;
    kind: GroupVersionKind;
    resource: GroupVersionResource;
    subResource?: string;
    requestKind?: GroupVersionKind;
    requestResource?: GroupVersionResource;
    requestSubResource?: string;
    name?: string;
    namespace?: string;
    operation: string;
    userInfo: UserInfo;
    object?: string;
    dryRun?: boolean;
    options?: any;

    constructor(
      uid: string,
      kind: GroupVersionKind,
      resource: GroupVersionResource,
      operation: string,
      userInfo: UserInfo,
      subResource?: string,
      requestKind?: GroupVersionKind,
      requestResource?: GroupVersionResource,
      requestSubResource?: string,
      name?: string,
      namespace?: string,
      object?: any,
      dryRun?: boolean,
      options?: any,
    ) {
      this.uid = uid;
      this.kind = kind;
      this.resource = resource;
      this.operation = operation;
      this.userInfo = userInfo;
      this.subResource = subResource;
      this.requestKind = requestKind;
      this.requestResource = requestResource;
      this.requestSubResource = requestSubResource;
      this.name = name;
      this.namespace = namespace;
      this.object = object;
      this.dryRun = dryRun;
      this.options = options;
    }
  }

  /**
   * Represents a Kubernetes GroupVersionKind (GVK).
   *
   * A GVK is a tuple that uniquely identifies the schema of an object in Kubernetes.
   *
   * @remarks
   * The GroupVersionKind is used to specify the API group, version, and kind of a Kubernetes resource.
   *
   * @example
   * ```typescript
   * const gvk = new GroupVersionKind("apps", "v1", "Deployment");
   * console.log(gvk.group); // "apps"
   * console.log(gvk.version); // "v1"
   * console.log(gvk.kind); // "Deployment"
   * ```
   *
   * @public
   */
  export class GroupVersionKind {
    group: string;
    version: string;
    kind: string;

    constructor(group: string, version: string, kind: string) {
      this.group = group;
      this.version = version;
      this.kind = kind;
    }
  }

  /**
   * Represents a Kubernetes GroupVersionResource (GVR).
   *
   * A GVR is a tuple that uniquely identifies a resource in the Kubernetes API.
   *
   * @example
   * ```typescript
   * const gvr = new GroupVersionResource('apps', 'v1', 'deployments');
   * console.log(gvr.group); // 'apps'
   * console.log(gvr.version); // 'v1'
   * console.log(gvr.resource); // 'deployments'
   * ```
   *
   * @public
   */
  export class GroupVersionResource {
    group: string;
    version: string;
    resource: string;

    constructor(group: string, version: string, resource: string) {
      this.group = group;
      this.version = version;
      this.resource = resource;
    }
  }

  /**
   * Represents the user information in an admission request.
   */
  export class UserInfo {
    /**
     * The username of the user.
     */
    username?: string;

    /**
     * The unique identifier of the user.
     */
    uid?: string;

    /**
     * The groups the user belongs to.
     */
    groups?: string[];

    /**
     * Additional information about the user.
     */
    extra?: { [key: string]: ExtraValue };

    /**
     * Creates an instance of UserInfo.
     *
     * @param username - The username of the user.
     * @param uid - The unique identifier of the user.
     * @param groups - The groups the user belongs to.
     * @param extra - Additional information about the user.
     */
    constructor(
      username?: string,
      uid?: string,
      groups?: string[],
      extra?: { [key: string]: ExtraValue },
    ) {
      this.username = username;
      this.uid = uid;
      this.groups = groups;
      this.extra = extra;
    }
  }
}
