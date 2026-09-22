---
name: commit
description: Propose and create conventional commit messages for staged changes. Follows Conventional Commits spec.
argument-hint: "[optional: ticket/issue number e.g. PROJ-123 or short description]"
model: haiku
allowed-tools:
  - Bash(git diff:*)
  - Bash(git diff --cached:*)
  - Bash(git log:*)
  - Bash(git branch:*)
  - Bash(git status:*)
  - Bash(git add:*)
  - Bash(git commit:*)
---

# Create a commit
Produce a clean, conventional commit message for staged changes and commit them.

## Important
- Do not push to remote.
- Create multiple commits one at a time in order.
- **Never stage**: `.env`, `*.key`, `*.pem`, `*secret*`, `*credential*`, `*.p12`, `*.jks`, `*.keystore`.
- **Never stage build artifacts**: `build/`, `.dart_tool/`, `ios/Pods/`,
  `android/.gradle/`, `android/app/build/`, `web/build/`, `.flutter-plugins`,
  `.flutter-plugins-dependencies`.
- **Infer commit type**: Look for the newest plan file in `docs/plan/` (each starts with a `**Type:**` line)
  and use that type. If no plan is found, infer from the diff.

## When to use
Use this skill when:
- The user asks to commit staged changes.
- The user asks to "create a commit", "commit this", or similar.
- Work on a task is complete and there are staged changes ready to be committed.

## Context
<context>$ARGUMENTS</context>
This may include a ticket number (e.g. `PROJ-123`), a short description, or be empty.

## Step 1: Gather context
Run these commands in parallel:
````bash
git diff --cached --stat
git status --short
git log main..HEAD --oneline
git branch --show-current
````

Use `--stat` to see the full list of changed file paths — this is sufficient to plan
commit groupings. File paths alone determine which commit a file belongs to.

If you need to write an accurate commit body for a group, run a **targeted diff** on one
or two representative files from that group only — do not pull the full diff upfront:
````bash
git diff --cached -- <representative-file>
````

### If multiple commits are planned
When proposing multiple commits, **never commit everything that is staged at once**.
Before making each commit, selectively stage only the files for that commit using
`git add <specific-files>`. Files not yet needed must remain unstaged until their turn.

**If ALL changes are already staged** and multiple commits are planned:
1. Run `git reset HEAD` to unstage everything. This keeps the working tree intact; it only clears the index so groups can be re-staged one at a time.
2. Then stage and commit selectively, one group at a time

### If there are no staged changes
Check `git status --short` for unstaged modifications, deletions, and untracked files.

**If there are unstaged or untracked changes**, use **AskUserQuestion** to present them grouped by
type (modified, deleted, untracked) and ask which to stage:
- **All** — stage everything (`git add -A`)
- **Select** — list each file and ask individually (use AskUserQuestion for each)
- **Cancel** — stop

Stage the confirmed files, then continue to Step 2.

**If there are no changes at all**, inform the user and stop.

## Step 2: Propose commit message(s)
Follow Conventional Commits. Consult `references/conventional-commits.md` for the full spec.

Extract the ticket number from the branch name (e.g. `feat/PROJ-59-...` → `PROJ-59`)
or from the argument passed to the skill.

### Scope guidance for Flutter cross-platform projects
Use the most specific scope that describes what changed. Derive the scope from the
actual directory structure of the diff — do not assume any particular project layout.

For changes confined to a Flutter platform directory, use the platform as scope:

| Scope | Use when changes are in… |
|---|---|
| `android` | `android/` platform-specific only |
| `ios` | `ios/` platform-specific only |
| `web` | `web/` platform-specific only |
| `macos` | `macos/` platform-specific only |
| `linux` | `linux/` platform-specific only |
| `windows` | `windows/` platform-specific only |
| `pubspec` | Dependency changes only |
| `l10n` | Localisation/ARB files |
| `ci` | CI/CD config (GitHub Actions, Fastlane, etc.) |
| `test` | Test files only |

For all other changes, infer the scope from the most relevant directory or module name
in the diff path. If changes span multiple unrelated areas, omit the scope rather than
inventing a vague one.

If changes span multiple platforms **for the same feature** (e.g. permission setup across
`android/` and `ios/` for a single new capability), treat it as one cohesive commit — do not
split by platform.

### When to use multiple commits
Default to a **single commit**. Propose multiple commits only when changes are clearly
independent — i.e., each could be reverted without affecting the other:
- **Logically independent concerns** — e.g. a new feature + an unrelated bug fix
- **Mixed types with no shared context** — e.g. a `feat` and an unrelated `chore`

Do not split just because multiple files, packages, or platform directories are touched —
cohesive cross-platform changes belong in one commit.

Output the proposed commit(s):
````markdown
## Proposed commit(s)

### Commit 1
```
type(scope): subject line

Optional body explaining the why.

Refs: TICKET-000
```

### Commit 2 (if applicable)
```
type(scope): subject line
```
````

## Step 3: Confirm and commit
Use the **AskUserQuestion** tool to ask:

**Question:** "Do you want me to create this commit?"
**Options:**
1. **Yes** — create the commit(s)
2. **No** — stop
3. **Edit** — ask what to change, show revised message, ask again

Create each commit with HEREDOC to preserve formatting:
````bash
git commit -m "$(cat <<'EOF'
type(scope): subject line

Optional body.

Refs: TICKET-000
EOF
)"
````

After each commit, show `git log --oneline -1`.
