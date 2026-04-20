# BRF Website — Built Right Fencing and Tree Planting Services

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-page parallax scrolling website for Built Right Fencing and Tree Planting Services at `builtrightfencing.ca` on Azure Static Web Apps.

**Architecture:** Pure vanilla HTML/CSS/JS — no build step, no framework. A single `index.html` with all five sections (Hero, Services, About, Contact, Footer). The standout feature is a 3-layer parallax footer scene (sky → trees → fence) driven by a scroll event listener with `requestAnimationFrame`. Deployed via GitHub Actions → Azure Static Web Apps on every push to `main`.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (ES6), Azure Static Web Apps, GitHub Actions (`Azure/static-web-apps-deploy@v1`), Formspree (contact form backend), Google Fonts (Inter)

---

## File Structure

```
site-brf-azure/
├── index.html                         # Single page — all five sections
├── styles.css                         # All styles, CSS custom properties, media queries
├── app.js                             # Parallax scroll handler only
├── assets/
│   ├── images/
│   │   └── hero-bg.svg               # Hero background (gradient scene, until real photo)
│   └── icons/
│       ├── email.svg
│       ├── phone.svg
│       └── facebook.svg
├── staticwebapp.config.json           # Azure SWA routing + security headers
└── .github/
    └── workflows/
        └── deploy-brf.yml             # Push to main → Azure SWA deploy
```

**What lives where:**
- `index.html` — document structure, all section markup, inline SVGs for footer parallax layers (tree silhouettes, fence). Inline SVGs avoid extra HTTP requests for decorative assets.
- `styles.css` — CSS custom properties (color palette, typography scale), section-specific layout, parallax layer positioning, and all responsive breakpoints. One file, organized by section.
- `app.js` — scroll event listener only. Reads footer position, computes scroll progress, applies `translateY` to the three parallax layers. No DOM manipulation beyond this.
- `staticwebapp.config.json` — tells Azure SWA to serve `index.html` for all routes, plus security headers.
- `deploy-brf.yml` — mirrors ITS workflow exactly, but with `output_location: ""` (no build step, serve files as-is).

---

## Pre-Requisites (do these before Task 1)

- [ ] Create an Azure Static Web App resource in Azure Portal (or CLI) for `site-brf-azure`. Name it `brf-website` or similar.
- [ ] Copy the deployment API token from Azure Portal → Static Web App → Manage deployment token.
- [ ] In GitHub repo `it-sidekick/site-brf-azure` → Settings → Secrets → Actions: add secret `AZURE_STATIC_WEB_APPS_API_TOKEN` with that token value.
- [ ] Sign up at https://formspree.io, create a new form pointed at `robjmacd@gmail.com`, copy the form endpoint ID (format: `https://formspree.io/f/XXXXXXXX`).

---

## Task 1: CI/CD Pipeline + Repo Scaffold

**Files:**
- Create: `.github/workflows/deploy-brf.yml`
- Create: `staticwebapp.config.json`
- Create: `index.html` (empty shell)
- Create: `styles.css` (empty)
- Create: `app.js` (empty)

- [ ] **Step 1: Create the GitHub Actions workflow**

Create `.github/workflows/deploy-brf.yml`:

```yaml
name: Deploy BRF to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]
  workflow_dispatch:

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ""

      - name: Notify webhook
        if: always()
        run: |
          curl -s -X POST http://127.0.0.1/webhook \
            -H 'Host: webhook.its.lab' \
            -H 'Content-Type: application/json' \
            -d '{"event":"deploy","repo":"site-brf-azure","status":"${{ job.status }}"}'
        continue-on-error: true

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

- [ ] **Step 2: Create Azure SWA config**

Create `staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.css", "*.js"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
}
```

- [ ] **Step 3: Create empty stub files**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Built Right Fencing and Tree Planting Services</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- sections go here -->
  <script src="app.js"></script>
</body>
</html>
```

Create `styles.css` (empty file).

Create `app.js` (empty file).

Create `assets/images/` and `assets/icons/` directories (add a `.gitkeep` in each).

- [ ] **Step 4: Create icon SVGs**

Create `assets/icons/email.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
</svg>
```

Create `assets/icons/phone.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.4 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
</svg>
```

Create `assets/icons/facebook.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
</svg>
```

- [ ] **Step 5: Initial commit**

