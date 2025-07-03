This is a sample Kubewarden policy written in TypeScript that demonstrates the capabilities of the TypeScript SDK.

> **Warning:** The SDK and demo policy are experimental and under active development.

## Introduction

This policy validates Kubernetes Pod admission requests and demonstrates several key features:

- **Privileged Container Validation**: Rejects pods with privileged containers unless they're in an ignored namespace
- **Host Capabilities Integration**: Shows how to use Kubewarden's host capabilities. More specifically it uses the [OCI manifest digest capability](https://docs.kubewarden.io/reference/spec/host-capabilities/container-registry#get-oci-manifest-digest) and the [DNS lookup capability](https://docs.kubewarden.io/reference/spec/host-capabilities/net#dns-host-lookup)
- **Configurable Settings**: Supports runtime configuration through policy settings

## Configuration

The policy has the following configuration:

```yaml
ignoredNamespaces:
  - kube-system
  - kube-public

# The testScenario setting is used to trigger specific test cases within the policy:
# Possible values:
#   - oci-manifest-digest-success: simulate a successful OCI manifest digest lookup
#   - oci-manifest-digest-failure: simulate a failed OCI manifest digest lookup
#   - dns-lookup-success: simulate a successful DNS lookup
#   - dns-lookup-failure: simulate a failed DNS lookup
# Leaving testScenario empty or omitted will run the default privileged container validation.

testScenario: dns-lookup-success
```

## Usage

### Building and Running the Policy

While inside the `js` directory, build the policy WASM module by running:

```console
make annotated-policy.wasm
```

This will produce a Kubewarden policy that can then be run with:

```console
kwctl run annotated-policy.wasm -r demo_policy/test_data/no_privileged_containers.json
```

With settings:

```console
kwctl run annotated-policy.wasm -r demo_policy/test_data/privileged-pod-kube-system.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'
```
