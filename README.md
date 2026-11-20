# MORI - The Thought Garden 🌷

### Plant your thoughts. Grow your days.

MORI is an AI-assisted personal productivity companion that turns scattered thoughts, overwhelming to-do lists, and unfinished ideas into a garden of growing possibilities.

Instead of treating productivity as another checklist to conquer, MORI gives every task a place to grow. Capture everything on your mind, organise it into manageable actions, find a sensible path forward, and watch your garden flourish as you make progress.

**Your thoughts are the seeds. Your actions help them bloom.**

---

## ✿ The idea behind MORI

Sometimes, the hardest part of getting things done isn't the work itself. It's figuring out where to begin.

Ideas overlap. Deadlines pile up. Small tasks become overwhelming, and even knowing what to do next can feel exhausting.

MORI was designed around a simple idea: productivity should adapt to people, not the other way around.

It combines thoughtful task organisation, flexible planning, and an interactive garden metaphor to make everyday progress feel more approachable.

Every user begins with a completely fresh garden. No pre-filled tasks, artificial progress, or imaginary accomplishments. The garden grows from the things you actually choose to work on.

---

## ✿ Features

### 01. Your personal thought garden

A living, interactive garden that reflects your progress.

- Every newly created task begins as a seed.
- Active tasks gradually grow into plants.
- Progress is represented through growing stems and leaves.
- Completed tasks bloom into flowers.
- Finished flowers remain as a visual record of your accomplishments.
- Overdue tasks receive gentle attention indicators rather than negative or discouraging visuals.

Your garden is personal, persistent, and starts empty.

### 02. Brain Dump - Get everything out of your head

A space to write freely without worrying about organisation.

Describe everything on your mind in your own words. MORI helps turn that unstructured input into a proposed action plan.

- Extracts potential tasks from free-form text.
- Identifies useful details such as priorities, categories, deadlines, and estimated effort where supported.
- Separates actionable tasks from context, questions, and blockers.
- Allows you to edit, remove, reorder, and expand proposed tasks.
- Lets you review everything before adding it to your garden.
- Never invents deadlines simply to complete a task entry.

Nothing gets planted without your approval.

### 03. Daily Plan - Find your next step

A flexible planning companion that helps organise your workload into a sensible sequence.

The planner considers factors such as:

- Task deadlines.
- Priority.
- Dependencies between tasks.
- Estimated effort.
- Your available working hours.

It can break larger tasks into smaller actions, account for breaks, and help you decide what deserves attention today.

You can also move tasks out of today's plan without treating unfinished work as failure.

### 04. Ask Mori - A companion for difficult moments

Not every obstacle can be solved by rearranging a checklist.

Ask Mori provides a space to describe what's blocking you and receive practical suggestions.

- Explore alternative approaches.
- Break complicated problems into manageable actions.
- Find a starting point when you're feeling stuck.
- Turn useful suggestions into actionable tasks.

It's designed to help you think through problems, not pretend that every problem has an instant solution.

### 05. Task management

Manage your tasks without losing sight of the bigger picture.

- Create, edit, complete, postpone, and delete tasks.
- Organise tasks using categories and priorities.
- Set deadlines and estimated durations.
- Add subtasks and dependencies.
- Track progress.
- Search, filter, and sort your tasks.

Task views include:

- Today
- Upcoming
- Needs Attention
- Completed
- All Tasks

### 06. Progress & garden history

Your progress deserves to be remembered.

- Explore activity across 7-day, 30-day, and all-time views.
- Revisit previous days through the progress chart.
- Browse your completed flowers.
- See how your garden has grown over time.

Progress is more than a number. It's a collection of things you managed to do.

### 07. Personalisation & settings

Make your garden feel like your own.

- Choose your garden theme and visual preferences.
- Personalise your name and daily working hours.
- Configure gentle mode and reminders.
- Enable optional browser-based AI features.
- Export, import, and reset your data.

---

## ✿ The technology garden

MORI brings together a modern frontend, cloud-backed persistence, and optional browser-based AI.

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| Vite | Development server and production build |
| JavaScript (ES6+) | Application logic |
| CSS3 | Custom styling and responsive layouts |
| Motion | Animations and interactive transitions |
| Lucide React | Interface icons |
| Supabase | Authentication and cloud database |
| Transformers.js | Optional browser-based AI capabilities |
| IndexedDB | Browser-side capabilities where applicable |

### Architecture highlights

**Frontend:** React 19 with Vite and JavaScript.

**Authentication:** Supabase Auth handles user authentication.

**Data persistence:** Supabase provides cloud-backed storage for user data, tasks, and garden progress.

**Access control:** User data should be protected through Supabase Row Level Security (RLS) policies, ensuring users can access only their own records.

**AI assistance:** MORI combines predictable application logic for task organisation and planning with optional browser-based model capabilities.

**Deployment:** Hosted as a static web application on Render.

---

## ✿ Privacy & data

MORI is designed around personal spaces.

- Each user has an individual account.
- User-specific information is stored through Supabase.
- Authentication is handled by Supabase Auth.
- Database access is protected through Row Level Security policies.
- Optional browser AI capabilities can run on the user's device.
- Users can export or reset their data through the application.

MORI is not intended to expose one user's private garden to another.

**A garden should belong to the person who grows it.**

---

## ✿ Getting started

Want to explore the project locally?

### Prerequisites

- Node.js 22 or a compatible supported version.
- npm.
- A Supabase project with the required database schema and security policies configured.

### 1. Clone the repository

```bash
git clone https://github.com/mehroofsaba/mori.git
cd mori
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the key type supported by your Supabase project and the application client.

**Important:** Never place your Supabase service-role key or other secret keys in frontend environment variables.

### 4. Start the development server

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

### 5. Build for production

```bash
npm run build
```

The production-ready application is generated in the `dist/` directory.

### 6. Preview the production build

```bash
npm run preview
```

---

## ✿ Deployment

### Link - https://mori-dq79.onrender.com/


## ✿ Project structure

```text
mori/
│
├── public/
│   ├── fonts/
│   ├── favicon.svg
│   └── _redirects
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   └── supabase.js
│   ├── styles.css
│   └── ...
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

*The structure above illustrates the main project areas; individual folders and files may vary as development continues.*

---

## ✿ Design philosophy

MORI follows a visual language inspired by illustrated garden journals, soft storybook artwork, and handwritten notes.

Its design centres around the **Strawberry Meadow** palette:

| Colour | Hex |
|---|---|
| Cream Puff | `#FFF8E9` |
| Strawberry | `#F3A6B8` |
| Buttercup | `#F4D779` |
| Lilac Dream | `#C9B8E8` |
| Mint Leaf | `#A9D5B7` |
| Garden Green | `#63866B` |
| Cocoa Ink | `#493B3A` |
| Cloud White | `#FFFFFF` |
| Peach Bloom | `#F2B99F` |

Typography combines expressive handwritten headings with readable interface text.

The overall experience aims to feel warm, playful, calm, and purposeful without sacrificing usability.

---

## ✿ A little note

MORI is built around the belief that progress doesn't have to be loud to be meaningful.

Some days, you grow an entire garden. Some days, you plant one little seed. Both count.

You don't need to have everything figured out before you begin.

**Plant your thoughts. Grow your days.**

---

### Built with care by [Mehroofs Saba](https://github.com/mehroofsaba)

[GitHub Repository](https://github.com/mehroofsaba/mori) · [GitHub Profile](https://github.com/mehroofsaba)
