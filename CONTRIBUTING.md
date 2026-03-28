# Contributing

## Making a new release
1. Bump version in `js/package.json` to `"X.Y.Z"`.
2. Format if needed, commit and open PR (as `main` branch is protected).
3. Wait for PR to be merged.
4. Once the PR is in `main`, create an annotated signed tag on the merge commit
  of the PR in `main`:
  `git tag -s -a -m "vX.Y.Z" vX.Y.Z`. This will trigger the GH Action for
  release. Wait for it to complete and check that it is created.
5. If needed, edit the GH release description.

## Publishing to npm
When a tag is pushed, the following happens automatically:
- **CI tests** run to ensure code quality
- **E2E tests** validate functionality
- **npm package** is built and published to the registry with provenance
- **GitHub release** is published from the draft

## GitHub Actions
The release workflow publishes to npm using GitHub OIDC trusted publishing and
`npm publish --provenance`; no `NPM_TOKEN` is required for the upstream
repository release path.

If you have forked the repository and want to run publish workflows from your
fork, ensure your fork has workflow permissions set to "Read and write
permissions" at "Settings -> Actions -> General" and that npm trusted
publishing is configured for your fork/workflow.

Also, given how the release and release-drafter workflows work, they need git
tags present; push the tags from origin to your fork.

## Code conventions
Code formatting is handled by Prettier. Run `npm run format` in the `js/`
directory before committing changes.

## Plugin Location

During SDK development, the `Javy` plugin output get's built in `js/plugin/`.