```bash
git add .
git commit -m "feat: scaffold repo, CI pipeline, SWA config"
```

---

## Task 2: CSS Foundation

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Write CSS custom properties, reset, and typography**

Replace `styles.css` with:

```css
/* ── Custom Properties ─────────────────────────────── */
:root {
  --color-green-dark:  #1a3d2b;
  --color-green-mid:   #2d6a4f;
  --color-green-light: #74b49b;
  --color-brown-dark:  #3d2b1f;
  --color-brown-mid:   #8b7355;
  --color-tan:         #d4b896;
  --color-cream:       #f5f0e8;
  --color-charcoal:    #2c2c2c;
  --color-sky-top:     #87ceeb;
  --color-sky-bottom:  #c8e6f5;

  --font-family: 'Inter', sans-serif;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.25rem;
  --font-size-xl:   1.75rem;
  --font-size-2xl:  2.5rem;
  --font-size-3xl:  3.5rem;

  --space-xs:  0.5rem;
  --space-sm:  1rem;
  --space-md:  2rem;
  --space-lg:  4rem;
  --space-xl:  6rem;

  --max-width: 1100px;
  --radius:    8px;
}

/* ── Reset ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-charcoal);
  background: var(--color-cream);
  line-height: 1.6;
}

img, svg { display: block; max-width: 100%; }

a { color: inherit; text-decoration: none; }

/* ── Utility ───────────────────────────────────────── */
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.section {
  padding: var(--space-xl) 0;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-green-dark);
  margin-bottom: var(--space-md);
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in a browser (or `python3 -m http.server 8080` from the repo root). The page should be blank cream-colored with no errors in the console.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: CSS custom properties, reset, typography"
```

---

## Task 3: Hero Section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Create: `assets/images/hero-bg.svg`

- [ ] **Step 1: Create hero background SVG**

Create `assets/images/hero-bg.svg` — a gradient sky-to-field scene as hero placeholder:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a90c4"/>
      <stop offset="100%" stop-color="#87ceeb"/>
    </linearGradient>
    <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a7d44"/>
      <stop offset="100%" stop-color="#2d6a4f"/>
    </linearGradient>
  </defs>
  <!-- Sky -->
  <rect width="1440" height="380" fill="url(#sky)"/>
  <!-- Field -->
  <rect y="360" width="1440" height="240" fill="url(#field)"/>
  <!-- Horizon blend -->
  <ellipse cx="720" cy="370" rx="900" ry="60" fill="#4a9b5a" opacity="0.6"/>
  <!-- Tree silhouettes on horizon -->
  <g fill="#1a3d2b" opacity="0.8">
    <polygon points="180,360 160,420 200,420"/>
    <polygon points="185,330 155,380 215,380"/>
    <polygon points="190,310 165,355 215,355"/>
    <polygon points="1260,360 1240,420 1280,420"/>
    <polygon points="1265,330 1235,380 1295,380"/>
    <polygon points="1270,305 1245,355 1295,355"/>
    <polygon points="700,350 675,415 725,415"/>
    <polygon points="705,320 672,368 738,368"/>
    <polygon points="710,298 682,342 738,342"/>
  </g>
</svg>
```

- [ ] **Step 2: Add hero HTML to index.html**

Inside `<body>`, before `<script>`, add:

```html
<!-- ── Hero ───────────────────────────────────────── -->
<section class="hero" id="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <h1 class="hero-title">Built Right Fencing<br>and Tree Planting</h1>
    <p class="hero-sub">Honest work. Rooted in PEI.</p>
    <a href="#contact" class="btn btn-primary">Get a Quote</a>
  </div>
