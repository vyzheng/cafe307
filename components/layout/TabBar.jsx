/**
 * Tab bar for the main dashboard: Menu, Archive, Notes.
 * Renders one button per tab; active state and click handler come from props.
 */

import PropTypes from "prop-types";
import { colors, fonts } from "../../data/config/theme";

/* Horizontal bar that holds the tab buttons; only used by this component. */
const tabBarContainer = {
  display: "flex",
  gap: 4,
  marginBottom: 24,
  background: colors.card,
  borderRadius: 16,
  padding: 4,
  boxShadow: "0 1px 8px rgba(74,55,40,0.04)",
};
/* Gradient shown behind the selected tab; inactive tabs use transparent. */
const tabBarActiveBackground = "linear-gradient(135deg, rgba(244,180,195,0.15), rgba(212,169,106,0.08))";

function TabBar({ tabs, activeTab, onTabChange }) {
  /* tabs = array of { id, label, cn }; activeTab = id of selected tab; onTabChange(id) is called when user clicks a tab. */
  return (
    /* One row with equal-width buttons; container uses local style above. */
    <div style={tabBarContainer}>
      {/* One button per tab; key=t.id so React can track them. Click calls onTabChange(t.id) so parent can set active tab. */}
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          style={{
            flex: 1,
            padding: "10px 0",
            border: "none",
            background: activeTab === t.id ? tabBarActiveBackground : "transparent",
            borderRadius: 12,
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* English label; darker when active (ink), lighter when inactive (inkLight). */}
          <span style={{ fontFamily: fonts.body, fontSize: 12, letterSpacing: 2, color: activeTab === t.id ? colors.ink : colors.inkLight }}>{t.label}</span>
          {/* Chinese label; pink accent when active, muted when inactive. */}
          <span style={{ fontFamily: fonts.jp, fontSize: 8, color: activeTab === t.id ? colors.pinkDeep : colors.inkLight, opacity: activeTab === t.id ? 1 : 0.5 }}>{t.cn}</span>
        </button>
      ))}
    </div>
  );
}

/* Require tabs (id, label, cn), activeTab string, and onTabChange function. */
TabBar.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      cn: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default TabBar;
