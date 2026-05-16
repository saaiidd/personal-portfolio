// @ts-check
'use strict';

/* ============================================================
   ARCHITECTURE
   - DATA:    plain objects/arrays. The resume.
   - RENDER:  pure data -> string functions.
   - STATE:   commandHistory, historyIdx, acIndex.
   - CMD:     command handlers (return string OR null).
   - EVENTS:  one keydown, one scoped click, one storage listener.
   ============================================================ */

/* =================== ELEMENTS =================== */
const body  = /** @type {HTMLElement} */ (document.getElementById('terminal-body'));
const input = /** @type {HTMLInputElement} */ (document.getElementById('cmd-input'));
const ac    = /** @type {HTMLElement} */ (document.getElementById('autocomplete'));
const win   = /** @type {HTMLElement} */ (document.getElementById('terminal-window'));

/* =================== STATE =================== */
const commandHistory = []; // user-typed values, capped
const HISTORY_CAP = 50;
let historyIdx = -1;
let acIndex = -1;
let redDotConfirming = false;
let redDotTimer = /** @type {number|null} */ (null);

/* =================== DATA =================== */

const PROFILE = {
  name:     'Said Mammadov',
  username: 'said@mammadov',
  role:     'Junior Python Developer · Frontend Engineer · Computer Engineering',
  status:   'open to work',
  location: 'Baku, Azerbaijan',
  email:    'saidmammadovv941@gmail.com',
  github:   'https://github.com/saaiidd',
  linkedin: 'https://linkedin.com/in/said-mammadov-41a7a8303',
};

const ASCII = `
       ░▒▓████████████████▓▒░
     ░▓██░░░░░░░░░░░░░░░░██▓░
   ░▓██░░  ░▒▒▒░    ░▒▒▒░  ░░██▓░
  ░██░░    ░███░    ░███░    ░░██░
  ██░░     ░▀▀▀░    ░▀▀▀░     ░░██
  ██░░       ░░  ░▒▒░  ░░       ░░██
  ██░░         ░░▒▓▒░░         ░░██
   ░██░       ░██░░░░██░       ░██░
    ░██░░    ░░██████░░    ░░██░
      ░▒██████████████████████▒░
         ░░░░░░░░░░░░░░░░░░
            `;

const CAPABILITIES = [
  { head: 'Code', body: 'Python, JavaScript, Swift, OOP' },
  { head: 'Web',  body: 'React, HTML5, CSS3, REST APIs' },
  { head: 'Data', body: 'pandas, NumPy, systems analysis' },
  { head: 'AI',   body: 'Claude, AI tooling, automation' },
];

const JOBS = [
  {
    title:    'Junior Frontend Developer',
    company:  'Freelance · Self-Employed',
    period:   'Apr 2024 — Present',
    location: 'Baku, Azerbaijan',
    bullets: [
      'Delivered <span class="t-green t-bold">10+ client web projects</span> end-to-end — from requirements gathering and scoping through to final production deployment.',
      'Built responsive, performance-optimized UIs using JavaScript, React, and CSS, meeting client specs and deadlines across multiple verticals.',
      'Engineered reusable UI component libraries and client-facing landing pages, reducing future development time per project.',
      'Managed direct client communication and requirements analysis independently, with systematic problem-solving and iterative practices.',
    ],
    tags:  ['React', 'JavaScript', 'CSS3', 'REST APIs', 'Git', 'Client Management'],
    stats: ['10+ deployments', '2+ years active', 'multi-vertical'],
  },
];

const PROJECTS = [
  {
    name:        'TouchGate',
    year:        '2026 — Present',
    type:        'Open-Source · macOS Utility Application',
    href:        'https://github.com/saaiidd/touchgate-macos',
    description: 'Designed and engineered an open-source macOS application from concept to release using Swift &amp; SwiftUI — full end-to-end software development lifecycle. Shipped with an AI-assisted workflow using <span class="t-accent">Claude Code</span> for architecture review and iteration. Maintained as an active GitHub project with multi-release versioning.',
    tags:        ['Swift', 'SwiftUI', 'Xcode', 'Claude Code', 'Open Source'],
    stats:       ['● actively maintained', 'multi-release', 'github.com/saaiidd/touchgate-macos'],
  },
  {
    name:        'PDF-Merger',
    year:        '2026',
    type:        'Open-Source · Python Web App &amp; CLI',
    href:        'https://github.com/saaiidd/PDF-Merger',
    description: 'A FastAPI-powered tool that merges images (PNG / JPG / WEBP) and PDFs into a single downloadable PDF — usable as a <span class="t-accent">web app</span> or a <span class="t-accent">CLI</span>. Implements production-grade safeguards: magic-byte file-type validation (not just extensions), configurable size / count / rate limits, EXIF-aware auto-rotation, DPI preservation for scanned docs, and warning headers for skipped files. RESTful endpoint exposes the merger programmatically.',
    tags:        ['Python', 'FastAPI', 'Uvicorn', 'Pillow', 'pypdf', 'reportlab', 'REST API'],
    stats:       ['● open-source', 'web + CLI', 'github.com/saaiidd/PDF-Merger'],
  },
  {
    name:        'Client Web Portfolio',
    year:        '2024 → ∞',
    type:        'Production · 10+ Deployments',
    href:        null,
    description: 'Continuous portfolio of freelance engagements: responsive marketing sites, custom landing pages, and reusable component libraries built to client spec — shipped on schedule across multiple industry verticals. <span class="t-muted">(individual project links available on request — most under client confidentiality)</span>',
    tags:        ['React', 'JavaScript', 'UI Libraries', 'Landing Pages'],
    stats:       [],
  },
];