</section>
```

- [ ] **Step 3: Add hero CSS to styles.css**

Append to `styles.css`:

```css
/* ── Hero ──────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('assets/images/hero-bg.svg') center center / cover no-repeat;
  z-index: 0;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(26, 61, 43, 0.45);
}

.hero-content {
  position: relative;
  z-index: 1;
  color: #fff;
  padding: var(--space-md);
}

.hero-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: var(--space-sm);
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.hero-sub {
  font-size: var(--font-size-xl);
  font-weight: 400;
  margin-bottom: var(--space-md);
  opacity: 0.92;
}

.btn {
  display: inline-block;
  padding: 0.85rem 2.2rem;
  border-radius: var(--radius);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn:active { transform: scale(0.98); }

.btn-primary {
  background: var(--color-green-mid);
  color: #fff;
  border: 2px solid transparent;
}

.btn-primary:hover { background: var(--color-green-dark); }
```

- [ ] **Step 4: Verify in browser**

Open `index.html`. You should see a full-viewport hero with the SVG landscape background, a dark green overlay, the headline "Built Right Fencing and Tree Planting", the tagline, and a green CTA button. The button should scroll to `#contact` (section doesn't exist yet — that's fine).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css assets/images/hero-bg.svg
git commit -m "feat: hero section with gradient SVG background and CTA"
```

---

## Task 4: Services Section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add services HTML**

After the closing `</section>` of hero, add:

```html
<!-- ── Services ───────────────────────────────────── -->
<section class="section services" id="services">
  <div class="container">
    <h2 class="section-title">What We Do</h2>
    <div class="services-grid">

      <div class="service-card">
        <div class="service-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="8" y="30" width="48" height="6" rx="2" fill="currentColor"/>
            <rect x="8" y="46" width="48" height="6" rx="2" fill="currentColor"/>
            <rect x="12" y="20" width="8" height="36" rx="2" fill="currentColor"/>
            <polygon points="12,20 16,8 20,20" fill="currentColor"/>
            <rect x="28" y="20" width="8" height="36" rx="2" fill="currentColor"/>
            <polygon points="28,20 32,8 36,20" fill="currentColor"/>
            <rect x="44" y="20" width="8" height="36" rx="2" fill="currentColor"/>
            <polygon points="44,20 48,8 52,20" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="service-title">Fencing</h3>
        <p class="service-desc">Decks, posts, rail fencing — built to last. We use quality materials and take pride in clean, lasting work.</p>
      </div>

      <div class="service-card">
        <div class="service-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="29" y="32" width="6" height="26" rx="2" fill="currentColor"/>
            <polygon points="32,4 14,36 50,36" fill="currentColor"/>
            <polygon points="32,16 18,40 46,40" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
        <h3 class="service-title">Tree Planting</h3>
        <p class="service-desc">From seedling to canopy. We plant it right — proper depth, proper spacing, proper care from day one.</p>
      </div>

      <div class="service-card">
        <div class="service-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="29" y="36" width="6" height="22" rx="2" fill="currentColor"/>
            <polygon points="32,8 18,38 46,38" fill="currentColor"/>
            <line x1="46" y1="18" x2="54" y2="10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <circle cx="56" cy="8" r="4" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="service-title">Tree Care</h3>
        <p class="service-desc">Pruning, removal, and maintenance. Healthy trees, safe property. We handle it all with care.</p>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add services CSS**

Append to `styles.css`:

```css
/* ── Services ──────────────────────────────────────── */
.services {
  background: #fff;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.service-card {
  background: var(--color-cream);
  border-radius: var(--radius);
  padding: var(--space-md);
  text-align: center;
  border: 1px solid rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}

.service-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-sm);
  color: var(--color-green-mid);
}

.service-icon svg { width: 100%; height: 100%; }

.service-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-green-dark);
  margin-bottom: var(--space-xs);
}

.service-desc {
  font-size: var(--font-size-sm);
  color: #555;
  line-height: 1.7;
}
```

- [ ] **Step 3: Verify in browser**

Scroll past hero. Services section should show three cards side-by-side with icons, titles, and descriptions. Cards should lift slightly on hover.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: services section with three cards"
```

---

## Task 5: About Section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add about HTML**

After the services `</section>`, add:

```html
<!-- ── About ──────────────────────────────────────── -->
<section class="section about" id="about">
  <div class="container about-layout">
    <div class="about-text">
      <h2 class="section-title">About Us</h2>
      <p>Built Right started in 2026 with one goal — do the job right the first time. Based in Prince Edward Island, we serve residential and commercial clients across the island.</p>
      <p>No shortcuts, no surprises. We show up when we say we will, we use materials that last, and we leave your property cleaner than we found it.</p>
      <p>When you hire Built Right, you get honest people doing honest work. That's the whole story.</p>
    </div>
    <div class="about-accent" aria-hidden="true">
      <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <!-- Layered tree illustration -->
        <rect x="90" y="200" width="20" height="60" rx="4" fill="#3d2b1f"/>
        <polygon points="100,140 60,210 140,210" fill="#1a3d2b"/>
        <polygon points="100,100 65,165 135,165" fill="#2d6a4f"/>
        <polygon points="100,60 70,120 130,120" fill="#3a7d5a"/>
        <polygon points="100,20 78,75 122,75" fill="#4a9b6a"/>
        <!-- Ground -->
        <ellipse cx="100" cy="258" rx="70" ry="10" fill="#2d6a4f" opacity="0.3"/>
      </svg>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add about CSS**

Append to `styles.css`:

```css
/* ── About ─────────────────────────────────────────── */
.about {
  background: var(--color-cream);
}

