---
name: scan-renamer
description: Rename scanned files to clear, consistent names using the scanning log. Use when the user asks to rename, clean up, organize or fix the names of scans, scanned files, photos or PDFs.
---

# Rename scanned files

1. Read `scanning-log.csv`. Each row lists a file in the `scans/` folder with its date, collection and title.
2. List every file in the `scans/` folder.
3. Build a new name for each file with this pattern: `DATE_collection_title.ext`
   - DATE: a full date becomes YYYY-MM-DD, a month and year becomes YYYY-MM, a year stays YYYY, and a blank date becomes `undated`.
   - collection and title: lowercase, words joined with hyphens, no spaces or punctuation.
   - Keep the original file extension.
4. Show a table of the plan with these columns: Current name, New name, Status (Rename, Skip or Missing). Then stop and ask: "Rename these files?"
5. Only after the user says yes, rename the files.
6. Save a record to `rename-log.md`: a table of Old name and New name, so the renames can be undone.

## Rules

- Only rename. Never delete, overwrite or edit what's inside a file.
- Only touch files inside the `scans/` folder.
- If a file isn't in the log, leave it alone and mark it Skip.
- If the log lists a file that isn't in the folder, mark it Missing.
- Don't guess dates or titles. Use only what the log says.
- If two files would get the same name, add `-2`, `-3` and so on to the later ones.

When you're done, reply with one line: how many files were renamed, skipped and missing.
