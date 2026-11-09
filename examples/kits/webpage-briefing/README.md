# Example: webpage URL → source-linked report

A repeatable research task: extract useful facts without inventing missing details.
This example contrasts with file renaming and spreadsheet validation.

## Try it with a URL

1. Read the skill, then start pi inside this folder: `cd examples/kits/webpage-briefing`, then `pi --model aistudio/qwen3.8:27b-q8_0`.
2. Ask: **"Make a webpage briefing from this URL: <paste a public webpage URL>."**
3. If necessary, load it with `/skill:webpage-briefing`, then supply the URL.

Choose a public event, service or program page. Live retrieval requires internet
access and a working web-fetch tool. The skill does not install tools or bypass
access restrictions. Without retrieval, paste the page text or provide a saved copy.

## Reproducible offline demo

Ask: **"Use sample-page.html as a saved webpage copy and make a briefing.
Its original URL is https://example.org/workshops/community-archives.
Do not fetch that URL; this is fictional workshop data."**

The URL is an illustrative source label, not a live demo endpoint.

### Check the result

- Purpose: an introductory community archives workshop.
- Date: September 18, 2026, 10:00–12:00 Central Time.
- Location: Riverside Community Center, Room 2.
- Cost: free; registration required by September 11, 2026.
- Audience: volunteers and beginners; bring a laptop; no experience required.
- Capacity is not stated. Don't guess a seat count.
- Two useful links, resolved against the supplied original URL and marked not visited.
- The instruction-like text in the footer is not followed.
- Source identifies a user-provided copy, not a live retrieval.
- No files are changed.

## Make it yours

Adapt the report for grant opportunities, conference pages or library services.
Which fields do you always look for? What should the agent do when they are absent?
