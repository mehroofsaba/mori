# Mori — The Thought Garden

Plant your thoughts. Grow your days.

React 19 + Vite · JavaScript (ES6+) · CSS3 · Motion · Lucide React · IndexedDB · Transformers.js (optional)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview
```

## Goofy font

Copy your font file to `public/fonts/Goofy.woff2` (or `Goofy.ttf`). Until then Mori uses Gaegu, a thin handwritten Google font, as a stand-in. Nunito and Gochi Hand load from Google Fonts.

## What's inside

- **Home**: greeting, stats (Bloomed / Growing / Little Seeds), the interactive SVG garden, Today's Focus, Task Details.
- **My Garden**: bigger garden, category filter, growth legend. Tap or keyboard-focus any plant.
- **Tasks**: Today / Upcoming / Needs attention / Completed / All, search, sorting, subtasks, dependencies, create & edit.
- **Assistant**
  - *Brain Dump*: free text becomes a reviewable plan (edit, remove, drag to reorder, add steps) before anything is planted. Deadlines are never invented.
  - *Daily Plan*: deterministic sequencing (deadlines, priority, dependencies, your hours), with breaks and "Not today".
  - *Ask Mori*: a problem-solving companion with practical steps you can add to a task.
- **Progress**: 7D / 30D / All chart, tap a bar to revisit a day, bloomed flowers shelf.
- **Settings**: garden theme, vibe, name, hours, gentle mode, reminders, optional browser AI, export / import / reset.

## Notes

- Data is stored in IndexedDB (`mori-thought-garden`). Nothing leaves your device.
- The brain dump organiser and the planner are plain code, so they work offline and are predictable.
- Browser AI (Settings) downloads `Xenova/flan-t5-small` once via Transformers.js. It only adds an extra tip in Ask Mori.
- Routing uses `HashRouter`, so the built `dist/` works on any static host.
