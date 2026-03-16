/**
 * Card that displays a single dinner menu (date, courses, items).
 * The parent (MainView) passes one menu object; we show the header, each
 * course with its items, and dividers between courses.
 */

import PropTypes from "prop-types";
import FadeIn from "./FadeIn";
import SectionDivider from "./SectionDivider";
import { colors, fonts } from "../data/theme";
/* Delay in ms between each course's fade-in; used in delay={300 + ci * FADE_STAGGER_MS}. */
import { FADE_STAGGER_MS } from "../data/animationConstants";

/**
 * Renders menu header, courses with items, and footer; uses SectionDivider
 * between courses. The menu prop must have date, lunarDate, label, and
 * courses (each course has cat and items).
 */
function DinnerMenu({ menu }) {
  return (
    /* White card wrapping the whole menu; overflow hidden so nothing spills out. */
    <div style={{
      background: colors.card, borderRadius: 28, padding: "48px 36px", position: "relative",
      boxShadow: "0 2px 20px rgba(244,180,195,0.12), 0 8px 40px rgba(74,55,40,0.05)",
      overflow: "hidden"
    }}>
      {/* Header: icon, branding, then menu.date and menu.lunarDate. */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>⛩️</div>
        <div style={{ fontFamily: fonts.jp, fontSize: 9, letterSpacing: 4, color: colors.pink, textTransform: "uppercase", marginBottom: 4 }}>Cafe 307</div>
        <div style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 300, color: colors.ink, letterSpacing: 4, marginBottom: 4 }}>Dinner Menu</div>
        <div style={{ fontFamily: fonts.jp, fontSize: 10, fontWeight: 300, color: colors.pinkDeep, opacity: 0.7, letterSpacing: 4, marginBottom: 4 }}>木曜日の晩ごはん</div>
        <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.inkLight, letterSpacing: 2 }}>{menu.date}</div>
        <div style={{ fontFamily: fonts.cn, fontSize: 13, color: colors.gold, opacity: 0.5, marginTop: 2, letterSpacing: 1 }}>{menu.lunarDate}</div>
      </div>

      <SectionDivider />

      {/* One block per course: category, items (name, translation, desc; optional tag and Chef's Experience), FadeIn stagger, divider between courses. */}
      {menu.courses.map((course, ci) => (
        <div key={ci}>
          <FadeIn delay={300 + ci * FADE_STAGGER_MS}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: fonts.jp, fontSize: 9, letterSpacing: 3, color: colors.pinkDeep, opacity: 0.7 }}>{course.cat.cn}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 9, letterSpacing: 3, color: colors.pinkDeep, opacity: 0.7, marginLeft: 8 }}>· {course.cat.en}</span>
            </div>
            {course.items.map((item, ii) => (
              <div key={ii} style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: fonts.cn, fontSize: 18, fontWeight: 400, color: colors.ink, letterSpacing: 3, lineHeight: 1.4 }}>{item.cn}</div>
                <div style={{ fontFamily: fonts.body, fontStyle: "italic", fontSize: 13.5, color: colors.gold, letterSpacing: 0.5, marginTop: 3 }}>{item.en}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkLight, lineHeight: 1.7, fontStyle: "italic", marginTop: 8, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>{item.desc}</div>
                {item.tag && (
                  <div style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", fontSize: 8, fontFamily: fonts.jp, color: colors.pinkDeep, border: "1px solid rgba(232,152,171,0.2)", borderRadius: 10, letterSpacing: 1, opacity: 0.8 }}>{item.tag}</div>
                )}
                {item.exp && (
                  <div style={{ marginTop: 8, padding: 16, background: "linear-gradient(135deg, rgba(232,224,240,0.3), rgba(252,238,242,0.2))", borderRadius: 14, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}>
                    <div style={{ fontFamily: fonts.cn, fontSize: 12, letterSpacing: 2, color: colors.ink, opacity: 0.6 }}>一起做 · Chef's Experience</div>
                    <div style={{ fontFamily: fonts.body, fontStyle: "italic", fontSize: 12, color: colors.inkLight, marginTop: 3, opacity: 0.6 }}>made fresh at the table</div>
                  </div>
                )}
              </div>
            ))}
          </FadeIn>
          {ci < menu.courses.length - 1 && <SectionDivider />}
        </div>
      ))}

      {/* Footer: heart and "Cafe 307 · Sawtelle". */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <div style={{ fontSize: 12, color: colors.pink, opacity: 0.5 }}>♥</div>
        <div style={{ fontFamily: fonts.jp, fontSize: 9, letterSpacing: 2, color: colors.inkLight, opacity: 0.4, textTransform: "uppercase", marginTop: 8 }}>Cafe 307 · Sawtelle</div>
      </div>
    </div>
  );
}

/* menu must have date, lunarDate, label, courses (each with cat and items); items can have cn, en, desc, tag, exp. */
DinnerMenu.propTypes = {
  menu: PropTypes.shape({
    date: PropTypes.string.isRequired,
    lunarDate: PropTypes.string,
    label: PropTypes.string,
    courses: PropTypes.arrayOf(
      PropTypes.shape({
        cat: PropTypes.shape({
          cn: PropTypes.string,
          en: PropTypes.string,
        }),
        items: PropTypes.arrayOf(
          PropTypes.shape({
            cn: PropTypes.string,
            en: PropTypes.string,
            desc: PropTypes.string,
            tag: PropTypes.string,
            exp: PropTypes.bool,
          })
        ).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default DinnerMenu;
