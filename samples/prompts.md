# Prompts to try

Stuck on what to ask? Pick one, paste it into pi, and change the details to fit your work.

## Wake DAVE up (slide 14)
- Hi DAVE. What can you do, and which model are you running on?
- Look around this folder and tell me what's in it, in three bullets.

## Make DAVE yours (slide 16)
After you edit `AGENTS.md`, start a new session and ask the same question before and after:
- What should I work on first today?
- Introduce yourself to my team in two sentences.
- A student emails asking for an extension. What do you do?

## Skills (slide 22, after the worked example)
- Read my-workshop.md and draft .pi/skills/my-skill/SKILL.md for my task. Include when to use it, the steps, what not to invent and where to save the result. I will review and edit it in VS Code.
- Turn these notes into minutes: *(paste `samples/meeting-notes/dept-meeting.md`)*
- Here's a transcript from our check-in. What did we decide, and who owes what? *(paste `samples/meeting-notes/project-standup-transcript.md`)*
- *(After writing your own skill, ask for its task in plain words, without naming the skill.)*

## The drone (slide 27)
- Find AI-related events on the K-State calendar for the next two weeks and save the best three to events.ics
- What's happening on campus this Thursday? Just the highlights.
- Find workshops on the K-State calendar this month that would suit a grad student, and put the best one on my calendar.
- Open the page for the first event and tell me who it's for. *(needs the internet)*

## Upgrades (slide 34)
These leave real choices open, so DAVE should ask you instead of guessing:
- Help with my task in my-workshop.md. Use ask_user_question to clarify a choice before you act.
- Plan a 30-minute team meeting for next week. Ask me anything you need first.
- Help me pick a topic for a lunch-and-learn about AI. Give me options to choose from.
- Set up a folder structure for my notes. Ask me how I like to organize things.

Finished early? Ask DAVE to build something small:
- Write yourself an extension that adds a word_count tool, then /reload and use it on TROUBLESHOOTING.md.

## A crew (preview; needs pi-subagents)
- Prepare my week. In parallel, have one worker find AI events on the K-State calendar for the next two weeks and another recap this week's repo and doc changes. Then have a writer turn both into a short team update.
- In parallel, have one worker list next week's campus events and another summarize my meeting notes in samples/. Then have a writer draft a Monday email to my team.

## Final task test (slide 39)
- Read my task in my-workshop.md and do it with the input I listed. Save the result to the path I chose.
- Draft a reply to the email in samples/student-email.md using only the facts supplied there. Save it to drafts/student-email.md. *(Loop 2 checkpoint skill fallback.)*

Check the result yourself, edit one instruction in your skill in VS Code, then `/reload` and request the task again. Record what changed and what still needs supervision in `my-workshop.md`.