const SKILLS = [
  {
    group: 'Languages',
    items: [
      { name: 'JavaScript',     level: 'proficient'  },
      { name: 'HTML5 / CSS3',   level: 'proficient'  },
      { name: 'Python',         level: 'comfortable' },
      { name: 'Swift',          level: 'comfortable' },
    ],
  },
  {
    group: 'Frameworks &amp; Libraries',
    items: [
      { name: 'React',          level: 'proficient'  },
      { name: 'SwiftUI',        level: 'comfortable' },
      { name: 'pandas / NumPy', level: 'learning'    },
    ],
  },
  {
    group: 'Tools &amp; Platforms',
    items: [
      { name: 'Git / GitHub',   level: 'proficient'  },
      { name: 'VS Code',        level: 'proficient'  },
      { name: 'Xcode',          level: 'comfortable' },
      { name: 'REST APIs',      level: 'proficient'  },
      { name: 'Claude Code',    level: 'proficient'  },
      { name: 'AI Integration', level: 'comfortable' },
    ],
  },
  {
    group: 'Concepts',
    items: [
      { name: 'Systems Analysis', level: 'comfortable' },
      { name: 'OOP',              level: 'proficient'  },
      { name: 'Algorithm Design', level: 'comfortable' },
      { name: 'Data Science',     level: 'learning'    },
    ],
  },
];

const EDUCATION = [
  {
    school: 'Riga Nordic University',
    degree: 'MSc · Computer Systems Analysis',
    period: 'Feb 2026 — Aug 2028',
    location: 'Baku, Azerbaijan',
    status: 'in progress',
    note: 'Coursework: Systems Design · Programming for Data Science · Applied Research Methods.',
  },
  {
    school: 'Azerbaijan Cooperation University',
    degree: 'Bachelor of Engineering · Computer Engineering',
    period: 'Sep 2021 — Jun 2025',
    location: 'Baku, Azerbaijan',
    status: null, note: null,
  },
  {
    school: 'IT Brains Academy',
    degree: 'Certificate · Front-End Development',
    period: 'Jan — Jul 2022',
    location: 'Baku, Azerbaijan',
    status: null, note: null,
  },
];

const CERTS = [
  { name: 'claude-101',  desc: 'AI Integration &amp; Workflow Automation', issuer: 'Anthropic',
    note: 'Demonstrates applied AI literacy and AI-assisted development skills.' },
  { name: 'english-pro', desc: 'Professional Working Proficiency Certificate', issuer: '', note: null },
  { name: 'smalltalk',   desc: 'English Speaking Level Test · Oral communication assessment', issuer: '', note: null },
];

const SVG_GMAIL = `<svg viewBox="0 -31.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" aria-hidden="true">
  <path d="M58.18 192.05V93.14L27.51 65.08 0 49.5v125.09c0 9.66 7.83 17.45 17.45 17.45h40.73Z" fill="#4285F4"/>
  <path d="M197.82 192.05h40.73c9.66 0 17.45-7.83 17.45-17.45V49.5l-31.16 17.84-27.02 25.8v98.91Z" fill="#34A853"/>
  <polygon fill="#EA4335" points="58.18 93.14 54.01 54.49 58.18 17.5 128 69.87 197.82 17.5 202.49 52.5 197.82 93.14 128 145.5"/>
  <path d="M197.82 17.5v75.64L256 49.5V26.23c0-21.59-24.64-33.89-41.89-20.95L197.82 17.5Z" fill="#FBBC04"/>
  <path d="M0 49.5l26.76 20.07 31.42 23.57V17.5L41.89 5.29C24.61-7.66 0 4.65 0 26.23V49.5Z" fill="#C5221F"/>
</svg>`;

const SVG_LINKEDIN = `<svg viewBox="0 0 382 382" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#0077B7" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z"/>
</svg>`;

const SVG_GITHUB = `<svg viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="color:var(--text);" aria-hidden="true">
  <path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z"/>
</svg>`;

const LINKS = [
  { kind: 'email',    href: 'mailto:' + PROFILE.email, name: 'Email',    handle: PROFILE.email,                       svg: SVG_GMAIL    },
  { kind: 'linkedin', href: PROFILE.linkedin,          name: 'LinkedIn', handle: '/in/said-mammadov-41a7a8303',       svg: SVG_LINKEDIN },
  { kind: 'github',   href: PROFILE.github,            name: 'GitHub',   handle: 'github.com/saaiidd',                svg: SVG_GITHUB   },
];