.about-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-lg);
  align-items: center;
}

.about-text p {
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-base);
  color: #444;
  max-width: 560px;
}

.about-accent svg {
  width: 100%;
  height: auto;
  opacity: 0.85;
}
```

- [ ] **Step 3: Verify in browser**

About section should show text on the left, layered tree illustration on the right.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: about section with company story and tree illustration"
```

---

## Task 6: Contact Section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

> **Before this task:** You need a Formspree form ID. Sign in at https://formspree.io, create a form with `robjmacd@gmail.com` as the destination, and replace `YOUR_FORMSPREE_ID` in the HTML below with the actual ID (e.g., `xpwzabcd`).

- [ ] **Step 1: Add contact HTML**

After the about `</section>`, add:

```html
<!-- ── Contact ────────────────────────────────────── -->
<section class="section contact" id="contact">
  <div class="container">
    <h2 class="section-title">Get in Touch</h2>
    <div class="contact-layout">

      <div class="contact-info">
        <a href="mailto:robjmacd@gmail.com" class="contact-item">
          <img src="assets/icons/email.svg" alt="" class="contact-icon" aria-hidden="true">
          <span>robjmacd@gmail.com</span>
        </a>
        <a href="tel:+19022144251" class="contact-item">
          <img src="assets/icons/phone.svg" alt="" class="contact-icon" aria-hidden="true">
          <span>(902) 214-4251</span>
        </a>
        <a href="https://www.facebook.com/people/Built-Right-Fencing-and-Tree-Planting-Services/61570965324422/" target="_blank" rel="noopener" class="contact-item">
          <img src="assets/icons/facebook.svg" alt="" class="contact-icon" aria-hidden="true">
          <span>Facebook</span>
        </a>
      </div>

      <form class="contact-form" action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required placeholder="Your name">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required placeholder="Tell us about your project…"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Send Message</button>
      </form>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add contact CSS**

Append to `styles.css`:

```css
/* ── Contact ───────────────────────────────────────── */
.contact {
  background: #fff;
}

.contact-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-lg);
  align-items: start;
  margin-top: var(--space-md);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-base);
  color: var(--color-charcoal);
  transition: color 0.2s;
}

.contact-item:hover { color: var(--color-green-mid); }

.contact-icon {
  width: 22px;
  height: 22px;
  color: var(--color-green-mid);
  flex-shrink: 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-green-dark);
}

.form-group input,
.form-group textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: var(--radius);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-charcoal);
  background: var(--color-cream);
  transition: border-color 0.2s;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-green-mid);
}
```

- [ ] **Step 3: Verify in browser**

Contact section should show contact links on left, form on right. Check that:
- Email, phone, Facebook links are present and formatted correctly
- Form fields have labels and placeholders
- Submit button is green and matches hero CTA style

Do NOT submit the form yet (Formspree ID is a placeholder).

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: contact section with info links and inquiry form"
```

---

## Task 7: Footer Parallax — HTML Structure + SVG Layers

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

The footer has three parallax layers stacked with z-index:
1. **Sky** — CSS gradient background (no DOM element needed, applied to `.footer-parallax`)
2. **Trees back** — distant tree silhouettes (smaller, mid-dark green)
3. **Trees front** — closer tree silhouettes (larger, dark green)
4. **Fence** — wood fence in foreground, starts below viewport edge and rises on scroll

- [ ] **Step 1: Add footer HTML**

After the contact `</section>`, add:

