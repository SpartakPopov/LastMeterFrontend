---
name: ui-ux-refactor
description: Refactor and improve the UI/UX of LastMeterFrontend components and pages — visual consistency, layout, accessibility, and design-token usage.
---

# UI/UX Refactor

Use this skill when refactoring or improving the look, feel, and usability of components/pages in this React app.

## Design system

- Global tokens live in `src/styles/global.css` (`:root` custom properties): color scale (`--green-*`, `--gray-*`, `--white`), fonts (`--font-body` = Outfit, `--font-mono` = DM Mono), radii (`--radius-sm/md/lg/xl`), and shadows (`--shadow-sm/md/lg/green`).
- Always reuse existing CSS variables instead of hardcoding colors, radii, or shadows. If a new value is genuinely needed, add it as a token in `global.css` rather than inlining a one-off.
- Base resets already handle box-sizing, margins, fonts for `body`, `a`, `button`, `input` — don't redeclare these per-component.

## Refactor approach

1. Read the component/page and its associated CSS file before changing anything.
2. Identify inconsistencies: hardcoded colors/spacing that should use tokens, duplicated styles that could be shared, inaccessible markup (missing labels, low contrast, non-semantic elements used as buttons/links).
3. Make minimal, targeted changes — preserve existing structure and class naming conventions unless the refactor's purpose is restructuring.
4. Check responsive behavior (mobile/desktop) if the component has layout changes.
5. Verify accessibility basics: semantic HTML, keyboard focus states, alt text, sufficient color contrast against `--gray-*`/`--green-*` backgrounds.
6. After changes, run the dev server (`npm run dev`) and visually check the affected page(s) before reporting done.

## Scope discipline

- Don't introduce a new UI library, CSS framework, or styling approach (e.g., Tailwind, styled-components) unless explicitly asked — this app uses plain CSS with custom properties.
- Don't rewrite unrelated components while refactoring one — stay scoped to what was asked.
