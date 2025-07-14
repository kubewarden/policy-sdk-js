[![Sandbox](https://img.shields.io/badge/status-sandbox-red?style=for-the-badge)](https://github.com/kubewarden/community/blob/main/REPOSITORIES.md#sandbox)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache2.0-brightgreen.svg)](https://opensource.org/licenses/Apache-2.0)

# Kubewarden TypeScript Policy SDK

> **Warning:** The SDK and demo policy are experimental and under active development.

This repository contains the TypeScript SDK for writing Kubewarden policies, along with a demo policy that demonstrates its usage.

The policy is written using TypeScript, which is then transpiled to JavaScript,
which is finally compiled to WebAssembly.

The Javascript to WebAssembly compilation is done using the
[Javy](https://github.com/bytecodealliance/javy) project from the
Bytecode Alliance.

The Kubewarden policy is built targeting the Kubewarden
[WASI](https://docs.kubewarden.io/tutorials/writing-policies/wasi/intro-wasi)
policy type.

The policy demonstrates that it's possible to perform validation and make use of
[Kubewarden's host capabilities](https://docs.kubewarden.io/reference/spec/host-capabilities/intro-host-capabilities)
during policy evaluation.

## Project Structure
The project is organized into the following components:

- **`js/`**: The core TypeScript SDK.
- **`demo-policy/`**: A sample policy demonstrating the SDKs capabilities.
- **`javy-plugin-kubewarden/`**: Custom Javy plugin for JavaScript to WebAssembly compilation

## Requirements

The policy requires the following tools to be installed on the host machine:

- **Rust**: The Rust compiler is required to build the Kubewarden Javy plugin.
  The `wasm32-wasip1` target must be added. It's recommended to use
  [rustup](https://www.rust-lang.org/tools/install).
- **TypeScript Compiler (`tsc`)**: Required to compile the TypeScript files into
  JavaScript.
- **npm**: Required to install the project dependencies.
- **[Javy](https://github.com/bytecodealliance/javy/releases)**: The compiler
  that transforms the JavaScript code into a WebAssembly module.
- `clang`: required to build the quickjs related Rust crates.
- **[kwctl](https://github.com/kubewarden/kwctl/)**: Required to run the
  final policy.
- **[`bats`](https://github.com/bats-core/bats-core)**: Required to run
  the end-to-end tests. Install bats locally using the [official installation instructions](https://bats-core.readthedocs.io/en/stable/installation.html) 
- **[`jest`](https://jestjs.io/docs/getting-started)**: Required to run unit tests.

## Building

While inside the `js` directory, run the following command:

```console
make annotated-policy.wasm
```

This will produce a Kubewarden policy that can then be run with:

```console
kwctl run annotated-policy.wasm -r demo_policy/test_data/no_privileged_containers.json
```

The end to end tests can be run with:

```console
make e2e-tests
```
