#!/usr/bin/env bats

@test "kubernetes can i - should allow pod creation in default namespace" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "can-i-success"}' --replay-host-capabilities-interactions ./test_data/sessions/can-i-success.yml --allow-context-aware
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [[ "$output" =~ '"allowed":true' ]]
}

@test "kubernetes can i - should deny node deletion" {
    run kwctl run annotated-policy.wasm \
        -r ./test_data/no_privileged_containers.json \
        --settings-json '{"testScenario": "can-i-failure"}' \
        --replay-host-capabilities-interactions ./test_data/sessions/can-i-failure.yml \
        --allow-context-aware
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [[ "$output" =~ '"allowed":false' ]]
}

@test "kubernetes list resources all - should return pods when listing all resources with label selector" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "list-all-resources-success"}' --replay-host-capabilities-interactions ./test_data/sessions/list-all-resources-success.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":true' ]]
  [[ "$output" =~ '"podCount":"2"' ]]
  [[ "$output" =~ 'PodList' ]]
}

@test "kubernetes list resources all - should fail when listing invalid resources" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "list-all-resources-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/list-all-resources-failure.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":false' ]]
  [[ "$output" =~ "the server doesn't have a resource type" ]] 
}

@test "kubernetes list resources by namespace - should return configmaps when listing resources by namespace" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "list-resources-by-namespace-success"}' --replay-host-capabilities-interactions ./test_data/sessions/list-resources-by-namespace-success.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":true' ]]
  [[ "$output" =~ '"configMapCount":"1"' ]]
  [[ "$output" =~ 'ConfigMapList' ]]
}

@test "kubernetes list resources by namespace - should fail when listing resources from nonexistent namespace" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "list-resources-by-namespace-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/list-resources-by-namespace-failure.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":false' ]]
  [[ "$output" =~ "namespace 'nonexistent-namespace' not found" ]]
}

@test "kubernetes get resource - allow when namespace has demo-namespace label" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "get-resource-success"}' --replay-host-capabilities-interactions ./test_data/sessions/namespace-found.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":true' ]]
}

@test "kubernetes get resource - deny when namespace is not labeled properly" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "get-resource-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/namespace-not-found.yml --allow-context-aware
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [[ "$output" =~ '"allowed":false' ]]
  [[ "$output" =~ "wrong invocation" ]]
}

@test "oci manifest and config - should return valid manifest and config for busybox:1.36" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-and-config-success"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-and-config-lookup-success.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
  [ $(expr "$output" : '.*"manifest":".*application/vnd.oci.image.manifest.v1+json.*') -ne 0 ]
  [ $(expr "$output" : '.*"manifest":"{.*application/vnd.oci.image.config.v1+json.*}') -ne 0 ]
  [ $(expr "$output" : '.*"digest":"sha256:abc123"') -ne 0 ]
}

@test "oci manifest and config - should fail for nonexistent image manifest and config" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-and-config-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-and-config-lookup-failure.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [[ "$output" =~ "image not found" ]]
}

@test "oci manifest - should return valid manifest for busybox:1.36" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-success"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-lookup-success.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [ $(expr "$output" : '.*"manifest":".*application/vnd.oci.image.manifest.v1+json.*') -ne 0 ]
}

@test "oci manifest - should fail for nonexistent image manifest" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-lookup-failure.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
    [[ "$output" =~ "wrong invocation" ]]
}

@test "oci manifest digest - should return valid digest for busybox:1.36" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-success"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-digest-lookup-success.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [ $(expr "$output" : '.*"digest":"sha256:7edf5efe6b86dbf01ccc3c76b32a37a8e23b84e6bad81ce8ae8c221fa456fda8".*') -ne 0 ]
}

@test "oci manifest digest - should fail digest lookup for nonexistent image" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/oci-manifest-digest-lookup-failure.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
    [[ "$output" =~ "wrong invocation" ]]
}

@test "network dns lookup - should return IPs for google.com" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "dns-lookup-success"}' --replay-host-capabilities-interactions ./test_data/sessions/dns-lookup-success.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [ $(expr "$output" : '.*"ips":".*\..*".*') -ne 0 ]
}

@test "network dns lookup - should fail for invalid domain" {
    run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json --settings-json '{"testScenario": "dns-lookup-failure"}' --replay-host-capabilities-interactions ./test_data/sessions/dns-lookup-failure.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
    [[ "$output" =~ "wrong invocation" ]]
}

@test "kubernetes privileged pods - reject creation of privileged pods everywhere when no ignoredNamespaces setting is provided" {
  run kwctl run annotated-policy.wasm -r ./test_data/privileged-pod-default.json

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]

  run kwctl run annotated-policy.wasm -r ./test_data/privileged-pod-kube-system.json

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]

}

@test "kubernetes privileged pods - accepted because privileged pods are allowed in kube-system" {
  run kwctl run annotated-policy.wasm -r ./test_data/privileged-pod-kube-system.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]

  run kwctl run annotated-policy.wasm -r ./test_data/privileged-pod-default.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]
}

@test "kubernetes privileged pods - accept non-privileged pods" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json
  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request accepted
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
}