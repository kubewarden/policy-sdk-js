#!/usr/bin/env bats

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