```html
<!-- ── Footer ─────────────────────────────────────── -->
<footer class="footer-parallax" id="footer" aria-label="Site footer">

  <!-- Layer 1: Back trees (move slowest) -->
  <div class="parallax-layer layer-trees-back" aria-hidden="true">
    <svg class="trees-svg" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <!-- Distributed spruce silhouettes — back row, shorter -->
      <g fill="#2d6a4f">
        <rect x="68" y="220" width="14" height="80" rx="3"/>
        <polygon points="75,120 40,230 110,230"/>
        <polygon points="75,160 45,215 105,215"/>
        <polygon points="75,140 50,198 100,198"/>

        <rect x="248" y="230" width="12" height="70" rx="3"/>
        <polygon points="254,135 222,240 286,240"/>
        <polygon points="254,168 226,225 282,225"/>
        <polygon points="254,148 230,205 278,205"/>

        <rect x="448" y="215" width="14" height="85" rx="3"/>
        <polygon points="455,110 418,225 492,225"/>
        <polygon points="455,148 422,210 488,210"/>
        <polygon points="455,128 425,192 485,192"/>

        <rect x="648" y="225" width="12" height="75" rx="3"/>
        <polygon points="654,128 620,235 688,235"/>
        <polygon points="654,162 624,220 684,220"/>
        <polygon points="654,142 628,202 680,202"/>

        <rect x="848" y="220" width="14" height="80" rx="3"/>
        <polygon points="855,118 818,230 892,230"/>
        <polygon points="855,155 822,215 888,215"/>
        <polygon points="855,135 825,197 885,197"/>

        <rect x="1048" y="228" width="12" height="72" rx="3"/>
        <polygon points="1054,130 1020,238 1088,238"/>
        <polygon points="1054,165 1024,222 1084,222"/>
        <polygon points="1054,145 1027,205 1081,205"/>

        <rect x="1248" y="218" width="14" height="82" rx="3"/>
        <polygon points="1255,115 1218,228 1292,228"/>
        <polygon points="1255,152 1222,213 1288,213"/>
        <polygon points="1255,132 1224,195 1286,195"/>

        <rect x="1388" y="222" width="12" height="78" rx="3"/>
        <polygon points="1394,120 1360,232 1428,232"/>
        <polygon points="1394,158 1364,217 1424,217"/>
        <polygon points="1394,138 1366,199 1422,199"/>
      </g>
    </svg>
  </div>

  <!-- Layer 2: Front trees (move faster) -->
  <div class="parallax-layer layer-trees-front" aria-hidden="true">
    <svg class="trees-svg" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <!-- Front row — taller, darker, gaps between back trees -->
      <g fill="#1a3d2b">
        <rect x="148" y="190" width="18" height="110" rx="4"/>
        <polygon points="157,60 108,205 206,205"/>
        <polygon points="157,100 112,188 202,188"/>
        <polygon points="157,78 115,170 199,170"/>

        <rect x="348" y="185" width="18" height="115" rx="4"/>
        <polygon points="357,55 304,200 410,200"/>
        <polygon points="357,94 308,184 406,184"/>
        <polygon points="357,73 311,166 403,166"/>

        <rect x="548" y="195" width="16" height="105" rx="4"/>
        <polygon points="556,68 510,208 602,208"/>
        <polygon points="556,104 514,192 598,192"/>
        <polygon points="556,83 516,174 596,174"/>

        <rect x="748" y="188" width="18" height="112" rx="4"/>
        <polygon points="757,58 708,202 806,202"/>
        <polygon points="757,96 712,185 802,185"/>
        <polygon points="757,75 714,167 800,167"/>

        <rect x="948" y="192" width="16" height="108" rx="4"/>
        <polygon points="956,63 910,206 1002,206"/>
        <polygon points="956,100 914,189 998,189"/>
        <polygon points="956,80 916,171 996,171"/>

        <rect x="1148" y="186" width="18" height="114" rx="4"/>
        <polygon points="1157,55 1106,200 1208,200"/>
        <polygon points="1157,93 1110,183 1204,183"/>
        <polygon points="1157,72 1112,165 1202,165"/>

        <rect x="1338" y="190" width="16" height="110" rx="4"/>
        <polygon points="1346,62 1300,204 1392,204"/>
        <polygon points="1346,99 1304,188 1388,188"/>
        <polygon points="1346,79 1306,170 1386,170"/>
      </g>
    </svg>
  </div>

  <!-- Layer 3: Fence (rises from below on scroll) -->
  <div class="parallax-layer layer-fence" aria-hidden="true">
    <svg class="fence-svg" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
      <!-- Horizontal rails -->
      <rect x="0" y="60" width="1440" height="18" rx="4" fill="#8b7355"/>
      <rect x="0" y="120" width="1440" height="18" rx="4" fill="#7a6445"/>
      <!-- Pickets (every 60px) -->
      <g fill="#a08060">
        <!-- generate 24 pickets across 1440px -->
        <rect x="10"   y="0" width="40" height="180" rx="3"/>
        <polygon points="30,0 10,20 50,20"/>
        <rect x="70"   y="0" width="40" height="180" rx="3"/>
        <polygon points="90,0 70,20 110,20"/>
        <rect x="130"  y="0" width="40" height="180" rx="3"/>
        <polygon points="150,0 130,20 170,20"/>
        <rect x="190"  y="0" width="40" height="180" rx="3"/>
        <polygon points="210,0 190,20 230,20"/>
        <rect x="250"  y="0" width="40" height="180" rx="3"/>
        <polygon points="270,0 250,20 290,20"/>
        <rect x="310"  y="0" width="40" height="180" rx="3"/>
        <polygon points="330,0 310,20 350,20"/>
        <rect x="370"  y="0" width="40" height="180" rx="3"/>
        <polygon points="390,0 370,20 410,20"/>
        <rect x="430"  y="0" width="40" height="180" rx="3"/>
        <polygon points="450,0 430,20 470,20"/>
        <rect x="490"  y="0" width="40" height="180" rx="3"/>
        <polygon points="510,0 490,20 530,20"/>
        <rect x="550"  y="0" width="40" height="180" rx="3"/>
        <polygon points="570,0 550,20 590,20"/>
        <rect x="610"  y="0" width="40" height="180" rx="3"/>
        <polygon points="630,0 610,20 650,20"/>
        <rect x="670"  y="0" width="40" height="180" rx="3"/>
        <polygon points="690,0 670,20 710,20"/>
        <rect x="730"  y="0" width="40" height="180" rx="3"/>
        <polygon points="750,0 730,20 770,20"/>
        <rect x="790"  y="0" width="40" height="180" rx="3"/>
        <polygon points="810,0 790,20 830,20"/>
        <rect x="850"  y="0" width="40" height="180" rx="3"/>
        <polygon points="870,0 850,20 890,20"/>
        <rect x="910"  y="0" width="40" height="180" rx="3"/>
        <polygon points="930,0 910,20 950,20"/>
        <rect x="970"  y="0" width="40" height="180" rx="3"/>
        <polygon points="990,0 970,20 1010,20"/>
        <rect x="1030" y="0" width="40" height="180" rx="3"/>
        <polygon points="1050,0 1030,20 1070,20"/>
        <rect x="1090" y="0" width="40" height="180" rx="3"/>
        <polygon points="1110,0 1090,20 1130,20"/>
        <rect x="1150" y="0" width="40" height="180" rx="3"/>
        <polygon points="1170,0 1150,20 1190,20"/>
        <rect x="1210" y="0" width="40" height="180" rx="3"/>
        <polygon points="1230,0 1210,20 1250,20"/>
        <rect x="1270" y="0" width="40" height="180" rx="3"/>
        <polygon points="1290,0 1270,20 1310,20"/>
        <rect x="1330" y="0" width="40" height="180" rx="3"/>
        <polygon points="1350,0 1330,20 1370,20"/>
        <rect x="1390" y="0" width="40" height="180" rx="3"/>
        <polygon points="1410,0 1390,20 1430,20"/>
      </g>
    </svg>
  </div>

  <!-- Footer content -->
  <div class="footer-content">
    <p class="footer-copy">&copy; 2026 Built Right Fencing and Tree Planting Services. Prince Edward Island.</p>
    <a href="mailto:robjmacd@gmail.com" class="footer-email">robjmacd@gmail.com</a>
  </div>

</footer>
```

