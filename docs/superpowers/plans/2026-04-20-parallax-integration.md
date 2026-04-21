# BRF Parallax Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the non-functional footer-only parallax in the BRF site with a full-page GSAP + ScrollTrigger + Lenis parallax using `position: fixed` layers — the same technique proven in `parallax-test.html`.

**Architecture:** Four `position: fixed` layers (sky, far trees, near trees, fence) sit behind all page content. GSAP ScrollTrigger scrubs each layer's `translateY` at a different rate as the user scrolls the full page. Content sections (services, about, contact) have solid opaque backgrounds so they're readable; the parallax scene is fully visible in the hero and footer areas. The old footer-parallax approach (absolute layers inside a fixed-height container) is removed entirely.

**Tech Stack:** GSAP 3.12.5 (cdnjs), ScrollTrigger 3.12.5 (cdnjs), Lenis 1.3.23 (unpkg), vanilla HTML/CSS — no build step.

---

## File Structure

```
site-brf-azure/
├── index.html     ← Add 4 fixed layer divs, remove hero-bg div, replace footer, add CDN scripts
├── styles.css     ← Add layer CSS, remove old parallax CSS, update hero + sections + footer
└── app.js         ← Replace old scroll handler with GSAP + Lenis setup
```

**SVG source:** The tree and fence SVGs already exist verbatim in `/ops/sites/BRF/site-brf-azure/parallax-test.html`. Read them from there — do not regenerate.

---

## Task 1: Add fixed layer HTML to index.html

**Files:**
- Modify: `index.html`

The four parallax layer divs go as the **first children of `<body>`**, before the hero section. The SVG content is copied verbatim from `parallax-test.html` — read that file to get it.

- [ ] **Step 1: Read the SVG content from the test page**

