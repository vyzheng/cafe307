/**
 * Main authenticated view with header, tabs (Menu / Archive / Notes),
 * and tab content. This is the dashboard the user sees after they log in;
 * one state variable (tab) controls which content is shown.
 */

import { useState, useEffect } from "react";

import FadeIn from "./layout/FadeIn";
import DinnerMenu from "./menu/DinnerMenu";
import MainViewHeader from "./layout/MainViewHeader";
import TabBar from "./layout/TabBar";
import ArchiveTab from "./menu/ArchiveTab";
import NotesTab from "./notes/NotesTab";
import AddMenuTab from "./menu/AddMenuTab";
import RequestsTab from "./RequestsTab";

import { colors } from "../data/config/theme";
import staticCurrentMenu from "../data/fallback/currentMenu";
import archivedMenus from "../data/fallback/archivedMenus";
import { mainViewTabs, TAB_IDS } from "../data/config/tabs";
import { apiFetch } from "../src/api";
import { useMusic } from "../src/context/MusicContext";
import { canAddMenu, canEditMenu } from "../data/config/roles";

/* Main view shell layout and background; only used by this component. */
const shellStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  padding: "32px 16px",
  background: colors.bg,
  backgroundImage: "radial-gradient(circle at 20% 30%, rgba(244,180,195,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(253,220,204,0.06) 0%, transparent 50%)",
};

function MainView({ userCode }) {
  const { setTrack } = useMusic();
  /* Which tab is selected. TabBar calls setTab on click. */
  const [tab, setTab] = useState(TAB_IDS.MENU);

  /* Current menu: fetched from API on mount; fallback to static import if API fails or is offline. */
  const [currentMenu, setCurrentMenu] = useState(staticCurrentMenu);
  /* Past menus for Archive tab: from API; fallback to static archivedMenus if API fails. */
  const [archiveList, setArchiveList] = useState(archivedMenus);
  const refetchCurrent = () => {
    apiFetch("/api/menus/current")
      .then((data) => setCurrentMenu(data))
      .catch(() => {});
  };
  useEffect(() => {
    refetchCurrent();
  }, []);
  const refetchArchive = () => {
    apiFetch("/api/menus/archive")
      .then((data) => setArchiveList(Array.isArray(data) ? data : []))
      .catch(() => {});
  };
  useEffect(() => {
    refetchArchive();
  }, []);

  useEffect(() => {
    setTrack(tab);
  }, [tab, setTrack]);

  /* Tabs to show: base tabs; add "Add menu" when userCode is vivian. */
  const tabs = canAddMenu(userCode) ? [...mainViewTabs, { id: TAB_IDS.ADD_MENU, label: "Add", cn: "新増" }] : mainViewTabs;

  /* When vivian clicks Edit on an archive row, we open Add menu tab with this menu. */
  const [editingMenu, setEditingMenu] = useState(null);

  /* Archive tab: dedupe by English date (keep latest edit per date), sort latest first. */
  const combinedMenus = [currentMenu, ...archiveList];
  const byDate = new Map();
  for (const m of combinedMenus) {
    const key = m.date;
    const existing = byDate.get(key);
    if (!existing || (m.id != null && (existing.id == null || m.id > existing.id))) {
      byDate.set(key, m);
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allMenusForArchive = Array.from(byDate.values())
    .filter((m) => {
      const d = new Date(m.date);
      return isNaN(d.getTime()) || d <= today;
    })
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const upcomingMenu = Array.from(byDate.values())
    .filter((m) => {
      const d = new Date(m.date);
      return !isNaN(d.getTime()) && d > today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const handleAddMenuSuccess = (menu, wasEditing) => {
    if (wasEditing) {
      const isCurrentMenu =
        currentMenu && (currentMenu.id === menu.id || currentMenu.date === menu.date);
      if (isCurrentMenu) setCurrentMenu(menu);
      refetchCurrent();
      refetchArchive();
    } else {
      setCurrentMenu(menu);
      refetchArchive();
    }
    setEditingMenu(null);
  };

  return (
    /* Full-height shell with app background and gradient (from theme). Same look as login so the dashboard feels like the same app. */
    <div style={shellStyle}>
      {/* Narrow column (max 460px) so content stays readable on large screens. */}
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Header fades in first (100ms) so the user sees logo and "Welcome back" before the rest. */}
        <FadeIn delay={100}>
          <MainViewHeader />
        </FadeIn>

        {/* Tab bar: base tabs plus "Add menu" for vivian. */}
        <FadeIn delay={200}>
          <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />
        </FadeIn>

        {/* Menu tab: show the dinner menu card. Only rendered when tab is "menu"; FadeIn delay 300ms so it appears after header and tabs. */}
        {tab === TAB_IDS.MENU && (
          <FadeIn delay={300}>
            <DinnerMenu menu={currentMenu} />
          </FadeIn>
        )}

        {/* Archive tab: list of all menus (featured first, then past). Clicking a row calls onSelectMenu, which switches back to the Menu tab. */}
        {tab === TAB_IDS.ARCHIVE && (
          <FadeIn delay={300}>
            <ArchiveTab
              menus={allMenusForArchive}
              currentMenu={currentMenu}
              userCode={userCode}
              onSelectMenu={() => setTab(TAB_IDS.MENU)}
              onEditMenu={(menu) => { setEditingMenu(menu); setTab(TAB_IDS.ADD_MENU); }}
            />
          </FadeIn>
        )}

        {/* Notes tab: chef note, guest review, and next reservation. We only pass currentMenu.date; NotesTab uses it to look up note and review. */}
        {tab === TAB_IDS.NOTES && (
          <FadeIn delay={300}>
            <NotesTab
              menuDates={[
                /* Include current menu date even if it's today/future (so notes can be written for the upcoming dinner) */
                ...(currentMenu?.date && !allMenusForArchive.some((m) => m.date === currentMenu.date)
                  ? [currentMenu.date]
                  : []),
                ...allMenusForArchive.map((m) => m.date),
              ]}
              userCode={userCode}
              upcomingMenuDate={upcomingMenu?.date ?? null}
            />
          </FadeIn>
        )}

        {tab === TAB_IDS.REQUESTS && (
          <FadeIn delay={300}>
            <RequestsTab userCode={userCode} />
          </FadeIn>
        )}

        {tab === TAB_IDS.ADD_MENU && canAddMenu(userCode) && (
          <FadeIn delay={300}>
            <AddMenuTab
              key={editingMenu?.id ?? "new"}
              currentMenu={editingMenu ?? currentMenu}
              editingMenu={editingMenu}
              userCode={userCode}
              onSuccess={(menu) => handleAddMenuSuccess(menu, !!editingMenu)}
            />
          </FadeIn>
        )}

        {/* Bottom spacer so when the user scrolls, the last content isn’t flush against the viewport. */}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

export default MainView;
