# Phaelix Website

Last updated: 2026-01-11

## Table of Contents

<!-- TOC start -->
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Local Dev](#local-dev)
- [Deploy](#deploy)
- [Notes](#notes)
- [Status & License](#status--license)
<!-- TOC end -->

[![Lint](https://github.com/RaphaelGuerra/phaelix-website/actions/workflows/lint.yml/badge.svg)](https://github.com/RaphaelGuerra/phaelix-website/actions/workflows/lint.yml)
[![Security](https://github.com/RaphaelGuerra/phaelix-website/actions/workflows/security.yml/badge.svg)](https://github.com/RaphaelGuerra/phaelix-website/actions/workflows/security.yml)

## Overview

- Marketing/landing website for Phaelix.
- Static HTML with Tailwind CSS and lightweight JavaScript.
- Translations via JSON files under `/locales`.

## Tech Stack

- HTML + Tailwind CSS (CLI build)
- Vanilla JavaScript (`/assets/js`)
- Tailwind config: `tailwind.config.js`

## Local Dev

Prerequisites: Node.js 18+

1. Install dependencies

```bash
cd websites/phaelix-website
npm ci  # or: npm install
```

1. Build CSS (Tailwind)

```bash
npm run build:css
# writes compiled CSS to assets/css/tailwind.css
```

1. Serve the static site

Option A (Python):

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

Option B (Node):

```bash
npx serve . -l 5173
# open http://localhost:5173
```

## Deploy

- Deploy to any static host (e.g., Netlify, GitHub Pages, Vercel static).
- `_headers` provides recommended HTTP headers on hosts that support it (e.g.,
  Netlify).

## Notes

- When editing `assets/css/tailwind.input.css`, rebuild with `npm run build:css`.
- For iterative work, you can run Tailwind in watch mode:

```bash
npx tailwindcss -c tailwind.config.js -i assets/css/tailwind.input.css \\
  -o assets/css/tailwind.css --watch
```

## Status & License

- Website assets © Phaelix / Raphael Guerra. Personal/portfolio project.
