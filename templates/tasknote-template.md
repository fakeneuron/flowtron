---
title: Task Title
status: not-started
priority: Medium
area: core
model: opus
tags: []
created: YYYY-MM-DD
due:
related-tasks: []
---

# TASK-ID | Task Title

**Goal:** One-sentence goal of what this task accomplishes.

## Phase 1: Discovery

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment**

  **Verdict:** Proceed | Re-scope | De-scope
  **Rationale:**

- [ ] Read relevant source files
- [ ] **Drift check** — file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code; flag any drift before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Defined concrete execution steps below

**Discovery Notes:**

**Execution Steps:**

1.
2.

## Phase 2: Execution

- [ ] **Pattern survey** — looked at neighboring code for an existing pattern to extend; justified the new shape if none fits
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior
- [ ] Ran targeted tests on changed files

**Implementation Notes:**

## Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] (frontend) Asked the user for visual confirmation
- [ ] Fixed all introduced issues

**Testing Notes:**

## Phase 4: Closure

- [ ] Verified all prior phases complete
- [ ] Updated docs/inventories affected by the change
- [ ] Updated PLAN.md (status flipped to `Completed YYYY-MM-DD`)
- [ ] Moved this tasknote to `_project/tasknote/archive/<area>/`
- [ ] Recapped changes with the user and got confirmation

**Final Summary:**

**Archived:** YYYY-MM-DD
