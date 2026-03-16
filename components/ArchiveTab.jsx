/**
 * Archive tab content: "Past Menus" title and a list of menu rows.
 * Clicking the current menu row switches to Menu tab; clicking a historical row expands it inline to show the full menu.
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { colors, fonts, mainView } from "../data/theme";
import { getMenuSummary } from "../utils/menuUtils";
import DinnerMenu from "./DinnerMenu";
import FadeIn from "./FadeIn";

function getMenuKey(menu) {
  return menu.id != null ? String(menu.id) : menu.date;
}

function ArchiveTab({ menus, currentMenu, userCode, onSelectMenu, onEditMenu }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const isCurrent = (menu) =>
    (currentMenu?.id != null && menu.id === currentMenu.id) ||
    (currentMenu?.date != null && menu.date === currentMenu.date);

  const handleRowClick = (menu) => {
    if (isCurrent(menu)) {
      onSelectMenu();
    } else {
      const key = getMenuKey(menu);
      setExpandedKey((prev) => (prev === key ? null : key));
    }
  };

  const handleKeyDown = (e, menu) => {
    if (e.key !== "Enter") return;
    if (isCurrent(menu)) onSelectMenu();
    else {
      const key = getMenuKey(menu);
      setExpandedKey((prev) => (prev === key ? null : key));
    }
  };

  return (
    <div style={{ ...mainView.card, padding: "40px 36px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink, letterSpacing: 2, marginBottom: 4 }}>Past Menus</div>
        <div style={{ fontFamily: fonts.jp, fontSize: 9, color: colors.gold, opacity: 0.7, letterSpacing: 1 }}>思い出のメニュー</div>
      </div>
      {menus.map((menu) => {
        const key = getMenuKey(menu);
        const expanded = expandedKey === key;
        return (
          <div key={key} style={{ marginBottom: 8 }}>
            <div
              onClick={() => handleRowClick(menu)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, menu)}
              style={{
                padding: "18px 20px",
                background: "linear-gradient(135deg, #FFF8F3, #FCEEF2)",
                borderRadius: 14,
                cursor: "pointer",
                border: "1px solid rgba(244,180,195,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, letterSpacing: 1 }}>{menu.date}</div>
                      <div style={{ fontFamily: fonts.cn, fontSize: 10, color: colors.inkLight, marginTop: 2 }}>{menu.lunarDate}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontFamily: fonts.body, fontStyle: "italic", fontSize: 10, color: colors.gold, opacity: 0.7 }}>{menu.label}</div>
                      {userCode === "vivian" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEditMenu?.(menu); }}
                          style={{
                            padding: "4px 10px",
                            fontSize: 10,
                            fontFamily: fonts.body,
                            color: colors.inkLight,
                            background: "rgba(255,255,255,0.8)",
                            border: `1px solid ${colors.inkLight}`,
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontFamily: fonts.body, fontStyle: "italic", fontSize: 10, color: colors.inkLight, marginTop: 8, lineHeight: 1.6 }}>
                    {getMenuSummary(menu)}
                  </div>
                </div>
              </div>
            </div>
            {expanded && (
              <FadeIn delay={0}>
                <div
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(244,180,195,0.2)",
                  }}
                >
                  <DinnerMenu menu={menu} />
                </div>
              </FadeIn>
            )}
          </div>
        );
      })}
      {/* Footer line at bottom of card. */}
      <div style={{ textAlign: "center", marginTop: 20, fontFamily: fonts.body, fontStyle: "italic", fontSize: 11, color: colors.inkLight, opacity: 0.4 }}>
        More menus coming every Thursday.
      </div>
    </div>
  );
}

ArchiveTab.propTypes = {
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      date: PropTypes.string.isRequired,
      lunarDate: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      courses: PropTypes.array.isRequired,
    })
  ).isRequired,
  currentMenu: PropTypes.shape({
    id: PropTypes.number,
    date: PropTypes.string,
    lunarDate: PropTypes.string,
    label: PropTypes.string,
    courses: PropTypes.array,
  }),
  userCode: PropTypes.string,
  onSelectMenu: PropTypes.func.isRequired,
  onEditMenu: PropTypes.func,
};

export default ArchiveTab;
