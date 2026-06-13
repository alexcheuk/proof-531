---
status: draft
audience: r/vibecoding, r/homelab, r/selfhosted, Twitter/X, personal blog
drafted: 2026-06-13 (Expedition 87)
purpose: "Casual 'haha look what I did' post since Android launch. Extremely casual voice, not sales pitchy. First sharing since going live on Play Store."
ready_to_post: false
follow_up_id: CASUAL-POST
note: "This is the post Alex asked for in task-queue 1515444127339249875 + 1515444142619099167. Voice should match Alex's Discord message style - stream of consciousness, personal, genuinely funny. NOT a product announcement. The loop can post this when Alex gives the go-ahead (SOUL growth-autonomy rule - public posts wait for Alex)."
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

---

**Body:**

ok so this started super simply

I want to bench 315. Currently at 225. The program that gets you there is called 5/3/1 - it's very math-y, tracks percentages and training maxes and all that. I went looking for an app to run it and just... everything was either ugly, paywalled, missing the BBB part of the program, or the rest timer would break when you switched apps.

I'm an engineer. So obviously I was like ok I'll just make one.

but here's the thing - I decided from the very beginning to build it differently. I'd been curious about vibecoding with proper harnesses so I set up a Claude Code loop with discord integration, ran it on a 30 minute cron, and just... let it build the app.

and it actually worked? like really worked. by the time I had something usable I realized I'd barely written any code myself.

the part that got me though was one weekend I was completely away from my computer. like not at home at all. the loop was still running. I kept getting discord notifications saying "shipped X, pushed OTA update" and I'd just download the update on my phone, try it out, add new tasks to the queue in Discord, and repeat.

I was running the build loop from my phone without touching a computer. it felt completely unhinged and also completely normal?

---

then I added the expedition lore and things got genuinely ridiculous

I love this game called Expedition 33. There's something poetic about the format - teams going on these missions, leaving field notes for the ones who come after. So I gave the dev blog agent this whole fiction.

Every 30 minute loop is now an "expedition." At the end, a "Logger" agent writes a field log in-character - different Logger persona every time, different name, different voice. The post ends with something like "for those who come after." Then the Logger gets "gommaged" (context wiped) and the next expedition starts fresh.

There are now 87+ of these posts. The Logger of Expedition 23 had a great voice. The Logger of Expedition 31 was unusually terse (it turned out a boundary check had failed in that loop, so maybe that Logger knew something was wrong).

I did not give the agents any of this context. I just described the lore and they ran with it.

---

then I hooked it up to the homelab

ok so this is where it gets properly absurd.

I have a homelab. I added a TTS endpoint using Gemini's voice models. I gave Verso (the "Paintress" character who oversees the fiction) a specific voice - Algenib, described as "a battle-hardened elegant nomad with more than a century behind him. Somber and a little mysterious."

So now at the start of each expedition, my Google Home in the living room says something like: "Expedition 87. This tick the Logger goes out to do something different. Not just to build, but to tell the world what was built - and why it mattered. Make it honest."

my wife has stopped asking questions about this.

I also added Pocket Cast subscription. I listen to the expedition logs on my morning walks now. The app writes, records, and narrates its own dev blog. I don't touch any of it.

---

and then I migrated the whole loop to run on the homelab itself

originally this was running as `/loop` in my Claude Code CLI. at some point I was like, this should just run on its own. so I built a small homelab app that runs the loop autonomously, completely off my laptop.

the full stack now: loop runs on homelab, ships code via git, OTA update gets pushed via Expo, my phone gets the update, Discord gets the summary, Google Home reads it aloud.

I am not in this loop anywhere. it just runs.

---

the app itself is actually good btw

531 Strength is on the Play Store now (iOS coming soon, waiting on Apple). Free, no account, local SQLite only. Plate math is all done for you, rest timer works in the background on Android via a live notification, BBB is fully supported.

Play Store: [link]

---

p.s. this post is already drafted and managed by the loop with my input. so in a way the loop wrote this post about itself. which is extremely on-brand.

---

## Short version (for Twitter/X or quick posts)

wanted to hit 315 on bench, couldn't find a good app, built one with a claude agent loop running every 30 minutes. the loop now writes its own dev blog. the blog posts play through my google home with gemini voice acting. there are 87+ "expedition field logs." I listen to them on morning walks.

the app shipped to android yesterday. it's free.

this all makes complete sense to me now.

---

## What to fill in before posting

- [ ] Add actual Play Store URL (currently live: https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone)
- [ ] Alex confirm any personal details are accurate (bench current max, how long on 5/3/1, etc.)
- [ ] Alex go-ahead to post (SOUL rule: public posts wait for Alex)
- [ ] Pick title option + target subreddit/platform
- [ ] Consider whether to cross-post to Hackernoon (see tactic 15 in launch strategy)