- [ ] **Step 2: Add footer layout CSS**

Append to `styles.css`:

```css
/* ── Footer Parallax ───────────────────────────────── */
.footer-parallax {
  position: relative;
  height: 420px;
  overflow: hidden;
  background: linear-gradient(to bottom, var(--color-sky-top) 0%, var(--color-sky-bottom) 60%, #a8d5b5 100%);
}

.parallax-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  will-change: transform;
}

.layer-trees-back  { z-index: 1; bottom: 0; }
.layer-trees-front { z-index: 2; bottom: 0; }
.layer-fence       { z-index: 3; bottom: 0; }

.trees-svg,
.fence-svg {
  display: block;
  width: 100%;
  height: auto;
}

.footer-content {
  position: absolute;
  bottom: var(--space-sm);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
  color: var(--color-green-dark);
}

.footer-copy {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.footer-email {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.footer-email:hover { opacity: 1; }
```

- [ ] **Step 3: Verify static layout in browser**

Without JS yet, scroll to the bottom. You should see:
- Sky gradient background
- Two rows of spruce tree silhouettes (back row lighter/smaller, front row darker/taller)
- Fence spanning the full width in front of the trees
- Footer text at the bottom

The layering depth effect should already be visible even without scroll animation.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: footer parallax HTML structure with SVG tree and fence layers"
```

---

## Task 8: Parallax Scroll JS

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Write the scroll handler**

Replace `app.js` with:

```javascript
(function () {
  const footer = document.getElementById('footer');
  const treesBack  = footer.querySelector('.layer-trees-back');
  const treesFront = footer.querySelector('.layer-trees-front');
  const fence      = footer.querySelector('.layer-fence');

  function getScrollProgress() {
    const rect = footer.getBoundingClientRect();
    const windowH = window.innerHeight;
    // 0 when footer top hits bottom of viewport, 1 when footer top reaches top
    return Math.max(0, Math.min(1, (windowH - rect.top) / windowH));
  }

  function applyParallax() {
    const p = getScrollProgress();
    // Trees drift upward as footer comes into view
    treesBack.style.transform  = `translateY(${p * -40}px)`;
    treesFront.style.transform = `translateY(${p * -20}px)`;
    // Fence rises from below: starts 80px down, ends at 0
    fence.style.transform      = `translateY(${(1 - p) * 80}px)`;
  }

  window.addEventListener('scroll', applyParallax, { passive: true });

  // Run once on load in case page loads already scrolled
  applyParallax();
}());
```

- [ ] **Step 2: Verify parallax in browser**

Open `index.html`, scroll down slowly to the footer. Confirm:
- Trees drift upward as the footer enters the viewport
- Fence rises from below the footer edge and settles into position
- The 3D depth illusion is visible: sky → trees → fence foreground
- No jank or console errors

If the effect feels too subtle, adjust multipliers (`-40`, `-20`, `80`) up. If too aggressive, reduce them.

- [ ] **Step 3: Test on mobile viewport**

In browser DevTools, switch to a mobile viewport (375×812). Scroll to footer. The effect should still work. If `background-attachment: fixed` causes issues (common on iOS Safari), it doesn't apply here — our approach uses JS transforms which work correctly on mobile.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: parallax scroll handler for footer layers"
```

