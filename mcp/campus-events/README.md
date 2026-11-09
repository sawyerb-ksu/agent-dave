# campus-events

DAVE's drone for the K-State events calendar. It is a small MCP server with two tools:

| Tool | What it does |
|---|---|
| `find_events(start_date, end_date, keyword?)` | Searches [events.k-state.edu](https://events.k-state.edu/calendar) between two dates (up to 31 days). The optional keyword matches the title, description or location. Returns up to 25 events with an id, title, times, location and link. |
| `export_ics(event_ids, filename?)` | Saves events from `find_events` as an `.ics` file in the current folder. The file opens in Outlook, Google Calendar or Apple Calendar. |

The calendar runs on Localist, which has a public JSON API, so no key is needed.

## Try it

From the `agent-dave` folder:

```bash
npm install --prefix mcp/campus-events
pi
```

Then ask DAVE: *"Find AI-related events on the K-State calendar for the next two weeks and save the best three to events.ics."*

`.pi/mcp.json` already registers the server. Run `/mcp` inside pi to check that it is connected.

## When the calendar can't be reached

If the K-State calendar doesn't answer within 10 seconds, `find_events` uses the saved snapshot in `data/snapshot.json` and says so in its note, with the date it was saved and the dates it covers. `export_ics` works the same either way.

- **Refresh the snapshot** while online, ideally the week of the workshop: `npm run snapshot` (the next 31 days) or `npm run snapshot -- 14` (the next 14).
- **Force offline mode** for a demo: set `CAMPUS_EVENTS_OFFLINE=1`.
- **Use another snapshot file:** set `CAMPUS_EVENTS_SNAPSHOT` to its path.

The repo ships a starter snapshot of 34 AI- and tech-related events (Nov 7 to Dec 7, 2026). A refresh replaces it with the full calendar.

## Why it's built this way

These are the tool-design ideas from the workshop, in code:

- **Two tools, one job each.** The model picks the right one without guessing.
- **Inputs it can't get wrong.** Dates have one format and a clear limit, and every input has a description with an example.
- **Small answers.** Results are capped at 25 and skip long descriptions, so they don't flood DAVE's context. The full details stay in the server for `export_ics`.
- **Errors that say what to do next.** "Call find_events first" works better than "invalid id."

## Make it yours

- **Another Localist calendar.** Many universities use Localist. Set `CAMPUS_EVENTS_API` to that calendar's API (for example `https://events.example.edu/api/2`).
- **Where files go.** Set `CAMPUS_EVENTS_OUT` to save `.ics` files to another folder.
- **A new tool.** Add another `server.registerTool(...)` block in `server.mjs`, then run `/reload` in pi.

To set these, add an `env` block to the server's entry in `.pi/mcp.json`.

## Tests

```bash
npm test
```

The tests start a fake calendar on your machine, connect to the server the same way pi does, and check both tools, the `.ics` output, the snapshot fallback and the snapshot script. They don't need the internet.