const THEMES = [
  { id: '',      name: 'Dark Night', desc: 'Default -- indigo + peach',     swatches: ['#1a1a2e','#252540','#e8a87c','#7caae8'] },
  { id: 'light', name: 'Daylight',   desc: 'White window -- copper accent', swatches: ['#f0f0f5','#ffffff','#b06430','#4070c4'] },
  { id: 'glass', name: 'Glass',      desc: 'Frosted blur -- purple accent', swatches: ['#0f0f1a','#2a1a4a','#c4b5fd','#67e8f9'] },
  { id: 'retro', name: 'System 7',   desc: 'Monochrome Mac OS Classic',     swatches: ['#808080','#C0C0C0','#000000','#404040'] },
];

const COMMANDS = {
  help:     { desc: 'list available commands' },
  about:    { desc: 'who I am & what I do' },
  work:     { desc: 'experience & freelance projects' },
  projects: { desc: 'featured projects (TouchGate, etc.)' },
  skills:   { desc: 'languages, frameworks &amp; tools' },
  stack:    { desc: 'tech stack quick view' },
  education:{ desc: 'academic background' },
  certs:    { desc: 'certifications' },
  contact:  { desc: 'email, linkedin, github, location' },
  themes:   { desc: 'switch terminal theme' },
  whoami:   { desc: 'print current user' },
  pwd:      { desc: 'print working directory' },
  ls:       { desc: 'list portfolio sections' },
  date:     { desc: 'current date (ISO)' },
  reset:    { desc: 'go back to welcome screen' },
  clear:    { desc: 'clear the terminal' },
  exit:     { desc: 'close the session' },
};

/* =================== RENDER HELPERS =================== */

/** @param {string} s */
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function tag(label) {
  return `<span class="project-tag">${escapeHTML(label)}</span>`;
}

/* SECURITY NOTE: data sources (PROFILE, JOBS, PROJECTS, SKILLS, EDUCATION,
   CERTS, LINKS, THEMES, CAPABILITIES) are trusted, hand-authored markup —
   their values are interpolated into innerHTML without escaping by design,
   so contributors can use inline tags like <span class="t-accent">. If this
   data ever moves to JSON / CMS / user input, swap to escapeHTML on
   field-by-field basis. The only currently-escaped path is the user's
   typed command echo (see echo()). */

/* =================== RENDERERS (data -> HTML) =================== */

function renderJob(j) {
  return `
    <div class="project-card">
      <span class="project-year">${j.period}</span>
      <div class="project-name">${j.title}</div>
      <div class="project-type">${j.company} · ${j.location}</div>
      <div class="project-desc">${j.bullets.map(b => '• ' + b).join('<br>')}</div>
      <div class="project-tags">${j.tags.map(tag).join('')}</div>
      ${j.stats.length ? `<div class="project-stats">${j.stats.map(s => `<span class="project-stat">↑ ${s}</span>`).join('')}</div>` : ''}
    </div>`;
}

function renderProject(p) {
  const nameContent = p.href
    ? `<a href="${p.href}" target="_blank" rel="noopener">${p.name}</a>`
    : p.name;
  return `
    <div class="project-card">
      <span class="project-year">${p.year}${p.href ? ' · <span class="t-accent">↗ github</span>' : ''}</span>
      <div class="project-name">${nameContent}</div>
      <div class="project-type">${p.type}</div>
      <div class="project-desc">${p.description}</div>
      <div class="project-tags">${p.tags.map(tag).join('')}</div>
      ${p.stats.length ? `<div class="project-stats">${p.stats.map(s => `<span class="project-stat">${s}</span>`).join('')}</div>` : ''}
    </div>`;
}

function renderSkillGroup(g) {
  return `
    <div class="output-line heading">## ${g.group}</div>
    <div class="skill-row">
      ${g.items.map(s => `
        <span class="skill-chip">
          ${s.name}
          <span class="level ${s.level}">${s.level}</span>
        </span>`).join('')}
    </div>`;
}

function renderEducation(e) {
  return `
    <div class="project-card">
      <span class="project-year">${e.period}</span>
      <div class="project-name">${e.school}${e.status ? ` <span class="tag yellow-bg">${e.status}</span>` : ''}</div>
      <div class="project-type">${e.degree} · ${e.location}</div>
      ${e.note ? `<div class="project-desc">${e.note}</div>` : ''}
    </div>`;
}

function renderCert(c) {
  return `
    <div class="output-line"><span class="cmd-name">${c.name}</span><span class="cmd-desc">${c.desc}${c.issuer ? ' · <span class="t-accent">' + c.issuer + '</span>' : ''}</span></div>
    ${c.note ? `<div class="output-line t-dim" style="padding-left:13ch;">${c.note}</div>` : ''}`;
}

function renderLink(l) {
  return `
    <a href="${l.href}" ${l.kind === 'email' ? '' : 'target="_blank" rel="noopener"'} class="social-link" data-no-focus>
      <span class="social-badge icon" aria-hidden="true">${l.svg}</span>
      <span class="social-name">${l.name}</span>
      <span class="social-handle">${l.handle}</span>
      <span class="social-arrow" aria-hidden="true">→</span>
    </a>`;
}