Read `/ops/sites/BRF/site-brf-azure/parallax-test.html` and extract:
- The `.layer-sky` div (just the div itself — it has no SVG, it's a CSS gradient)
- The `.layer-trees-back` div and its full SVG content
- The `.layer-trees-front` div and its full SVG content
- The `.layer-fence` div and its full SVG content

- [ ] **Step 2: Insert the four layer divs into index.html**

In `index.html`, immediately after `<body>` and before `<!-- ── Hero ─`, insert the four layer divs copied from `parallax-test.html`. The result should look like:

```html
<body>

  <!-- ── Parallax layers (fixed to viewport) ── -->
  <div class="layer layer-sky"></div>
  <div class="layer layer-trees-back">
    <svg viewBox="0 0 1440 2200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <!-- ... full SVG from parallax-test.html ... -->
    </svg>
  </div>
  <div class="layer layer-trees-front">
    <svg viewBox="0 0 1440 2600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <!-- ... full SVG from parallax-test.html ... -->
    </svg>
  </div>
  <div class="layer layer-fence">
    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <!-- ... full SVG from parallax-test.html ... -->
    </svg>
  </div>

  <!-- ── Hero ── -->
  <section class="hero" id="hero">
    ...
```

- [ ] **Step 3: Remove the hero-bg div**

Find and delete this line from the hero section:
```html
    <div class="hero-bg"></div>
```

The parallax sky layer is now the hero background. The hero-content div with the headline/tagline/CTA stays untouched.

- [ ] **Step 4: Replace the old footer**

Find the entire `<footer class="footer-parallax" ...>` block — it starts with:
```html
<footer class="footer-parallax" id="footer" aria-label="Site footer">
```
and ends with `</footer>`.

Delete the entire block and replace it with:
```html
<!-- ── Footer ── -->
<footer class="site-footer">
  <p class="footer-copy">&copy; 2026 Built Right Fencing and Tree Planting Services. Prince Edward Island.</p>
  <a href="mailto:robjmacd@gmail.com" class="footer-email">robjmacd@gmail.com</a>
</footer>
```

- [ ] **Step 5: Add CDN scripts before app.js**

Find the existing `<script src="app.js"></script>` at the bottom of body.

Replace it with:
```html
  <script src="https://unpkg.com/lenis@1.3.23/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="app.js"></script>
```

Order matters: Lenis → GSAP → ScrollTrigger → app.js.

- [ ] **Step 6: Verify index.html structure**

```bash
grep -n "layer-sky\|layer-trees\|layer-fence\|hero-bg\|footer-parallax\|site-footer\|lenis\|gsap\|ScrollTrigger" /ops/sites/BRF/site-brf-azure/index.html
```

Expected output:
- Lines for `layer-sky`, `layer-trees-back`, `layer-trees-front`, `layer-fence` near the top
- NO line containing `hero-bg`
- NO line containing `footer-parallax`
- A line for `site-footer`
- Lines for `lenis`, `gsap`, `ScrollTrigger` CDN scripts

- [ ] **Step 7: Commit**

```bash
cd /ops/sites/BRF/site-brf-azure
git add index.html
git commit -m "feat: add fixed parallax layers, remove hero-bg, replace footer"
```

---

## Task 2: Update styles.css

**Files:**
- Modify: `styles.css`

This task replaces old parallax CSS with new fixed-layer CSS, updates the hero to work without its own background, ensures content sections have z-index to float over the fixed layers, and adds a simple footer style.

- [ ] **Step 1: Add fixed layer CSS**

After the existing `/* ── Utility ── */` block and before `/* ── Hero ── */`, insert:

```css
/* ── Parallax fixed layers ────────────────────────── */
.layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  will-change: transform;
}

.layer-sky {
  height: 100vh;
  z-index: 0;
  background: linear-gradient(to bottom,
    #1e4d72 0%, #2c6e9e 15%, #4a90c4 35%,
    #87ceeb 60%, #c8e6f5 80%, #a8d5b5 100%
  );
}

.layer-trees-back  { height: 220vh; z-index: 1; }
.layer-trees-front { height: 260vh; z-index: 2; }
.layer-fence       { height: 35vh;  z-index: 3; }

.layer svg { width: 100%; height: 100%; }
```

- [ ] **Step 2: Update the hero block**

Replace the existing `.hero`, `.hero-bg`, and `.hero-bg::after` rules with:

```css
/* ── Hero ─────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
```

`.hero-bg` and `.hero-bg::after` are deleted entirely — the parallax sky IS the hero background now.

`.hero-content`, `.hero-title`, `.hero-sub` rules stay untouched.

- [ ] **Step 3: Add z-index to content sections**

Each section needs `position: relative; z-index: 10` to float above the fixed parallax layers. Modify these existing rules:

```css
/* ── Services ──────────────────────────────────────── */
.services {
  position: relative;
  z-index: 10;
  background: #fff;
}
```

```css
/* ── About ─────────────────────────────────────────── */
.about {
  position: relative;
  z-index: 10;
  background: var(--color-cream);
}
```

```css
/* ── Contact ───────────────────────────────────────── */
.contact {
  position: relative;
  z-index: 10;
  background: #fff;
}
```

- [ ] **Step 4: Remove old footer parallax CSS and add simple footer**

Delete the entire `/* ── Footer Parallax ── */` block (everything from `.footer-parallax {` through `.footer-email:hover { opacity: 1; }` at line 375). This removes: `.footer-parallax`, `.parallax-layer`, `.layer-trees-back`, `.layer-trees-front`, `.layer-fence`, `.trees-svg`, `.fence-svg`, `.footer-content`, `.footer-copy`, `.footer-email`, and `.footer-email:hover`.

In its place, add:

```css
/* ── Site footer ───────────────────────────────────── */
.site-footer {
  position: relative;
  z-index: 10;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
}

.footer-copy  { font-size: var(--font-size-sm); opacity: 0.8; }

.footer-email {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.footer-email:hover { opacity: 1; }
```

- [ ] **Step 5: Fix the responsive block**

In the `@media (max-width: 600px)` block, remove this line (old footer no longer exists):
```css
  .footer-parallax { height: 300px; }
```

- [ ] **Step 6: Verify no old parallax rules remain**

```bash
grep -n "footer-parallax\|parallax-layer\|trees-svg\|fence-svg\|footer-content\|hero-bg" /ops/sites/BRF/site-brf-azure/styles.css
```

Expected: no output (empty).

- [ ] **Step 7: Commit**

```bash
cd /ops/sites/BRF/site-brf-azure
git add styles.css
git commit -m "feat: replace footer parallax CSS with fixed layers and simple footer"
```

---

## Task 3: Replace app.js

**Files:**
- Modify: `app.js`

Replace the entire file with the GSAP + ScrollTrigger + Lenis setup. The old footer scroll handler is deleted.

- [ ] **Step 1: Write the new app.js**

Replace the full contents of `app.js` with:

```javascript
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const trigger = {
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.5
};

gsap.to('.layer-sky',         { y: '-15vh',  ease: 'none', scrollTrigger: trigger });
gsap.to('.layer-trees-back',  { y: '-60vh',  ease: 'none', scrollTrigger: trigger });
gsap.to('.layer-trees-front', { y: '-110vh', ease: 'none', scrollTrigger: trigger });

gsap.fromTo('.layer-fence',
  { y: '100vh' },
  { y: '65vh', ease: 'none', scrollTrigger: trigger }
);
```

- [ ] **Step 2: Verify app.js**

```bash
cat /ops/sites/BRF/site-brf-azure/app.js
```

Expected: the 17-line file above with no old scroll listener code.

- [ ] **Step 3: Commit**

```bash
cd /ops/sites/BRF/site-brf-azure
git add app.js
git commit -m "feat: replace scroll handler with GSAP ScrollTrigger + Lenis parallax"
```

---

## Task 4: Smoke check

**Files:** None — verification only.

- [ ] **Step 1: Check the live site**

The BRF site is served by the nginx container at `http://brf.its.lab`. Open it in a browser and verify:

| Check | Expected |
|-------|----------|
| Page loads without console errors | No red errors in DevTools console |
| Hero area | Sky gradient + treetops visible behind headline/tagline/CTA |
| Scroll slowly from top | Trees drift upward at different rates — depth effect visible |
| Services section | White background, cards readable, parallax NOT visible (correct) |
| About section | Cream background, text readable |
| Contact section | White background, form and links visible |
| ~80% scroll | Fence pickets beginning to appear at bottom of viewport |
| Bottom of page | Fence fully visible, simple footer text over the forest scene |
| No horizontal scrollbar | Page doesn't expand beyond viewport width |

- [ ] **Step 2: Check console for GSAP/Lenis errors**

Open DevTools console. Run:
```js
[typeof gsap, typeof ScrollTrigger, typeof Lenis].join(', ')
```
Expected: `"object, object, function"`

- [ ] **Step 3: Check computed position on a layer**

```js
getComputedStyle(document.querySelector('.layer-trees-back')).position
```
Expected: `"fixed"`

- [ ] **Step 4: Commit any fixes, then log the change**

If all checks pass, append to `/ops/docs/change-log.md`:

```
## 2026-04-20 — BRF parallax integration
- Replaced footer-only parallax with full-page GSAP + ScrollTrigger + Lenis
- Fixed layers: sky, trees-back (220vh), trees-front (260vh), fence (35vh)
- Removed hero-bg SVG and old footer-parallax structure
- Libraries: GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.3.23 (all CDN)
```

---

## Self-Review

| Requirement | Covered in |
|---|---|
| Fixed layers added to index.html | Task 1 Step 2 |
| hero-bg div removed | Task 1 Step 3 |
| Old footer-parallax replaced with simple footer | Task 1 Step 4 |
| CDN scripts added in correct order | Task 1 Step 5 |
| Fixed layer CSS added | Task 2 Step 1 |
| Hero z-index: 10, no background | Task 2 Step 2 |
| Content sections z-index: 10 | Task 2 Step 3 |
| Old footer CSS removed | Task 2 Step 4 |
| Simple site-footer CSS | Task 2 Step 4 |
| app.js replaced with GSAP + Lenis | Task 3 |
| Site visually verified | Task 4 |
