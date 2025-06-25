This is a sample Kubewarden policy written in TypeScript that demonstrates the capabilities of the TypeScript SDK.

> **Warning:** The SDK and demo policy are experimental and under active development.

## Introduction

This policy validates Kubernetes Pod admission requests and demonstrates several key features:

- **Privileged Container Validation**: Rejects pods with privileged containers unless they're in an ignored namespace  
- **Host Capabilities Integration**: Shows how to use Kubewarden's host capabilities. More specifically it uses the [OCI manifest digest capability](https://docs.kubewarden.io/reference/spec/host-capabilities/container-registry#get-oci-manifest-digest)  and the [DNS lookup capability](https://docs.kubewarden.io/reference/spec/host-capabilities/net#dns-host-lookup)
- **Configurable Settings**: Supports runtime configuration through policy settings

## Configuration

The policy has the following configuration:

```json
{
  "ignoredNamespaces": ["kube-system", "kube-public"],
  "testScenario": "dns-lookup-success"
}
```

## Usage

Run the policy with `kwctl`:

```console
kwctl run ../js/annotated-policy.wasm -r test_data/no_privileged_containers.json
```

With settings:
```console
kwctl run ../js/annotated-policy.wasm -r test_data/privileged-pod-kube-system.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'
```