/* =================== APPEND HELPERS =================== */

function append(html) {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in';
  wrap.innerHTML = html;
  body.appendChild(wrap);
  // scrollIntoView is the production pattern; fallback for old engines
  if (wrap.scrollIntoView) wrap.scrollIntoView({ block: 'end', behavior: 'smooth' });
  else body.scrollTop = body.scrollHeight;
  return wrap;
}

function echo(cmd) {
  append(`<div class="output-block">
    <div class="cmd-echo"><span class="prompt-symbol">&gt;</span>${escapeHTML(cmd)}</div>
  </div>`);
}

/* =================== WELCOME =================== */

function renderWelcome() {
  body.innerHTML = '';

  // ===== MOTD — login banner =====
  const now = new Date();
  const stamp = now.toUTCString().replace('GMT', 'UTC');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const ua = navigator.userAgent || '';
  const kernel = /Mac/i.test(ua)     ? 'Darwin 24.4.0 arm64'
              : /Windows/i.test(ua)  ? 'Windows NT 10.0 x86_64'
              : /Linux/i.test(ua)    ? 'GNU/Linux 6.8 x86_64'
              :                        'POSIX x86_64';
  const fortunes = [
    'first, solve the problem. then, write the code. -- john johnson',
    'make it work, make it right, make it fast. -- kent beck',
    'simplicity is a prerequisite for reliability. -- edsger dijkstra',
    'the best code is no code at all. -- jeff atwood',
    'controlling complexity is the essence of computer programming. -- brian kernighan',
    'premature optimization is the root of all evil. -- donald knuth',
  ];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  append(`
    <div class="output-block motd">
      <div class="output-line t-muted">Last login: ${stamp} on ttys001</div>
      <div class="output-line t-muted">${kernel} -- tz=${tz} -- session=said.mammadov.v1</div>
      <div class="output-line t-dim mt-1">
        <span class="t-purple">✦</span> <em>${fortune}</em>
      </div>
    </div>
  `);

  // ===== $ neofetch — mascot framed as command output =====
  append(`
    <div class="output-block">
      <div class="cmd-echo"><span class="prompt-symbol">$</span>neofetch --short</div>
      <pre class="ascii-art" aria-hidden="true">${ASCII}</pre>
      <div class="output-line text-center t-dim" style="margin-top:-6px;">
        <span class="t-green">said@mammadov</span>
        <span class="t-muted">--</span>
        ${PROFILE.location}
        <span class="t-muted">--</span>
        <span class="t-blue">~/portfolio</span>
      </div>
    </div>
  `);

  // ===== $ cat ~/.profile — name / role / status as key:value output =====
  append(`
    <div class="output-block">
      <div class="cmd-echo"><span class="prompt-symbol">$</span>cat ~/.profile</div>
      <div class="profile-output">
        <div class="profile-row"><span class="profile-key">name</span><span class="profile-val t-accent t-bold">${PROFILE.name}</span></div>
        <div class="profile-row"><span class="profile-key">role</span><span class="profile-val">${PROFILE.role}</span></div>
        <div class="profile-row"><span class="profile-key">location</span><span class="profile-val">${PROFILE.location}</span></div>
        <div class="profile-row"><span class="profile-key">status</span><span class="profile-val"><span class="t-green">●</span> ${PROFILE.status} -- junior roles &amp; freelance</span></div>
        <div class="profile-row"><span class="profile-key">studying</span><span class="profile-val">MSc Computer Systems Analysis -- Riga Nordic University</span></div>
        <div class="profile-row"><span class="profile-key">experience</span><span class="profile-val">2+ years freelance frontend -- 10+ projects shipped</span></div>
      </div>
    </div>
  `);

  // ===== $ ls ~/skills/ — capabilities framed as directory listing =====
  append(`
    <div class="output-block">
      <div class="cmd-echo"><span class="prompt-symbol">$</span>ls -la ~/skills/</div>
      <div class="capabilities">
        ${CAPABILITIES.map(c => `
          <div class="cap-col">
            <span class="t-muted">drwxr-xr-x</span>
            <span class="cap-name">${c.head.toLowerCase()}/</span>
            <span class="cap-list">${c.body}</span>
          </div>`).join('')}
      </div>
    </div>
  `);

  // ===== $ help — the hint =====
  append(`
    <div class="output-block">
      <div class="cmd-echo"><span class="prompt-symbol">$</span>help --short</div>
      <div class="output-line t-dim">
        type <span class="t-accent">about</span>,
        <span class="t-accent">work</span>,
        <span class="t-accent">projects</span>,
        <span class="t-accent">skills</span>,
        or <span class="t-accent">help</span> for the full list.
      </div>
      <div class="output-line t-muted mt-1">
        ↑/↓ history -- Tab autocomplete -- Esc clear -- Ctrl+L wipe screen
      </div>
    </div>
  `);
}

/* =================== COMMAND HANDLERS =================== */