---

## Task 9: Responsive — Mobile & Tablet

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add responsive breakpoints**

Append to `styles.css`:

```css
/* ── Responsive ────────────────────────────────────── */

/* Tablet: ≤ 900px */
@media (max-width: 900px) {
  :root {
    --font-size-3xl: 2.4rem;
    --font-size-2xl: 1.8rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  .about-layout {
    grid-template-columns: 1fr;
  }

  .about-accent {
    display: none;
  }

  .contact-layout {
    grid-template-columns: 1fr;
  }
}

/* Mobile: ≤ 600px */
@media (max-width: 600px) {
  :root {
    --font-size-3xl: 1.9rem;
    --font-size-2xl: 1.5rem;
    --space-xl: 4rem;
  }

  .hero-title { line-height: 1.2; }

  .container { padding: 0 var(--space-sm); }

  .footer-parallax { height: 300px; }
}
```

- [ ] **Step 2: Verify at mobile breakpoints**

In browser DevTools, test at these widths:
- 1200px — desktop: three service cards, about with tree illustration, contact two-column
- 900px — tablet: services stack to one column, about tree hidden, contact stacks
- 375px — mobile: everything single-column, font sizes reduced, footer shorter

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: responsive breakpoints for tablet and mobile"
```

---

## Task 10: Smoke Check + First Deploy

**Files:**
- No code changes — verification and deploy only

- [ ] **Step 1: Full visual smoke check**

Run a local server: `python3 -m http.server 8080` from `/ops/sites/BRF/site-brf-azure/`.

Open `http://localhost:8080` and walk through every section:

