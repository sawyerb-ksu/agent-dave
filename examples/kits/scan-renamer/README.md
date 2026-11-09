# Example: rename scanned files, with an approval step

A repeatable file task with a safety habit built in: DAVE shows his plan, waits for your yes, and keeps a record so every rename can be undone. All scans are fictional; each is labeled "SAMPLE - FAKE DATA".

| Folder | What's in it |
|---|---|
| `starter/` | The skill with three blanks for you to fill in, plus the scans and the scanning log |
| `finished/` | The completed skill, the same scans, and `rename-log.example.md`, the result to expect |

## Try it

1. In VS Code, open `starter/.agents/skills/scan-renamer/SKILL.md` and fill in the three blanks:
   - **Use when:** the words people say when they want this, like *rename, clean up, organize or fix the names of scans, photos or PDFs*.
   - **Pattern:** `DATE_collection_title.ext`
   - **Record:** `rename-log.md`

   Stuck? Compare with `finished/`, or work through [skill-designer.md](../../../docs/skill-designer.md), whose worked example is this skill.
2. Start pi inside the starter folder:
   ```bash
   cd examples/kits/scan-renamer/starter
   pi --model aistudio/qwen3.8:27b-q8_0
   ```
3. Ask: **"Rename the scans using the scanning log."** If DAVE doesn't pick up the skill, run `/skill:scan-renamer`.
4. Check the plan table, then say yes.

## Check the result

Compare DAVE's `rename-log.md` with `finished/rename-log.example.md`:

- **8 renamed**, such as `IMG_0042.png` → `1952-06-14_campus-history_commencement-program-cover.png`.
- **1 skipped:** `untitled.png` isn't in the scanning log, so it's left alone.
- **1 missing:** the log lists `IMG_0045.png`, but it isn't in the folder.
- Dates keep their precision: `June 1953` becomes `1953-06`, a blank date becomes `undated`.
- Two files would get the same name, so the second one ends in `-2`.
- Nothing is renamed until you say yes, and nothing is deleted.

## Start over

The skill renames files in place, so reset the kit before another run:

```bash
python3 examples/kits/scan-renamer/make_sample_scans.py
```

It rebuilds the scans and the log in both folders, and needs Pillow (`pip install pillow`).

## Make it yours

Change the naming pattern, or add a rule: skip files older than a certain year, or put each collection in its own folder. What would you need for your department's photos, recordings or forms?
