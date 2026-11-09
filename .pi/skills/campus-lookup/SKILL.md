---
name: campus-lookup
description: Answer questions about what's happening at
  K-State, such as events, talks and workshops. Use when the
  user asks about campus events or wants one on their calendar.
---
# Campus lookup
1. Work out the date range. "This week" means today
   through Sunday; with no range given, use the next
   two weeks.
2. Call find_events with that range. Add a keyword
   only if the user named a topic.
3. Pick the events that fit what the user asked for and
   list them: title, day and time, place.
4. If the user wants details, use fetch on the event's
   link and summarize the page.
5. If the user wants an event on their calendar, call
   export_ics with its id and say where the file is.

## Rules
- Use the real dates from find_events. Never guess a date or time.
- If nothing matches, say so and suggest a wider range or another keyword.
- find_events searches at most 31 days at a time. Split longer ranges.
