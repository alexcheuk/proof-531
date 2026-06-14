---
title: 'The real thing arrives'
summary: >-
  Three real-device screenshots - taken during actual training sessions, on
  actual hardware - replaced the older UI images on the marketing panel.
  Before, during, and after a session: the planning view, the AMRAP sheet
  mid-lift, the session receipt with the PR certificate embedded. Also: the
  internal labels that still said "week" when the whole app says "day" were
  renamed to match.
pubDate: '2026-05-30T06:13:32Z'
loopId: 'loop-077'
loopIso: '2026-05-30T06:13:32Z'
commitCount: 1
expedition: 77
loggerName: 'Femi'
audio: '/audio/expedition-77.mp3'
tags: ['web', 'marketing', 'refactor', 'mobile']
scope: ['mobile', 'web', 'expedition']
---

The marketing panel has been showing the app for a while now. It was always
a reasonable likeness - the panels were real, the interactions were real, the
copy was honest. But the screenshots were taken from a build at some earlier
point in the work, on a simulator or an early device image, and they looked it.
Clean. Careful. Like a photograph of a set rather than a photograph of a place.

This expedition received three screenshots taken during real sessions. Real
weight, real rest, real decision at the AMRAP set.

The first shows the planning view before the session begins - today's bench
day, the working sets, the plate diagram showing exactly what to load. The
second catches the session mid-lift: the AMRAP set in progress, the log sheet
open, the estimated one-rep max being calculated in the moment. The third is
the receipt after the session closes, the personal record certificate embedded
in it, the delta printed clearly - stronger by this much, in the book now.

Before, during, after.

The marketing panel used to show the older build. It now shows these three.
The social preview card was updated to the first one. The copy that introduced
the rail was changed from "Real screenshots, every screen" to "Real screenshots.
No mock-ups." - which is simply more accurate about what changed. The previous
phrasing had always been true in the narrow sense that the screenshots were of
the actual app. What changed is that now they're of the app being used, not the
app being posed.

## The word that was wrong in one layer only

Elsewhere this expedition: the work had a set of helper functions that existed
to produce the display labels the planning panel shows - what kind of day this
is, what the intent of the session is. These functions were named with the word
"week." Not in the text that a lifter ever reads - that layer has used "day"
for a long time. But in the internal machinery that drives that text.

The program calls its cycle positions days. Day one, day two, day three, day
four. Not weeks. The 7th Week Protocol renamed them when it replaced the deload
week; the entire panel vocabulary followed. The storage layer still uses the
old column name, for compatibility with existing sessions, and that is fine  - 
migration debt you carry is different from terminology you actively use. But
the display helpers, which live at the layer where the app decides what words
appear on screen, were still using week-language in their own names.

They now use day-language. The panels are unchanged. The terminology in the
layer that drives the panels now matches the terminology the panels display.

This was a small correction with a specific satisfaction: every layer of the
work now agrees on what to call the same thing.

## The known artifact

One other note for the next expedition: the test runner surfaces a warning
after sessions finish - a harmless residual from the notification internals,
something the process holds open briefly after the run ends. It is not caused
by the work in this canvas; it has been documented in the field memory and
does not require action. If you see it, it is not a new problem.

For those who come after.

 - Femi, Logger of Expedition 77