const CMD = {
  help() {
    let html = `<div class="output-line heading">Available commands</div>`;
    for (const [k, v] of Object.entries(COMMANDS)) {
      html += `<div class="output-line"><span class="cmd-name">${k}</span><span class="cmd-desc">${v.desc}</span></div>`;
    }
    html += `<div class="output-line t-dim mt-2">↑/↓ for history -- Tab to autocomplete -- Esc to clear input -- Ctrl+L to wipe</div>`;
    return html;
  },

  about() {
    return `
      <div class="output-line heading">## About</div>
      <div class="output-line">
        Results-driven <span class="t-accent">Junior Python Developer</span>
        and Computer Engineering graduate with <span class="t-green">2+ years</span>
        of hands-on software development experience.
      </div>
      <div class="output-line mt-2">
        Strong academic foundation in
        <span class="tag accent-bg">systems analysis</span>
        <span class="tag blue-bg">data science</span>
        <span class="tag purple-bg">applied research</span>
      </div>
      <div class="output-line t-dim mt-3">
        Currently advancing through a part-time MSc in Computer Systems at Riga Nordic University —
        coursework in Python for data science and systems design. I independently manage full project
        lifecycles, deliver client-facing web apps, and integrate AI tooling into dev workflows.
      </div>
      <div class="output-line t-dim mt-3">
        Passionate about building data-driven solutions at the intersection of software engineering
        and artificial intelligence.
      </div>
      <hr class="divider">
      <div class="output-line heading">## Quick facts</div>
      <div class="output-line"><span class="cmd-name">location</span><span class="cmd-desc">${PROFILE.location}</span></div>
      <div class="output-line"><span class="cmd-name">role</span><span class="cmd-desc">Junior Frontend Developer (freelance)</span></div>
      <div class="output-line"><span class="cmd-name">studying</span><span class="cmd-desc">MSc Computer Systems Analysis · Riga Nordic University</span></div>
      <div class="output-line"><span class="cmd-name">stack</span><span class="cmd-desc">Python · JavaScript · React · Swift · SwiftUI</span></div>
      <div class="output-line"><span class="cmd-name">looking for</span><span class="cmd-desc">junior software / freelance frontend / AI-tooling roles</span></div>
    `;
  },

  work() {
    return `
      <div class="output-line heading">## Work Experience</div>
      ${JOBS.map(renderJob).join('')}
      <div class="output-line t-dim mt-3">
        Type <span class="t-accent">projects</span> for featured open-source work.
      </div>`;
  },

  projects() {
    return `
      <div class="output-line heading">## Featured Projects</div>
      ${PROJECTS.map(renderProject).join('')}`;
  },

  skills() {
    return `
      <div class="output-line t-dim" style="margin-bottom:8px;">
        Honest, categorical levels — no fictional percentages.
        <span class="t-green">comfortable</span> = ship daily ·
        <span class="t-blue">proficient</span> = primary stack ·
        <span class="t-yellow">learning</span> = actively growing.
      </div>
      ${SKILLS.map(renderSkillGroup).join('')}`;
  },

  stack() {
    return `
      <div class="output-line heading">## Quick Stack</div>
      <div class="output-line"><span class="cmd-name">frontend</span><span class="cmd-desc">React · JavaScript · HTML5 · CSS3</span></div>
      <div class="output-line"><span class="cmd-name">backend</span><span class="cmd-desc">Python · REST APIs</span></div>
      <div class="output-line"><span class="cmd-name">data</span><span class="cmd-desc">pandas · NumPy</span></div>
      <div class="output-line"><span class="cmd-name">native</span><span class="cmd-desc">Swift · SwiftUI · Xcode</span></div>
      <div class="output-line"><span class="cmd-name">tools</span><span class="cmd-desc">Git · GitHub · VS Code · Claude Code · AI integration</span></div>
    `;
  },

  education() {
    return `
      <div class="output-line heading">## Education</div>
      ${EDUCATION.map(renderEducation).join('')}`;
  },

  certs() {
    return `
      <div class="output-line heading">## Certifications</div>
      ${CERTS.map(renderCert).join('')}`;
  },

  contact() {
    return `
      <div class="output-line heading">## Contact</div>
      ${LINKS.map(renderLink).join('')}
      <a href="#" class="social-link" data-no-focus onclick="return false;">
        <span class="social-badge icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" style="color:var(--green);">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </span>
        <span class="social-name">Location</span>
        <span class="social-handle">${PROFILE.location}</span>
        <span class="social-arrow" aria-hidden="true">→</span>
      </a>
      <div class="thinking-indicator mt-4">
        <span>Available for freelance &amp; junior roles</span>
        <span class="thinking-dots"><span></span><span></span><span></span></span>
      </div>`;
  },

  themes() {
    const cur = getTheme();
    return `
      <div class="output-line heading">## Theme</div>
      <div class="output-line t-dim">Click a theme to switch. Persists across sessions.</div>
      <div class="theme-grid">
        ${THEMES.map(t => `
          <div class="theme-card ${cur === t.id ? 'active' : ''}" data-theme="${t.id}" role="button" tabindex="0" aria-label="Switch to ${t.name} theme">
            <div class="name">${t.name}</div>
            <div class="desc">${t.desc}</div>
            <div class="theme-swatches">${t.swatches.map(s => `<span style="background:${s}"></span>`).join('')}</div>
          </div>`).join('')}
      </div>`;
  },

  whoami() { return `<div class="output-line">${PROFILE.username}</div>`; },
  pwd()    { return `<div class="output-line">/home/said/portfolio</div>`; },
  date()   { return `<div class="output-line">${new Date().toISOString()}</div>`; },

  ls() {
    return `
      <div class="output-line heading">## /home/said/portfolio</div>
      <div class="output-line"><span class="cmd-name">about/</span><span class="cmd-desc">professional summary &amp; bio</span></div>
      <div class="output-line"><span class="cmd-name">work/</span><span class="cmd-desc">freelance experience</span></div>
      <div class="output-line"><span class="cmd-name">projects/</span><span class="cmd-desc">TouchGate &amp; open-source work</span></div>
      <div class="output-line"><span class="cmd-name">skills/</span><span class="cmd-desc">tech stack</span></div>
      <div class="output-line"><span class="cmd-name">education/</span><span class="cmd-desc">MSc · BEng · certifications</span></div>
      <div class="output-line"><span class="cmd-name">contact.md</span><span class="cmd-desc">email · linkedin · github · location</span></div>`;
  },

  reset() { body.innerHTML = ''; renderWelcome(); return null; },

  clear() { body.innerHTML = ''; return null; },

  exit() {
    body.innerHTML = '';
    append(`
      <pre class="exit-message">
       Process terminated.
       But great code never really stops.
       Let's keep building.</pre>
      <div class="output-line t-dim text-center mt-4">
        Reach me at <a href="mailto:${PROFILE.email}" class="t-accent">${PROFILE.email}</a>
      </div>
      <div class="output-line t-dim text-center">
        type <span class="t-accent">reset</span> to reopen the terminal
      </div>`);
    return null;
  },
};

