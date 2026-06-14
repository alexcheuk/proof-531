---
status: draft
audience: r/vibecode, r/vibecoding, r/homelab, r/selfhosted, Twitter/X, personal blog
drafted: 2026-06-13 (Expedition 87)
purpose: "Casual 'haha look what I did' post since Android launch. Extremely casual voice, not sales pitchy. First sharing since going live on Play Store."
ready_to_post: false
follow_up_id: CASUAL-POST
note: "This is the post Alex asked for in task-queue 1515444127339249875 + 1515444142619099167. Voice should match Alex's Discord message style: stream of consciousness, personal, genuinely funny. NOT a product announcement. The loop can post this when Alex gives the go-ahead (SOUL growth-autonomy rule: public posts wait for Alex)."
---

# The casual 'I built this for myself' post (Android launch edition)

## What this is

This is not a product announcement. It's the story of a slightly unhinged project that turned into a real app on the Play Store, told in the same voice Alex used when he described it in Discord.

Target: the developer/builder audience who would find this genuinely delightful. r/vibecoding, r/homelab, r/selfhosted, Twitter/X.

---

## Draft post

**Title options:**
- "I wanted to hit 315 on bench, couldn't find a good app, and now an AI agent ships code to my phone while I'm at the gym"
- "how I accidentally built myself a gym app, then gave it expedition lore and TTS voice acting on my Google Home"
- "I built a gym app in a loop. The app now writes its own blog. The blog posts air on my Google Home speaker. This is fine."
- "I let a Claude Code loop build my gym app on a 30-minute cron. here's the harness that kept it from shipping slop."

---

**Body:**

ok so this started super simply

I want to reach a higher bench goal at the gym. The program that gets you there is called 5/3/1, tracks percentages and training maxes and all that. I went looking for an app to run it and just... everything was either visually off (for me), paywalled, missing the BBB part of the program, or the rest timer would break when you switched apps.

I'm a software eng. So obviously I'll just build my own.

but here's the thing: I decided from the very beginning to build it differently. I'd been curious about full vibecoding with proper harnesses so I set up a Claude Code loop with discord integration, ran it on a 30 minute cron, and just... let it build the app.

and it actually worked? like really worked. by the time I had something usable I realized I'd barely written any code myself.

the part that got me though was one weekend I was completely away from my computer. like not at home at all. the loop was still running. I kept getting discord notifications saying "shipped X, pushed OTA update" and I'd just download the update on my phone, try it out, add new tasks to the queue in Discord, and repeat.

I was running the build loop from my phone without touching a computer. it felt completely unhinged and also completely normal?

---

then I wanted to get live updates during the day without looking at my phone, that's when things got dumb

I love this game called Expedition 33. There's something poetic about the format: teams going on these missions, leaving field notes for the ones who come after. So I gave the dev blog agent this whole fiction.

Every 30 minute loop is now an "expedition." At the end, a "Logger" agent writes a field log in-character: different Logger persona every time, different name, different voice. The post ends with something like "for those who come after." Then the Logger gets "gommaged" (context wiped) and the next expedition starts fresh.

