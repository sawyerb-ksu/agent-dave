---
name: doc-sync
description: Pull the latest main or master branch of every git repo
  in a projects folder, find the repos that changed in the past week,
  and update the matching docs. Use when the user asks to sync,
  refresh or update their docs from recent repo changes.
---
# Doc sync

Backup for slide 22 ("DAVE writes his own skill"). If DAVE's live attempt
goes sideways, copy this folder to .pi/skills/ and start a new session.

1. Ask for the projects folder and the docs folder if the user
   hasn't given them. Defaults: ~/Projects and ~/docs.
2. List the git repos in the projects folder. In each one, check
   out main (or master if there's no main) and pull. Note any repo
   that fails and keep going.
3. Keep the repos with commits in the past 7 days:
   `git log --since="7 days ago" --oneline`
4. For each of those, read the commits and the changed files, then
   find its page in the docs folder (match by repo name).
5. Update only what the changes affect: new features, changed
   commands, removed options. Keep the page's existing layout.
6. Report back: which repos changed, which doc pages you edited and
   why, and anything you skipped.

## Rules
- Never commit or push in the code repos. Only pull.
- If a repo has uncommitted changes, skip the pull for it and say so.
- If a repo has no doc page, list it at the end instead of creating one.