/* =================== RUN =================== */

function run(raw) {
  const cmd = raw.trim().toLowerCase().replace(/^\//, '');
  if (!cmd) return;

  if (cmd !== 'clear' && cmd !== 'reset' && cmd !== 'exit') echo(raw);

  if (cmd === 'clear') { CMD.clear(); return; }
  if (cmd === 'reset') { CMD.reset(); return; }
  if (cmd === 'exit')  { CMD.exit();  return; }

  const handler = /** @type {any} */ (CMD)[cmd];
  if (handler) {
    showThinking(() => {
      const out = handler();
      if (out !== null) append(`<div class="output-block">${out}</div>`);
      attachHandlers();
    });
  } else {
    append(`<div class="output-block">
      <div class="output-line t-red">command not found: ${escapeHTML(cmd)}</div>
      <div class="output-line t-dim">type <span class="t-accent">help</span> to see available commands</div>
    </div>`);
  }
}

function showThinking(cb) {
  const el = document.createElement('div');
  el.className = 'thinking-indicator fade-in';
  el.innerHTML = `<span>processing</span><span class="thinking-dots"><span></span><span></span><span></span></span>`;
  body.appendChild(el);
  if (el.scrollIntoView) el.scrollIntoView({ block: 'end', behavior: 'smooth' });
  setTimeout(() => { el.remove(); cb(); }, 220);
}

function attachHandlers() {
  // Theme cards
  document.querySelectorAll('.theme-card').forEach(card => {
    const apply = () => {
      const t = /** @type {HTMLElement} */ (card).dataset.theme || '';
      setTheme(t);
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    };
    /** @type {HTMLElement} */ (card).onclick = apply;
    /** @type {HTMLElement} */ (card).onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(); }
    };
  });
}

/* =================== AUTOCOMPLETE =================== */

