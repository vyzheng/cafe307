# SectionDivider.jsx — Plain-English summary

This component is a small decorative divider: a short line, a dot, then another short line (line–dot–line). It’s used between menu sections (e.g. between courses in DinnerMenu). No props or state—purely presentational, using the theme pink.

---

## What we have (and how it affects the return)

### 1. `colors` (imported from theme)
We use `colors.pink` for the two lines (in gradients) and the center dot.

**Effect on return:** The left line fades from transparent to pink; the right line from pink to transparent; the dot is a small pink circle. So the whole divider uses the theme pink for a consistent look.

---

### 2. No props or state
The component takes no props and has no internal state.

**Effect on return:** The return is always the same: a flex row (line, dot, line) with fixed spacing and margins. Where it appears is determined by the parent (e.g. DinnerMenu inserts it between courses).

---

## The return in one sentence

A horizontal flex row, centered with gap and vertical margin, containing a short gradient line (transparent → pink), a small pink circle, and another short gradient line (pink → transparent), so we get a simple line-dot-line divider between sections.
