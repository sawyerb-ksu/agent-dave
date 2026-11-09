# Example: check a spreadsheet without changing it

A repeatable checking task with explicit rules. All inventory data is fictional.
No external services or third-party packages are needed; the agent can use a
locally available CSV parser, such as Python's standard-library csv module.

## Try it

1. After reading the skill, start pi inside this folder: `cd examples/kits/spreadsheet-check`, then `pi --model aistudio/qwen3.8:27b-q8_0`.
2. Ask: **"Check this inventory spreadsheet for data-entry errors."**
3. If necessary, load it with `/skill:spreadsheet-check`.

## Check the result

Expect **8 issues across 6 of the 8 data rows**:

| Data row | Expected issue |
| --- | --- |
| 2 | Duplicate item_id; impossible February date |
| 3 | Missing location |
| 4 | Duplicate item_id |
| 5 | Wrong date format; negative quantity |
| 6 | Missing title |
| 7 | Fractional quantity |

The comma inside "Map, county roads" should not create an extra column.
Rows 1 and 8 are valid. Zero quantity is valid. The input must remain unchanged.

## Make it yours

Change a validation rule, then add a sample row that tests it.
What rules would matter for an equipment list, bibliography or event schedule?
