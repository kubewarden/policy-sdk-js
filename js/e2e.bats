#!/usr/bin/env bats

@test "should return valid manifest and config for busybox:1.36" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-and-config-success"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-and-config-lookup-success.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
  [ $(expr "$output" : '.*"manifest":".*application/vnd.oci.image.manifest.v1+json.*') -ne 0 ]
  [ $(expr "$output" : '.*"manifest":"{.*application/vnd.oci.image.config.v1+json.*}') -ne 0 ]
  [ $(expr "$output" : '.*"digest":"sha256:abc123"') -ne 0 ]
}

@test "should fail for nonexistent image manifest and config" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-and-config-failure"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-and-config-lookup-failure.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [[ "$output" =~ "image not found" ]]
}

@test "should return valid manifest for busybox:1.36" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-success"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-lookup-success.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
  [ $(expr "$output" : '.*"manifest":".*application/vnd.oci.image.manifest.v1+json.*') -ne 0 ]
}

@test "should fail for nonexistent image manifest" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-failure"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-lookup-failure.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [[ "$output" =~ "wrong invocation" ]]
}

@test "should return valid digest for busybox:1.36" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-success"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-digest-lookup-success.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
  [ $(expr "$output" : '.*"digest":"sha256:7edf5efe6b86dbf01ccc3c76b32a37a8e23b84e6bad81ce8ae8c221fa456fda8".*') -ne 0 ]
}

@test "should fail digest lookup for nonexistent image" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-failure"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-digest-lookup-failure.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [[ "$output" =~ "wrong invocation" ]]
}

@test "should return IPs for google.com" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "dns-lookup-success"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/dns-lookup-success.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
  [ $(expr "$output" : '.*"ips":".*\..*".*') -ne 0 ]
}

@test "should fail for invalid domain" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "dns-lookup-failure"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/dns-lookup-failure.yml
  echo "output = ${output}"
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [[ "$output" =~ "wrong invocation" ]]
}

@test "reject creation of privileged pods everywhere when no ignoredNamespaces setting is provided" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/privileged-pod-default.json

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]

  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/privileged-pod-kube-system.json

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]

}

@test "accepted because privileged pods are allowed in kube-system" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/privileged-pod-kube-system.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]

  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/privileged-pod-default.json --settings-json '{"ignoredNamespaces": ["kube-system"]}'

  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request rejected
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
  [ $(expr "$output" : '.*privileged containers are not allowed.*') -ne 0 ]
}

@test "accept non-privileged pods" {
  run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json
  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request accepted
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
}