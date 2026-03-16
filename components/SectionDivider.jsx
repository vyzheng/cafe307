/**
 * Decorative divider (line-dot-line) used between menu sections.
 * It's a simple presentational component with no props or state;
 * we use the theme pink for the line and dot.
 */

import { colors } from "../data/theme";

/**
 * Renders a horizontal divider with a center dot (theme pink).
 * The layout is flex with gap so we get a short line, a small circle,
 * then another short line; the lines use gradients so they fade at the ends.
 */
function SectionDivider() {
  return (
    /*
      Outer div — display flex, alignItems and justifyContent center so the three pieces (line, dot, line) are in a row and vertically centered.
      gap 12 puts space between them; margin 30px 0 adds space above and below.
      A horizontal row of three elements, centered with space between.
    */
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "30px 0" }}>
      {/* Left line — width 40, height 1 (a thin bar).
          background is a linear-gradient from transparent (left) to colors.pink (right).
          A short horizontal line that fades from nothing to pink. */}
      <div style={{ width: 40, height: 1, background: "linear-gradient(to right, transparent, " + colors.pink + ")", opacity: 0.5 }} />
      {/* Center dot — width and height 3, borderRadius 50% makes it a circle.
          A small pink circle. */}
      <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: colors.pink, opacity: 0.4 }} />
      {/* Right line — Same idea as the left but gradient from colors.pink (left) to transparent (right).
          A short horizontal line that fades from pink to nothing. */}
      <div style={{ width: 40, height: 1, background: "linear-gradient(to left, transparent, " + colors.pink + ")", opacity: 0.5 }} />
    </div>
  );
}

export default SectionDivider;
