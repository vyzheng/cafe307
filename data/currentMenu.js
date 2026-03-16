/**
 * Featured / active menu displayed on the Menu tab.
 * This is the one menu object that MainView passes to DinnerMenu when the
 * user is on the Menu tab; to show a different week, replace or edit
 * this object.
 */

/*
  currentMenu — One object with date, lunarDate, label, and courses.
  Each course has cat (category with cn and en) and items (array of dishes with cn, en, desc, and optionally tag and exp).
  MainView imports this and does <DinnerMenu menu={currentMenu} /> when the Menu tab is active.
  The menu we show on the Menu tab; edit this object to change the featured dinner.
*/
const currentMenu = {
  date: "March 12, 2026",
  lunarDate: "正月廿四",
  label: "The First Supper",
  courses: [
    {
      cat: { cn: "前菜", en: "APPETIZER" },
      items: [
        { cn: "滷牛肉", en: "Five-Spice Braised Beef", desc: "sliced cold, steeped overnight in star anise & soy" },
        { cn: "香菇瑤柱雞湯", en: "Shiitake & Dried Scallop Chicken Broth", desc: "slow-simmered with jidori chicken" },
      ],
    },
    {
      cat: { cn: "主菜", en: "PLAT PRINCIPAL" },
      items: [
        { cn: "黑松露鮮肉餛飩", en: "Black Truffle Pork Wontons in Broth", desc: "hand-folded with summer truffle, porcini & rice wine, served in napa cabbage broth with a finish of Eataly truffle oil", tag: "✿ v3 — finally passed" },
        { cn: "紅燒肉", en: "Red-Braised Pork Belly", desc: "caramelized with rock sugar, slow-braised" },
        { cn: "蛋黃粽子", en: "Salted Egg Yolk Zongzi", desc: "wrapped in bamboo leaves" },
      ],
    },
    {
      cat: { cn: "甜品", en: "DESSERT" },
      items: [
        { cn: "巧克力湯圓", en: "Chocolate Tangyuan", desc: "Venchi chocolate in fresh glutinous rice dough", exp: true },
      ],
    },
  ],
};

/*
  export default currentMenu — We export this one object so other files can import it.
  MainView does: import currentMenu from "../data/currentMenu".
  This file's only export is the featured menu object.
*/
export default currentMenu;