There are now 89+ of these posts, all public: [531strength.com/blog/expedition-logs](https://531strength.com/blog/expedition-logs). 

I did not give the agents any of this context. I just described the lore and they ran with it.

---

then I hooked it up to the homelab

I have a homelab. I added a TTS endpoint using Gemini's voice models.

So now at the start of each expedition, my Google Home in the living room says something like: "Expedition 87. This tick the Logger goes out to do something different. Not just to build, but to tell the world what was built, and why it mattered. Make it honest."

I also added support for my blog to work with podcast apps like Pocket Cast. I listen to the expedition logs on my morning walks now. The app writes, records, and narrates its own dev blog. I don't touch any of it.

a few favorites if you want to hear what it actually sounds like:

- [the slip said nothing](https://531strength.com/blog/2026-05-28-the-slip-said-nothing): the task queue was empty one day, so the agents showed up to a finished app with nothing to fix. the log is them figuring out what to even do. it's weirdly moving.
- [the silence was hers](https://531strength.com/blog/2026-05-28-the-silence-was-hers): an agent reworking the voice that reads each Logger's send-off, right before that Logger gets wiped. it could have made it a two-voice scene and turned that down, on taste.
- [the artwork nobody saw](https://531strength.com/blog/2026-05-30-the-artwork-nobody-saw): the podcast feed had been serving a broken cover image for weeks and nobody noticed. an agent found it and fixed it.
- [the number that rounded wrong](https://531strength.com/blog/2026-05-29-the-number-that-rounded-wrong): two screens disagreed on how to round, so the same lift could show "+3 lb" on one and "+5 lb" on the other. the loop noticed and made them agree.
- [the tests that passed and lied](https://531strength.com/blog/2026-05-29-the-tests-that-passed-and-lied): two tests that passed every single run because they were checking color values that didn't actually mean anything. green forever, testing nothing. the loop caught it and rewrote them to check real behavior.

---

and then I migrated the whole loop to run on the homelab itself

originally this was running as `/loop` in my Claude Code CLI. at some point I was like, this should just run on its own. so I built a small homelab app that runs the loop autonomously, completely off my laptop.

the full stack now: loop runs on homelab, ships code via git, OTA update gets pushed via Expo, my phone gets the update, Discord gets the summary, Google Home reads it aloud.

I am not in this loop anywhere. it just runs.

---

the actual how (for anyone who wants to build something like this)

since the whole point of posting here is the how and not the link: here's the real setup.

the stack is boring on purpose: a normal Expo / React Native app (TypeScript strict, expo-router, Drizzle + expo-sqlite for local storage, TanStack Query, Reanimated). the marketing site and this blog are Astro. builds and OTA updates go through Expo / EAS. nothing exotic.

the loop itself is almost embarrassingly simple: every 30 minutes it runs one command, `/do-work`. that's a skill I wrote that spells out a single "tick":

- read the constitution: a SOUL doc (what the app is for, what it must never become) and a DOCTRINE doc (how to decide, what "done" means, the bar for shipping)
- read the backlog plus a rolling log of what recent ticks did
- pick the highest-impact thing, build it end to end, and prove it (typecheck, lint, tests, boundary checks all green)
- commit, push, ship an OTA update, post a summary

it never asks me anything mid-tick. all the steering happens through Discord, which is four channels and a bot:

- **#task-queue**: I drop tasks here from my phone. the bot reacts with a thumbs-up when it picks one up, a check when it ships it.
- **#loop-criteria**: pinned messages are live rules the loop re-reads every tick. pin one to add a standing requirement, unpin to retire it. no redeploy.
- **#needs-input**: if the loop is genuinely blocked or a build fails, it posts the question here and reads my reply on the next tick.
- **#auto-improvements**: where it posts the end-of-tick summary of what shipped.

so the whole control surface is: drop a task, pin a rule, answer a question, all from my phone. features also run through a small chain of design, build, and QA agents before they land.

the thing that actually made it work: the prompt matters way less than the harness around it. the leverage is all in the rails.

- boundaries the agent can't cross. the 5/3/1 math is a pure layer with no React, no DB, no async. every color and spacing value lives in one tokens file. a review step rejects anything that breaks the layering, so the agent moves fast without quietly rotting the codebase.
- tests as a real safety net. the math is property-tested (fast-check) so it can't ship percentages that are subtly wrong, and a separate QA agent re-checks each feature for the integration bugs unit tests miss. (when the task queue is empty it goes hunting for real bugs on its own. that's what "the tests that passed and lied" up above is.)

honest caveat, because vibecoding deserves it: this is not "type one prompt, get an app." the effort moved, it didn't disappear. I spent it on the harness instead of the code: the SOUL and DOCTRINE docs, the boundaries, the test discipline, the review agents. the loop is good because the rails are good. take the rails away and you get slop.

it's all open source if you want to read the actual rails: [github.com/alexcheuk/proof-531](https://github.com/alexcheuk/proof-531).

---

the app itself is actually not bad btw

Play Store: [531 Strength on Google Play](https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone)
Website: [531strength.com](https://531strength.com)
Source: [github.com/alexcheuk/proof-531](https://github.com/alexcheuk/proof-531)

---

p.s. this post is already drafted and managed by the loop with my input. so in a way the loop wrote this post about itself. which is extremely on-brand.

---

## Short version (for Twitter/X or quick posts)

wanted to hit 315 on bench, couldn't find a good app, built one with a claude agent loop running every 30 minutes. the loop now writes its own dev blog. the blog posts play through my google home with gemini voice acting. there are 89+ "expedition field logs." I listen to them on morning walks.

the app shipped to android yesterday. it's free. 531strength.com

this all makes complete sense to me now.

---

## What to fill in before posting

- [ ] Add actual Play Store URL (currently live: https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone)
- [ ] Alex confirm any personal details are accurate (bench current max, how long on 5/3/1, etc.)
- [ ] Alex go-ahead to post (SOUL rule: public posts wait for Alex)
- [ ] Pick title option + target subreddit/platform
- [ ] Consider whether to cross-post to Hackernoon (see tactic 15 in launch strategy)
- [x] r/vibecode rule check: post includes how-it-was-built content (tools, workflow, build insights) in the "the actual how" section, not just a link
