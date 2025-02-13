
This policy validates the creation and update events of Pods. It 
rejects a Pod if any of its containers are running in privileged mode.

The policy can be configured to accept privileged Pods if they are scheduled
inside one of the `ignoredNamespaces` provided by the user.

This policy makes use of Kubewarden's host capabilities. More specifically,
it uses the [DNS lookup capability](https://docs.kubewarden.io/reference/spec/host-capabilities/net#dns-host-lookup)
to obtain the IP addresses of the `google.com` domain.
The IPs are then added as `auditAnnotations.ips` inside the admission response
object.
This is done to test the host capabilities of the TypeScrypt SDK, it has no
practical meaning.

## Configuration

The policy has the following configuration:

```yaml
# optional
ignoredNamespaces:
  - kube-system
```

When `ignoredNamespaces` is empty, the policy will prevent the creation of
all privilged pods. Regardless of their namespace.