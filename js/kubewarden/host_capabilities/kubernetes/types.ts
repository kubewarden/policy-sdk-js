/**
 * Request parameters for the get_resource function
 */
export interface GetResourceRequest {
  api_version: string;
  kind: string;
  name: string;
  namespace?: string | null;
  disable_cache: boolean;
}