function refreshAC(filter) {
  filter = filter.toLowerCase().replace(/^\//, '');
  const matches = Object.entries(COMMANDS).filter(([k]) => k.startsWith(filter));
  if (!filter || !matches.length) { ac.classList.remove('show'); acIndex = -1; return; }
  ac.innerHTML = matches.map(([k, v], i) =>
    `<div class="autocomplete-item ${i === 0 ? 'active' : ''}" data-cmd="${k}" role="option" aria-selected="${i === 0 ? 'true' : 'false'}">
      <span class="ac-cmd">${k}</span>
      <span class="ac-desc">${v.desc}</span>
    </div>`).join('');
  ac.classList.add('show');
  acIndex = 0;
  ac.querySelectorAll('.autocomplete-item').forEach(el => {
    /** @type {HTMLElement} */ (el).onclick = () => {
      input.value = /** @type {HTMLElement} */ (el).dataset.cmd || '';
      ac.classList.remove('show');
      submit();
    };
  });
}

function selectAC(dir) {
  const items = ac.querySelectorAll('.autocomplete-item');
  if (!items.length) return;
  acIndex = (acIndex + dir + items.length) % items.length;
  items.forEach((el, i) => {
    el.classList.toggle('active', i === acIndex);
    el.setAttribute('aria-selected', i === acIndex ? 'true' : 'false');
  });
  /** @type {HTMLElement} */ (items[acIndex]).scrollIntoView({ block: 'nearest' });
}

/* =================== SUBMIT =================== */

function submit() {
  const typed = input.value.trim();
  if (!typed) return;

  // Push the TYPED value to history (not the autocompleted one) — preserves intent.
  if (commandHistory[0] !== typed) {
    commandHistory.unshift(typed);
    if (commandHistory.length > HISTORY_CAP) commandHistory.length = HISTORY_CAP;
  }
  historyIdx = -1;

  // Resolve autocomplete: if popup open and a candidate is selected, run that.
  let toRun = typed;
  if (ac.classList.contains('show') && acIndex >= 0) {
    const items = ac.querySelectorAll('.autocomplete-item');
    if (items[acIndex]) toRun = /** @type {HTMLElement} */ (items[acIndex]).dataset.cmd || typed;
  }

  run(toRun);
  input.value = '';
  ac.classList.remove('show');
}

/* =================== EVENTS =================== */

input.addEventListener('input', e => refreshAC(/** @type {HTMLInputElement} */ (e.target).value));

/* Form submit catches Enter reliably across every mobile keyboard variant
   (iOS Safari "Go", Android Gboard "Done") even when keydown fires
   inconsistently. The keydown handler below stays as the desktop path. */
const cmdForm = /** @type {HTMLFormElement|null} */ (document.getElementById('cmd-form'));
if (cmdForm) {
  cmdForm.addEventListener('submit', e => {
    e.preventDefault();
    submit();
  });
}

input.addEventListener('keydown', e => {
  const acOpen = ac.classList.contains('show');

  // Enter is handled by the form's submit event — let it bubble through.
  // We don't preventDefault here so the form submission fires natively.
  if (e.key === 'Enter') { return; }

  if (e.key === 'Tab') {
    e.preventDefault();
    if (acOpen && acIndex >= 0) {
      const items = ac.querySelectorAll('.autocomplete-item');
      input.value = /** @type {HTMLElement} */ (items[acIndex]).dataset.cmd || input.value;
      refreshAC(input.value);
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    if (acOpen) { e.preventDefault(); selectAC(1); return; }
    if (commandHistory.length) {
      e.preventDefault();
      historyIdx = Math.max(historyIdx - 1, -1);
      input.value = historyIdx === -1 ? '' : commandHistory[historyIdx];
    }
    return;
  }

  if (e.key === 'ArrowUp') {
    if (acOpen) { e.preventDefault(); selectAC(-1); return; }
    if (commandHistory.length) {
      e.preventDefault();
      historyIdx = Math.min(historyIdx + 1, commandHistory.length - 1);
      input.value = commandHistory[historyIdx];
    }
    return;
  }

  if (e.key === 'Escape') {
    if (acOpen) ac.classList.remove('show');
    else input.value = '';
    return;
  }

  if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); CMD.clear(); }
});

input.addEventListener('blur', () => setTimeout(() => ac.classList.remove('show'), 180));

/* Scoped focus: only refocus on clicks inside the terminal window,
   and never when the user is selecting text or clicking interactive elements. */
win.addEventListener('click', (e) => {
  const t = /** @type {HTMLElement} */ (e.target);
  if (!t) return;
  if (window.getSelection && window.getSelection().toString()) return; // user is selecting text
  if (t.closest('a, button, input, [role="button"], [data-no-focus]')) return;
  if (t.closest('.terminal-body')) return; // let users click inside output without focus stealing
  input.focus();
});

/* Traffic-light dots — inline confirm for red */
const dotRed    = /** @type {HTMLButtonElement} */ (document.getElementById('dot-red'));
const dotYellow = /** @type {HTMLButtonElement} */ (document.getElementById('dot-yellow'));
const dotGreen  = /** @type {HTMLButtonElement} */ (document.getElementById('dot-green'));

dotRed.addEventListener('click', () => {
  if (!redDotConfirming) {
    redDotConfirming = true;
    dotRed.classList.add('confirming');
    dotRed.setAttribute('aria-label', 'Click again to confirm — close session');
    if (redDotTimer) clearTimeout(redDotTimer);
    redDotTimer = window.setTimeout(() => {
      redDotConfirming = false;
      dotRed.classList.remove('confirming');
      dotRed.setAttribute('aria-label', 'Close session');
    }, 2500);
    return;
  }
  redDotConfirming = false;
  dotRed.classList.remove('confirming');
  CMD.exit();
});

dotYellow.addEventListener('click', () => win.classList.toggle('minimized'));
dotGreen.addEventListener('click', () => win.classList.toggle('maximized'));

/* =================== THEME =================== */

/** Read the current theme from the body's data-theme attribute. */
function getTheme() {
  return document.body.getAttribute('data-theme') || '';
}

/** Apply a theme by setting / removing the data-theme attribute,
 *  and persist the choice. Empty string = default theme (no attribute). */
function setTheme(t) {
  if (t) document.body.setAttribute('data-theme', t);
  else   document.body.removeAttribute('data-theme');
  try {
    if (t) localStorage.setItem('said-theme', t);
    else   localStorage.removeItem('said-theme');
  } catch (e) {}
}

/* Cross-tab theme sync */
window.addEventListener('storage', (e) => {
  if (e.key === 'said-theme') setTheme(e.newValue || '');
});

