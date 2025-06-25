#!/usr/bin/env bats

@test "should return valid digest for kubectl image" {
    local image="ghcr.io/kubewarden/kubectl:v1.31.0"
    local expected_digest=$(crane digest "$image")
    echo "Expected digest = $expected_digest"
    run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-success"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-digest-lookup-success.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [ $(expr "$output" : '.*"digest":"'$expected_digest'".*') -ne 0 ]
}

@test "should fail for nonexistent image" {
    run kwctl run annotated-policy.wasm -r ./demo_policy/test_data/no_privileged_containers.json --settings-json '{"testScenario": "oci-manifest-digest-failure"}' --replay-host-capabilities-interactions ./demo_policy/test_data/sessions/oci-manifest-digest-lookup-failure.yml
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*false') -ne 0 ]
    [ $(expr "$output" : '.*"digest":"".*') -ne 0 ]
    [[ "$output" =~ "OCI manifest digest lookup failed" ]]
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
    [ $(expr "$output" : '.*"ips":"".*') -ne 0 ]
    [[ "$output" =~ "DNS lookup failed" ]]
}

@test "reject creation of privileged pods everywhere when no setting is provided" {
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