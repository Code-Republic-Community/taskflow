#!/usr/bin/env bash
# One-time GitHub configuration for TaskFlow. Run by a repository admin, after the first push of main.
#
#   Usage: scripts/setup-github.sh [owner/repo]
#          (defaults to the repository of the current directory, as seen by gh)
#
# Requires: gh (https://cli.github.com) logged in with admin rights on the repo (gh auth login).
# Note: rulesets on private repositories need GitHub Pro, Team or Enterprise; public repos are fine.
# Safe to re-run: settings are overwritten and the ruleset is updated in place.

set -euo pipefail

RULESET_NAME="main"
REQUIRED_CHECKS=(server client branch-name pr-title)
GITHUB_ACTIONS_APP_ID=15368 # checks must come from GitHub Actions, not any other app

command -v gh >/dev/null || { echo "gh is not installed: https://cli.github.com" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first." >&2; exit 1; }

REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
echo "Configuring $REPO"

# 1. Merge settings: squash only, PR title as commit title, delete branches after merge.
gh api --method PATCH "repos/$REPO" --silent \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY \
  -F delete_branch_on_merge=true
echo "  ✓ merge: squash only (commit title = PR title, message = PR body)"
echo "  ✓ head branches are deleted after merge"

# 2. Ruleset on main.
checks_json=""
for check in "${REQUIRED_CHECKS[@]}"; do
  checks_json+="{\"context\":\"$check\",\"integration_id\":$GITHUB_ACTIONS_APP_ID},"
done
checks_json="[${checks_json%,}]"

ruleset=$(cat <<JSON
{
  "name": "$RULESET_NAME",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": $checks_json
      }
    },
    { "type": "required_linear_history" },
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ]
}
JSON
)

existing_id=$(gh api "repos/$REPO/rulesets" --jq ".[] | select(.name == \"$RULESET_NAME\") | .id" | head -n1)
if [[ -n "$existing_id" ]]; then
  echo "$ruleset" | gh api --method PUT "repos/$REPO/rulesets/$existing_id" --input - --silent
  echo "  ✓ ruleset \"$RULESET_NAME\" updated (id $existing_id)"
else
  existing_id=$(echo "$ruleset" | gh api --method POST "repos/$REPO/rulesets" --input - --jq .id)
  echo "  ✓ ruleset \"$RULESET_NAME\" created (id $existing_id)"
fi
echo "    - main requires a pull request with 1 approval; stale approvals are dismissed on new pushes"
echo "    - required status checks: ${REQUIRED_CHECKS[*]}"
echo "    - linear history required; force pushes and deletion of main are blocked"

echo
echo "Done. Review: https://github.com/$REPO/settings/rules/$existing_id"