/* Restore theme on load */
try {
  const saved = localStorage.getItem('said-theme');
  if (saved) setTheme(saved);
} catch (e) {}

/* =================== BOOT =================== */

/* Touch / mobile detection — primary input is a coarse pointer (finger).
   This is the right signal for "phone or tablet without keyboard" — it
   correctly returns false for hybrid laptops with touch screens. */
const IS_TOUCH = (() => {
  try {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  } catch (e) {
    return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  }
})();

const BOOT_DISMISS_COPY = IS_TOUCH
  ? 'Tap anywhere to continue'
  : 'Press Enter to continue';

const BOOT_LINES = [
  { delay: 0,    text: 'Initializing portfolio system...' },
  { delay: 350,  text: 'Loading design tokens...' },
  { delay: 700,  text: 'Mounting component library...' },
  { delay: 1050, text: '<span class="boot-bar"></span><span class="boot-bar-label">done</span>' },
  { delay: 2900, text: '' },
  { delay: 2950, text: 'Resolving 2+ years of freelance experience...' },
  { delay: 3300, text: 'Connecting to said.dev core... <span class="ok">ok</span>' },
  { delay: 3650, text: '' },
  { delay: 3700, text: 'Python runtime: <span class="ok">operational</span>' },
  { delay: 3900, text: 'React modules: <span class="ok">loaded</span>' },
  { delay: 4100, text: 'AI tooling: <span class="ok">engaged</span>' },
  { delay: 4300, text: '' },
  { delay: 4400, text: '<span class="t-accent">✦</span>' },
  { delay: 4550, text: '<span class="ready">said.mammadov v1.0</span> -- ready.' },
  { delay: 4700, text: `<span class="press-enter">${BOOT_DISMISS_COPY}<span class="boot-cursor">▍</span></span>` },
];
const BOOT_END = 4700;
const BOOT_FAILSAFE = 7000;

function bootSequence(skipDirectTo) {
  body.innerHTML = '';
  input.disabled = true;
  input.placeholder = 'booting...';

  const wrap = document.createElement('div');
  wrap.className = 'boot';
  if (IS_TOUCH) wrap.classList.add('boot-tappable');
  body.appendChild(wrap);

  const timers = [];
  BOOT_LINES.forEach(l => {
    timers.push(window.setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'boot-line';
      div.innerHTML = l.text || '&nbsp;';
      wrap.appendChild(div);
      if (div.scrollIntoView) div.scrollIntoView({ block: 'end' });
    }, l.delay));
  });

  // Failsafe: force visibility if animations got blocked
  timers.push(window.setTimeout(() => {
    wrap.querySelectorAll('.boot-line').forEach(el => {
      /** @type {HTMLElement} */ (el).style.opacity = '1';
    });
  }, BOOT_FAILSAFE));

  let dismissed = false;
  const ready = () => {
    if (dismissed) return;
    dismissed = true;
    timers.forEach(t => clearTimeout(t));
    document.removeEventListener('keydown', onKey, true);
    win.removeEventListener('pointerup', onTap, true);
    win.removeEventListener('touchend', onTap, true);
    input.disabled = false;
    input.placeholder = "type 'help' to see available commands...";
    renderWelcome();
    body.setAttribute('aria-live', 'polite');
    if (skipDirectTo) run(skipDirectTo);
    // On touch we DO NOT auto-focus the input — that would pop up the
    // keyboard immediately and shove the welcome screen off-screen on
    // small viewports. Desktop still focuses for the typing experience.
    if (!IS_TOUCH) input.focus();
  };

  const onKey = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      ready();
    }
  };

  // Touch handler — fires on pointer release inside the terminal window.
  // We attach BOTH pointerup and touchend because Safari iOS still has
  // edge cases where pointerup is suppressed during scroll-blocking.
  const onTap = (/** @type {Event} */ e) => {
    // Ignore if the user is interacting with the disabled input area —
    // they'd never see the boot anyway, but be defensive.
    const t = /** @type {HTMLElement} */ (e.target);
    if (t && t.closest && t.closest('.input-area')) return;
    e.preventDefault();
    ready();
  };

  // Listen from boot completion onward.
  window.setTimeout(() => {
    document.addEventListener('keydown', onKey, true);
    if (IS_TOUCH) {
      win.addEventListener('pointerup', onTap, true);
      win.addEventListener('touchend',  onTap, true);
    }
  }, BOOT_END);
}

/* =================== DEEP LINKING =================== */

function getDeepLinkCmd() {
  const params = new URLSearchParams(window.location.search);
  const cmd = (params.get('cmd') || '').toLowerCase().replace(/^\//, '');
  if (cmd && /** @type {any} */ (COMMANDS)[cmd]) return cmd;
  // Hash form: #cmd=projects or just #projects
  const hash = window.location.hash.replace(/^#/, '').replace(/^cmd=/, '');
  if (hash && /** @type {any} */ (COMMANDS)[hash]) return hash;
  return null;
}

const deepCmd = getDeepLinkCmd();
bootSequence(deepCmd);
