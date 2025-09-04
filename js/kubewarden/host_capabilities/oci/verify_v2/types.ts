export interface KeylessInfo {
  issuer: string;
  subject: string;
}

export interface KeylessPrefixInfo {
  issuer: string;
  url_prefix: string;
}

export interface VerificationResponse {
  is_trusted: boolean;
  digest: string;
}

// Request types for different verification methods

export interface SigstorePubKeyVerifyRequest {
  type: 'SigstorePubKeyVerify';
  image: string;
  pub_keys: string[];
  annotations?: { [key: string]: string };
}

export interface SigstoreKeylessVerifyRequest {
  type: 'SigstoreKeylessVerify';
  image: string;
  keyless: KeylessInfo[];
  annotations?: { [key: string]: string };
}

export interface SigstoreKeylessPrefixVerifyRequest {
  type: 'SigstoreKeylessPrefixVerify';
  image: string;
  keyless_prefix: KeylessPrefixInfo[];
  annotations?: { [key: string]: string };
}

export interface SigstoreGithubActionsVerifyRequest {
  type: 'SigstoreGithubActionsVerify';
  image: string;
  owner: string;
  repo?: string;
  annotations?: { [key: string]: string };
}
