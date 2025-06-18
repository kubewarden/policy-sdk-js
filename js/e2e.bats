#!/usr/bin/env bats

@test "should return valid digest for busybox:1.36" {
    run kwctl run --allow-context-aware --replay-host-capabilities-interactions replay-session.yml annotated-policy.wasm -r ./test_data/no_privileged_containers.json
    echo "output = ${output}"
    [ "$status" -eq 0 ]
    [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
    [ $(expr "$output" : '.*"digest":"sha256:7edf5efe6b86dbf01ccc3c76b32a37a8e23b84e6bad81ce8ae8c221fa456fda8".*') -ne 0 ]
}

@test "reject creation of privileged pods everywhere when no setting is provided" {
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

@test "accepted because privileged pods are allowed in kube-system" {
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

@test "accept non-privileged pods" {
  run kwctl run annotated-policy.wasm -r ./test_data/no_privileged_containers.json
  # this prints the output when one the checks below fails
  echo "output = ${output}"

  # request accepted
  [ "$status" -eq 0 ]
  [ $(expr "$output" : '.*allowed.*true') -ne 0 ]
}