| Check | Expected |
|-------|----------|
| Hero loads | Full-viewport gradient scene, white headline, green CTA button |
| CTA click | Smooth scrolls to contact form |
| Services | Three cards with icons, hover lifts |
| About | Text left, tree illustration right (desktop) |
| Contact | Info links + form fields all present |
| Email link | Opens mail client to `robjmacd@gmail.com` |
| Phone link | `tel:+19022144251` |
| Facebook link | Opens in new tab, correct URL |
| Footer scroll | Trees drift, fence rises — no console errors |
| Mobile (375px DevTools) | All sections stack, footer shorter |

- [ ] **Step 2: Validate HTML**

```bash
npx --yes html-validate index.html
```

Expected: no errors. Fix any reported before proceeding.

- [ ] **Step 3: Confirm Formspree ID is set**

Open `index.html` and verify the form `action` contains a real Formspree ID (not `YOUR_FORMSPREE_ID`). If the placeholder is still there, get the ID from https://formspree.io and replace it now.

```bash
grep "YOUR_FORMSPREE_ID" index.html
```

Expected: no output (empty = placeholder replaced).

- [ ] **Step 4: Push to main**

```bash
git push origin main
```

- [ ] **Step 5: Confirm GitHub Actions run**

Go to `https://github.com/it-sidekick/site-brf-azure/actions` and confirm the deploy job passes. If it fails:
- Check that `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set in repo settings
- Check the Azure SWA resource exists and the token matches

- [ ] **Step 6: Verify live Azure URL**

Once the deploy completes, Azure provides a generated URL (e.g. `https://gentle-rock-0abc123.azurestaticapps.net`). Open it and repeat the smoke check from Step 1.

- [ ] **Step 7: Log the change**

Append to `/ops/docs/change-log.md`:

```
## 2026-04-20 — BRF website initial deploy
- New client: Built Right Fencing and Tree Planting Services
- Repo: it-sidekick/site-brf-azure
- Deploy: Azure Static Web Apps (generated URL, custom domain pending)
- Stack: vanilla HTML/CSS/JS, Formspree contact form
- Post-launch pending: custom domain builtrightfencing.ca, Cloudflare WAF, email routing
```

---

## Post-Launch Checklist (out of scope for this plan)

These follow after initial deploy — tracked separately:

- [ ] Point `builtrightfencing.ca` DNS to Azure SWA custom domain
- [ ] Confirm SSL certificate issued by Azure
- [ ] Set up Cloudflare email routing: `rob@builtrightfencing.ca` → `robjmacd@gmail.com`
- [ ] Update contact form email in `index.html` to `rob@builtrightfencing.ca`
- [ ] Add Cloudflare WAF rules for the domain
- [ ] Verify Facebook link goes to the correct page
- [ ] Replace hero SVG with real photo when client provides one

---

## Self-Review Against Spec

| Spec requirement | Covered in |
|---|---|
| Single-page parallax scrolling | Tasks 7–8 |
| Hero: company name, tagline, CTA | Task 3 |
| Services: Fencing, Tree Planting, Tree Care (not Firewood — spec updated) | Task 4 |
| About: PEI, started 2026, honest work | Task 5 |
| Contact: email, phone, Facebook, form | Task 6 |
| Footer 3-layer parallax (sky→trees→fence) | Tasks 7–8 |
| Fence rises over trees, 3D depth illusion | Task 8 |
| Earth tones, forest green, bark brown, tan | Task 2 (CSS vars) |
| Inter font from Google Fonts | Task 1 (HTML head) |
| No frameworks, pure CSS | All tasks |
| Azure SWA deploy | Task 1, Task 10 |
| Push to main = live | Task 1 |
| Mobile responsive | Task 9 |
| `builtrightfencing.ca` (post-launch) | Post-launch checklist |
| Cloudflare WAF (post-launch) | Post-launch checklist |
| Email routing (post-launch) | Post-launch checklist |

> Note: Spec says "Firewood" as a service but the About/Services description says Fencing, Tree Planting, Tree Care. Used Tree Care as the third card to match the longer descriptions in the spec's Content section.
