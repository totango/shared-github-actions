# Shared GitHub Actions

Reusable GitHub Actions workflows and actions maintained by Totango, including shared CI policy checks.

## Require a Jira key in a pull-request title

`.github/workflows/require-jira-title.yml` is a reusable workflow that requires the pull-request title to contain an uppercase Jira-shaped key matching:

```regex
\b[A-Z][A-Z0-9]+-[0-9]+\b
```

For example, `UNI-123 Add workflow enrollment validation` passes. `uni-123 Add workflow enrollment validation` and `Add workflow enrollment validation` fail. The workflow validates only the PR title; branch names and PR bodies do not satisfy the policy.

Add a thin caller workflow in a consuming repository. Keep the workflow and job names below unchanged so the required status-check context remains stable:

```yaml
# .github/workflows/require-jira-title.yml
name: Jira title

on:
  pull_request:
    branches: [main]
    types: [opened, edited, reopened, synchronize]

permissions:
  contents: read

jobs:
  jira-title:
    uses: totango/shared-github-actions/.github/workflows/require-jira-title.yml@main
```

GitHub is expected to report this status-check context for that caller:

```text
Jira title / Require Jira issue key in PR title
```

`@main` intentionally makes centrally maintained policy updates available to all callers. Because an incorrect central change can block merges, review and validate changes to this workflow before merging them to `main`.

After the caller has reported on at least one pull request, inspect GitHub for the exact status-check context it emitted and configure that observed context on the protected default branch. Do not blindly trust the anticipated context above or configure it first: GitHub must have observed the check. Preserve all existing required checks, approval rules, and bypass settings when updating protection.

### Validation examples

| PR title | Result |
| --- | --- |
| `UNI-123 Add feature` | Pass |
| `[AI-42] Fix query` | Pass |
| `ABC123-9 Update connector` | Pass |
| `uni-123 Add feature` | Fail |
| `Add feature` | Fail |
| `Release 123-456` | Fail |

Editing a title triggers the caller's `edited` event, allowing a corrected title to clear the same PR check without a code push. The `synchronize` event ensures the check is also reported on new commit SHAs.
