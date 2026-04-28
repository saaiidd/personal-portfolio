# said@mammadov: ~/portfolio

A personal portfolio disguised as a macOS terminal. Real prompt, real commands, real history. No frameworks.

```
$ whoami
said@mammadov · Junior Python Developer · Frontend Engineer · Baku, Azerbaijan
```

## What this is

A single-page portfolio built around a working command-line interface. Visitors don't scroll a marketing page; they type commands and read the output. The whole thing is three files, no build step, no dependencies beyond a Google Font.

## Stack

- Vanilla HTML, CSS, JavaScript (no React, no bundler, no transpiler)
- JetBrains Mono via Google Fonts
- `localStorage` for theme persistence across sessions
- `~46 lines of HTML, ~895 lines of JS, ~668 lines of CSS`

## Commands

The terminal accepts the following commands:

| Command | Output |
|---|---|
| `help` | List all available commands |
| `about` | Who I am and what I do |
| `work` | Experience and freelance projects |
| `projects` | Featured projects (TouchGate, PDF-Merger, etc.) |
| `skills` | Languages, frameworks, and tools |
| `stack` | Tech stack quick view |
| `education` | Academic background |
| `certs` | Certifications |
| `contact` | Email, LinkedIn, GitHub, location |
| `themes` | Switch terminal theme |
| `whoami` | Print current user |
| `pwd` | Print working directory |
| `ls` | List portfolio sections |
| `date` | Current date in ISO format |
| `reset` | Return to welcome screen |
| `clear` | Clear the terminal output |
| `exit` | Close the session |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Enter` | Run the current command |
| `↑` / `↓` | Cycle through command history (50-entry buffer) |
| `Tab` | Accept the highlighted autocomplete suggestion |
| `Esc` | Close autocomplete, or clear input if autocomplete is closed |
| `Ctrl+L` | Wipe the screen |

## Themes

Four themes ship with the terminal, switchable via the `themes` command. The selected theme persists in `localStorage` and syncs across browser tabs.

- **Dark Night** (default): indigo background, peach accent
- **Daylight**: white window, copper accent
- **Glass**: frosted blur, purple accent
- **System 7**: monochrome classic Mac OS

## Deep linking

Any command can be linked to directly via the URL:

```
?cmd=projects
?cmd=contact
#projects
#cmd=work
```

Both query string (`?cmd=...`) and hash (`#cmd=...` or just `#...`) forms are supported. The boot sequence still plays, then the requested command runs automatically.

## Boot sequence

The page opens with a scripted boot animation (initializing modules, mounting components, resolving experience, loading runtimes). Press `Enter` at any point to skip to the welcome screen. A 7-second failsafe forces visibility on any boot line that didn't render in case of timing issues.

## Window controls

The three traffic-light dots in the title bar are functional:

- **Red** — close session (requires confirmation click within 2.5s)
- **Yellow** — toggle minimized state
- **Green** — toggle maximized state

## Running locally

No build step. Three options:

```bash
# Option 1: open the file directly
open index.html

# Option 2: any static server
python3 -m http.server 8000

# Option 3: VS Code Live Server, http-server, etc.
```

## File structure

```
said-portfolio-terminal/
├── index.html    # Markup, ARIA roles, font preconnect
├── style.css     # Themes, layout, animations
└── index.js      # Data, renderers, command handlers, event loop
```

The JavaScript follows a deliberate split:

- **DATA** — plain objects and arrays (`PROFILE`, `JOBS`, `PROJECTS`, `SKILLS`, `EDUCATION`, `CERTS`, `LINKS`, `THEMES`)
- **RENDER** — pure functions that map data to HTML strings
- **STATE** — `commandHistory`, `historyIdx`, `acIndex`
- **CMD** — command handlers that return strings or null
- **EVENTS** — one keydown listener, one scoped click listener, one storage listener

To update the resume content, edit the data objects at the top of `index.js`. Renderers and commands stay untouched.

## Accessibility

- `role="log"` on the terminal body with `aria-live="polite"` (enabled after boot)
- `aria-label` on all interactive elements including the traffic-light dots
- Autocomplete uses `role="listbox"` with proper `aria-controls` wiring
- All command output is keyboard-navigable

## Security note

The data objects in `index.js` (jobs, projects, skills, etc.) are interpolated into `innerHTML` without escaping by design, so I can use inline tags like `<span class="t-accent">` in descriptions. The only escaped path is the user's typed command echo. If this data ever moves to a CMS or accepts user input, swap to per-field `escapeHTML()`.

## Contact

```
$ contact
email     saidmammadovv941@gmail.com
linkedin  /in/said-mammadov-41a7a8303
github    github.com/saaiidd
location  Baku, Azerbaijan
```

## License

MIT
