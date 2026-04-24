---
name: create-mr
description: Create a GitLab merge request targeting Development, Staging, Ext-demo, Prod_productiontest, or Prod_live
user-invocable: true
argument-hint: GitLab project URL (required) | Target branch
allowed-tools: Bash(git *)
---

Not typically applicable inside the sandbox - use for task-list-fe MRs.

Parse $ARGUMENTS: `[gitlabUrl]` (required), `[target]` branch.

`git push origin HEAD -o merge_request.create -o merge_request.target=[target] -o merge_request.title="..." -o merge_request.remove_source_branch`
