const SEED = [
  {
    id: "default",
    name: "",
    url: "https://duckduckgo.com/",
    kind: "regular",
    mobile: true,
  },
];
const DEFAULTS = {
  layout: "horizontal",
  placement: "left",
  compact: false,
  autohide: "none",
  urlbar: true,
  expand: true,
  hover: "overlay",
  display: "both",
  size: "medium",
  essBox: "all",
  showToggle: true,
  showBack: true,
  showForward: true,
  search: "duckduckgo",
};
// %s is replaced by the URL-encoded query typed in the address bar.
const SEARCH = {
  duckduckgo: "https://duckduckgo.com/?q=%s",
  google: "https://www.google.com/search?q=%s",
  bing: "https://www.bing.com/search?q=%s",
  brave: "https://search.brave.com/search?q=%s",
  startpage: "https://www.startpage.com/do/search?q=%s",
  ecosia: "https://www.ecosia.org/search?q=%s",
};
const HOME = "https://duckduckgo.com/";
const KINDS = ["essential", "pinned", "regular"];
// Letters shown inside a folder icon. Three is unreadable at tab-icon size, so two is the limit.
const FOLDER_TEXT_MAX = 2;
// Preset glyphs for the inside of a folder icon (16x16 stroke paths).
const GLYPHS = {
  star: "M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4L2.2 6.3l4-.6z",
  heart:
    "M8 13.5S2.5 10 2.5 6.2A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.5 1.2C13.5 10 8 13.5 8 13.5z",
  bolt: "M9 2 4 9h3.5L7 14l5-7H8.5z",
  code: "M6 5 3 8l3 3M10 5l3 3-3 3",
  chat: "M3 4h10v7H8l-3 2.5V11H3z",
  mail: "M2.5 4h11v8h-11zM2.5 4.5 8 9l5.5-4.5",
  music:
    "M6 12V4l6-1.5V10M6 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z",
  play: "M5 3.5v9l7.5-4.5z",
  cart: "M2 3h2l1.5 7h6l1.5-5H5M6.5 13h.01M11 13h.01",
  book: "M2.5 3.5H7a1 1 0 0 1 1 1v8a1 1 0 0 0-1-1H2.5zM13.5 3.5H9a1 1 0 0 0-1 1v8a1 1 0 0 1 1-1h4.5z",
  game: "M4.5 5.5h7A2.5 2.5 0 0 1 14 8.2l-.4 2.3a1.5 1.5 0 0 1-2.6.6L10 10H6l-1 1.1a1.5 1.5 0 0 1-2.6-.6L2 8.2a2.5 2.5 0 0 1 2.5-2.7zM5 7v2M4 8h2",
  globe:
    "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2.5 8h11M8 2.5c2 1.8 2 9.2 0 11M8 2.5c-2 1.8-2 9.2 0 11",
  work: "M2.5 5.5h11v7h-11zM6 5.5v-2h4v2M2.5 9h11",
  home: "M2.5 8 8 3l5.5 5M4 7.2V13h8V7.2",
};
// Solid, softly rounded folder (20x16). The open state is the same silhouette dimmed behind a
// slanted front flap. Letters or a glyph are drawn on the front in the bar's dark colour.
const FOLDER_BACK =
  "M3.5 .5H7.4C7.9 .5 8.3 .7 8.6 1.1L9.5 2.2C9.8 2.6 10.2 2.8 10.7 2.8H16.5A3 3 0 0 1 19.5 5.8V12.5A3 3 0 0 1 16.5 15.5H3.5A3 3 0 0 1 .5 12.5V3.5A3 3 0 0 1 3.5 .5Z";
const FOLDER_FRONT = "M4.6 6.4H19.2L17.1 15.5H.9Z";
// [path data, optional class] pairs, drawn by svgEl
const FOLDER_CLOSED = [[FOLDER_BACK]];
const FOLDER_OPEN = [
  [FOLDER_BACK, "back"],
  [FOLDER_FRONT, "front"],
];

// Builds an inline <svg> from path data with DOM calls (no HTML strings).
function svgEl(viewBox, paths, cls) {
  const NS = "http://www.w3.org/2000/svg";
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", viewBox);
  s.setAttribute("aria-hidden", "true");
  if (cls) s.setAttribute("class", cls);
  for (const [d, c] of paths) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    if (c) p.setAttribute("class", c);
    s.append(p);
  }
  return s;
}
// icon = favicon/glyph size, tab = tab height, tile = width of the icon column (compact tile),
// tabH = tab height in the horizontal layout, fs = label font size. "medium" follows Zen's own sidebar.
const SIZES = {
  small: { icon: 16, tab: 36, tile: 42, btn: 30, tabH: 28, fs: 12 },
  medium: { icon: 18, tab: 42, tile: 48, btn: 34, tabH: 34, fs: 13 },
  large: { icon: 22, tab: 48, tile: 56, btn: 40, tabH: 40, fs: 14 },
};
const EDGE = 6; // hover strip left behind when the bar is auto-hidden

const $ = (id) => document.getElementById(id);
const app = $("app");
const slot = $("slot");
const rail = $("rail");
const frames = $("frames");
const emptyEl = $("empty");
const form = $("form");
const formTitle = $("formTitle");
const nameIn = $("nameIn");
const urlIn = $("urlIn");
const mobileIn = $("mobileIn");
const directIn = $("directIn");
const directPrompt = $("directPrompt");
const toastEl = $("toast");
const menu = $("menu");
const shell = $("shell");
const urlslot = $("urlslot");
const addr = $("addr");
const hmenu = $("hmenu");
const groups = {
  essential: $("essentials"),
  pinned: $("pinned"),
  regular: $("regular"),
};

const folderForm = $("folderForm");
const fName = $("fName");
const fText = $("fText");
const fGlyphs = $("fGlyphs");
const fPreview = $("fPreview");

const made = new Map(); // tab id -> iframe, kept alive between switches. No entry = unloaded tab
const navInfo = new Map(); // tab id -> history info reported by frame-nav.js
const iconCache = new Map(); // page url -> icon url

let model = { tabs: [], folders: [], activeId: null, ...DEFAULTS };
let editingId = null; // tab being edited, or null when adding
let dragId = null;
let dragFolderId = null;
let pendingFolder = null; // folder a tab being added should go into
let folderEditing = null; // folder being edited, or null when adding
let folderWithTab = null; // tab that should move into the folder being created
let fGlyph = null; // glyph chosen in the folder form
const hoverState = { rail: false, url: false }; // which bars are currently hovered
const hoverTimers = {};
let hist = {}; // tab id -> pages visited in that tab, newest first: [{ url, title }]

/* ---------- helpers ---------- */

function autoLabel(u) {
  try {
    const x = new URL(u);
    const local = x.hostname === "localhost" || x.hostname === "127.0.0.1";
    return local && x.port ? ":" + x.port : x.host;
  } catch {
    return u;
  }
}
const labelOf = (t) => t.name.trim() || autoLabel(t.url);

async function findIcon(pageUrl) {
  if (iconCache.has(pageUrl)) return iconCache.get(pageUrl);
  let icon = new URL(pageUrl).origin + "/favicon.ico";
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(4000) });
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const href = doc.querySelector('link[rel~="icon"]')?.getAttribute("href");
    if (href) icon = new URL(href, res.url).href;
  } catch {}
  iconCache.set(pageUrl, icon);
  return icon;
}

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 9000);
}
toastEl.onclick = () => (toastEl.hidden = true);

/* ---------- storage ---------- */

// older versions stored a boolean; the setting is now "none" | "urlbar" | "tabs" | "both"
const normAutohide = (v) =>
  v === true ? "tabs" : ["urlbar", "tabs", "both"].includes(v) ? v : "none";

function normIcon(i) {
  if (i && i.type === "glyph" && GLYPHS[i.name])
    return { type: "glyph", name: i.name };
  if (i && i.type === "text") {
    const text = [...String(i.text || "").trim()]
      .slice(0, FOLDER_TEXT_MAX)
      .join("");
    if (text) return { type: "text", text };
  }
  return { type: "auto" }; // initials taken from the folder's name
}

function normFolders(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((f) => f && typeof f.id === "string")
    .map((f) => ({
      id: f.id,
      name: String(f.name || "").slice(0, 30),
      icon: normIcon(f.icon),
      collapsed: f.collapsed === true,
    }));
}

async function load() {
  const s = await browser.storage.local.get([
    "tabs",
    "folders",
    "active",
    "last",
    "placement",
    "display",
    "hover",
    "compact",
    "layout",
    "bar",
    "size",
    "autohide",
    "expand",
    "essBox",
    "showToggle",
    "showBack",
    "showForward",
    "urlbar",
    "search",
  ]);
  const folders = normFolders(s.folders);
  const folderIds = new Set(folders.map((f) => f.id));
  const tabs = (Array.isArray(s.tabs) ? s.tabs : structuredClone(SEED)).map(
    (t) => {
      let kind = KINDS.includes(t.kind) ? t.kind : "regular";
      // Folders live in the Pinned area, so every tab in one is pinned (older versions
      // allowed regular tabs in folders; they are pinned here).
      const inFolder = kind !== "essential" && folderIds.has(t.folder);
      if (inFolder) kind = "pinned";
      return {
        ...t,
        name: t.name || "",
        kind,
        mobile: t.mobile === true,
        direct: t.direct === true,
        folder: inFolder ? t.folder : null,
      };
    },
  );
  let activeId = s.active;
  if (!tabs.some((t) => t.id === activeId)) {
    // older versions stored the active tab as an index
    activeId = tabs[Math.min(s.last || 0, tabs.length - 1)]?.id ?? null;
  }
  const pick = (key, allowed) =>
    allowed.includes(s[key]) ? s[key] : DEFAULTS[key];
  model = {
    tabs,
    folders,
    activeId,
    placement: pick("placement", ["left", "right"]),
    display: pick("display", ["both", "icon", "name"]),
    // older versions stored hover "none" and a three-way "bar" setting; honour them until migrated
    hover: s.hover === "push" ? "push" : "overlay",
    expand: s.expand !== undefined ? s.expand !== false : s.hover !== "none",
    layout: pick("layout", ["vertical", "horizontal"]),
    size: pick("size", ["small", "medium", "large"]),
    essBox: pick("essBox", ["all", "active", "off"]),
    showToggle: s.showToggle !== false,
    showBack: s.showBack !== false,
    showForward: s.showForward !== false,
    compact: s.bar !== undefined ? s.bar === "compact" : s.compact === true,
    autohide: normAutohide(
      s.bar !== undefined ? s.bar === "hidden" : s.autohide,
    ),
    urlbar: s.urlbar !== false,
    search: pick("search", Object.keys(SEARCH)),
  };
}

// Every write goes through storage; storage.onChanged then triggers one render.
let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  queueMicrotask(() => {
    renderQueued = false;
    render();
  });
}
browser.storage.onChanged.addListener((changes, area) => {
  // the page history is saved often and needs no re-render
  if (area === "local" && Object.keys(changes).some((k) => k !== "history"))
    scheduleRender();
});

/* ---------- layout: compact + hover ---------- */

// Which bars are currently set to auto-hide. With horizontal tabs the tab strip and the address
// bar both sit at the top, so any auto-hide setting hides them together.
function hides() {
  const horiz = model.layout === "horizontal";
  const ah = model.autohide;
  return {
    tabs: horiz ? ah !== "none" : ah === "tabs" || ah === "both",
    url:
      model.urlbar &&
      (horiz ? ah !== "none" : ah === "urlbar" || ah === "both"),
  };
}

function applyLayout() {
  const horiz = model.layout === "horizontal";
  const S = SIZES[model.size];
  const tab = horiz ? S.tabH : S.tab;
  const tile = horiz ? S.tabH : S.tile;
  // expanded rail fits the footer row; compact rail is exactly one tile wide
  const expandedW = S.tile + S.btn * 4 + 20;
  const compactW = S.tile + 12;
  const full = horiz ? S.tabH + 8 : expandedW;
  const compact = !horiz && model.compact; // a horizontal strip has no compact form
  const push = model.hover === "push";
  const hide = hides();

  // Tab bar. compact: icon strip that opens to full tabs while hovered (if "expand").
  // auto-hide: hidden until its edge is hovered, then shown in its current form.
  const open = compact && model.expand && hoverState.rail;
  const restSize = compact ? (open ? expandedW : compactW) : full;
  const slotRest = compact ? (open && push ? expandedW : compactW) : full;
  const railHidden = hide.tabs && !hoverState.rail;
  const railSize = restSize; // hiding is a clip-path wipe, so the bar keeps its size
  const slotSize = hide.tabs
    ? hoverState.rail && push
      ? restSize
      : EDGE
    : slotRest;
  const floating = hide.tabs ? hoverState.rail && !push : open && !push;

  // Address bar: a plain bar with no compact form, only shown or auto-hidden.
  const urlH = S.btn + 8;
  const urlHidden = hide.url && !hoverState.url;
  const urlSize = model.urlbar && !urlHidden ? urlH : 0;
  let urlSlotSize = 0;
  if (model.urlbar)
    urlSlotSize = hide.url
      ? hoverState.url && push
        ? urlH
        : horiz
          ? 0
          : EDGE
      : urlH;
  // below a floating tab strip the bar must start under the strip, not under the thin hover edge
  const urlTop = horiz ? railSize - slotSize : 0;

  shell.dataset.layout = model.layout;
  app.dataset.layout = model.layout;
  app.dataset.placement = model.placement;
  shell.dataset.placement = model.placement;
  app.dataset.display = model.display;
  app.dataset.essbox = model.essBox;
  const vars = {
    "--tab-h": tab + "px",
    "--tile-w": tile + "px",
    "--btn": (horiz ? S.tabH : S.btn) + "px",
    "--icon": S.icon + "px",
    "--fs": S.fs + "px",
    "--slot-size": slotSize + "px",
    "--rail-size": railSize + "px",
    "--url-slot": urlSlotSize + "px",
    "--url-size": urlSize + "px",
    "--url-top": urlTop + "px",
  };
  for (const [k, v] of Object.entries(vars)) shell.style.setProperty(k, v);

  // vertical: the address bar is a bar across the top; horizontal: it sits below the tab strip
  urlslot.hidden = !model.urlbar;
  if (horiz && urlslot.parentElement !== app)
    app.insertBefore(urlslot, $("main"));
  else if (!horiz && urlslot.parentElement !== shell)
    shell.insertBefore(urlslot, app);

  // back / forward / reload live in the address bar when it is shown, otherwise in the footer
  const host = model.urlbar ? $("navgrp") : $("foot");
  const nav = ["back", "forward", "reload"].map($);
  if (nav[0].parentElement !== host) for (const b of nav) host.append(b);

  $("hot").hidden = !hide.tabs;
  $("hotUrl").hidden = !(hide.url && !horiz);
  $("toggle").hidden = !model.showToggle;
  rail.classList.toggle("collapsed", compact && !open);
  rail.classList.toggle("hiddenbar", railHidden);
  slot.classList.toggle("floating", floating);
  $("urlbar").classList.toggle("hiddenbar", urlHidden);
  urlslot.classList.toggle(
    "floating",
    model.urlbar && hide.url && hoverState.url && !push,
  );

  $("toggle").title = horiz
    ? model.autohide !== "none"
      ? "Always show tab bar"
      : "Auto-hide tab bar"
    : model.compact
      ? "Expand tab bar"
      : "Collapse to compact strip";
}

// Hover is tracked per bar: the tab bar ("rail") and the address bar ("url").
// With horizontal tabs both sit at the top, so they reveal and hide together.
function setHover(target, on, delay) {
  const linked = model.layout === "horizontal";
  const targets = linked ? ["rail", "url"] : [target];
  // keep the address bar open while typing in it or while its history list is open
  if (
    !on &&
    (linked || target === "url") &&
    (document.activeElement === addr || !hmenu.hidden)
  )
    return;
  for (const t of targets) {
    clearTimeout(hoverTimers[t]);
    if (hoverState[t] === on) continue;
    const apply = () => {
      hoverState[t] = on;
      applyLayout();
    };
    if (delay <= 0) apply();
    else hoverTimers[t] = setTimeout(apply, delay);
  }
}
for (const [el, target] of [
  [slot, "rail"],
  [$("hot"), "rail"],
  [urlslot, "url"],
  [$("hotUrl"), "url"],
]) {
  el.addEventListener("mouseenter", () => {
    const h = hides();
    // an auto-hidden bar reveals instantly; compact waits a beat so sweeping past does not flicker
    setHover(target, true, (target === "rail" ? h.tabs : h.url) ? 0 : 40);
  });
  el.addEventListener("mouseleave", () => setHover(target, false, 160));
}
$("toggle").onclick = () =>
  browser.storage.local.set(
    model.layout === "horizontal"
      ? { autohide: model.autohide === "none" ? "both" : "none" }
      : { compact: !model.compact },
  );
$("settings").onclick = () => browser.runtime.openOptionsPage();

/* ---------- iframes ---------- */

// A tab asking for the mobile site gets a frame the background script recognises (it is told
// the frame's first URL beforehand, see background.js) and that frame-nav.js recognises by name.
const MOBILE_NAME = "ssb-mobile";

function startFrame(f, url, mobile) {
  // Tell the background script which frame is about to load, then load it. If the message
  // cannot be delivered the page still loads, just without the mobile identity.
  Promise.resolve(browser.runtime.sendMessage({ ssb: "expect", url, mobile }))
    .catch(() => {})
    .then(() => {
      if (f.isConnected && f.dataset.url === url) f.src = url;
    });
}

// "Full page" tabs are not framed: the sidebar itself navigates to the site (see goDirect), so
// frame-only problems (storage partitioning, framing checks) do not apply. Nothing of this
// wrapper is left while that page is open; reopening the sidebar brings it back.
function goDirect(url) {
  location.replace(url);
}

function show(tab) {
  directPrompt.hidden = tab.direct !== true;
  if (tab.direct) {
    for (const fr of made.values()) fr.classList.add("hidden");
    return;
  }
  let f = made.get(tab.id);
  // Switching between mobile and desktop needs a fresh frame, so the whole page is rebuilt.
  if (f && f.dataset.mobile !== String(tab.mobile === true)) {
    f.remove();
    made.delete(tab.id);
    navInfo.delete(tab.id);
    f = null;
  }
  if (!f) {
    f = document.createElement("iframe");
    f.dataset.url = tab.url;
    f.dataset.mobile = String(tab.mobile === true);
    if (tab.mobile === true) f.name = MOBILE_NAME;
    // After every document load, tell frame-nav.js (if it is running there) who we are.
    f.addEventListener("load", () => {
      const i = navInfo.get(tab.id);
      const now = performance.now();
      if (i) i.live = false; // until the page's helper script answers the handshake
      if (i && now < i.settleUntil)
        i.settleUntil = Math.max(i.settleUntil, now + 800); // redirect chains
      try {
        f.contentWindow.postMessage({ ssb: "hello", id: tab.id }, "*");
      } catch {}
    });
    frames.appendChild(f);
    made.set(tab.id, f);
    navInfo.set(tab.id, newInfo());
    startFrame(f, tab.url, tab.mobile === true);
  } else if (f.dataset.url !== tab.url) {
    f.dataset.url = tab.url;
    navInfo.set(tab.id, newInfo());
    f.src = tab.url;
  }
  for (const [id, fr] of made) fr.classList.toggle("hidden", id !== tab.id);
}

/* ---------- Back / Forward / Reload ---------- */

// Redirects and start-up routing that happen while a page is loading are not history the user
// can go "back" to, so entries created inside this window become the baseline for Back.
const SETTLE_MS = 1800;
const newInfo = () => ({
  native: false,
  index: -1, // Navigation API: current entry index
  length: 0, // Navigation API: number of entries
  base: -1, // Navigation API: entry that counts as "the start"
  stack: [], // fallback: our own list of visited URLs
  idx: -1,
  expect: null,
  url: "",
  settleUntil: performance.now() + SETTLE_MS,
});
function infoFor(id) {
  let i = navInfo.get(id);
  if (!i) {
    i = newInfo();
    navInfo.set(id, i);
  }
  return i;
}

// Fallback when the Navigation API is missing: keep our own list of visited URLs.
function track(info, url) {
  if (performance.now() < info.settleUntil) {
    info.stack = [url];
    info.idx = 0;
    info.expect = null;
    return;
  }
  if (info.expect !== null && url === info.expect) {
    info.expect = null;
    return;
  }
  if (info.stack[info.idx] === url) return;
  info.expect = null;
  info.stack.splice(info.idx + 1);
  info.stack.push(url);
  info.idx = info.stack.length - 1;
}

const canBack = (i) => !!i && (i.native ? i.index > i.base : i.idx > 0);
const canForward = (i) =>
  !!i &&
  (i.native
    ? i.index >= 0 && i.index < i.length - 1
    : i.idx >= 0 && i.idx < i.stack.length - 1);

function updateNav() {
  const info = navInfo.get(model.activeId);
  $("back").hidden = !(model.showBack && canBack(info));
  $("forward").hidden = !(model.showForward && canForward(info));
  $("reload").disabled = !model.activeId;
  // with only Reload showing, the address bar aligns it with the tab icons (see CSS)
  $("urlbar").classList.toggle(
    "single",
    $("back").hidden && $("forward").hidden,
  );
}

window.addEventListener("message", (e) => {
  const m = e.data;
  if (!m || m.ssb !== "nav" || typeof m.id !== "string") return;
  const f = made.get(m.id);
  if (!f || e.source !== f.contentWindow) return; // must come from that tab's own frame
  const info = infoFor(m.id);
  info.url = String(m.url || "");
  info.live = true;
  info.native = m.native === true;
  recordHistory(m.id, info.url, String(m.title || ""), info);
  if (info.native) {
    info.index = Number.isInteger(m.index) ? m.index : -1;
    info.length = Number.isInteger(m.length) ? m.length : 0;
    if (performance.now() < info.settleUntil || info.base < 0)
      info.base = info.index;
  } else if (info.url) {
    track(info, info.url);
  }
  if (m.id === model.activeId) {
    updateNav();
    updateAddr();
  }
});

function step(dir) {
  const id = model.activeId;
  const f = made.get(id);
  const info = navInfo.get(id);
  if (!f || !info) return;
  if (info.native) {
    f.contentWindow.postMessage({ ssb: dir }, "*");
    return;
  }
  const to = dir === "back" ? info.idx - 1 : info.idx + 1;
  if (to < 0 || to >= info.stack.length) return;
  info.idx = to;
  info.expect = info.stack[to];
  goFrame(f, info.expect, true);
  updateNav();
}

// Navigate a tab's frame. "replace" swaps the current history entry instead of adding one, which
// is what reload and the Back/Forward fallback need (a plain src change would add a phantom entry).
function goFrame(f, url, replace) {
  try {
    if (replace) f.contentWindow.location.replace(url);
    else f.contentWindow.location.href = url;
  } catch {
    f.src = url;
  }
}

function reloadTab(id) {
  const f = made.get(id);
  const t = model.tabs.find((x) => x.id === id);
  if (!f || !t) return select(id);
  const info = navInfo.get(id);
  if (info?.live)
    f.contentWindow.postMessage({ ssb: "reload" }, "*"); // location.reload(): no new entry
  else goFrame(f, info?.url || t.url, true);
}

$("back").onclick = () => step("back");
$("forward").onclick = () => step("forward");
$("reload").onclick = () => reloadTab(model.activeId);

/* ---------- rendering ---------- */

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  await load();
  if (seq !== renderSeq) return;
  applyLayout();

  const { tabs, activeId } = model;
  const by = { essential: [], pinned: [], regular: [] };
  for (const t of tabs) by[t.kind].push(t);
  groups.essential.replaceChildren(...by.essential.map(makeTab));
  groups.pinned.replaceChildren(...makePinned(by.pinned));
  groups.regular.replaceChildren(...by.regular.map(makeTab));
  const hasPinned = by.pinned.length > 0 || model.folders.length > 0;
  groups.essential.hidden = by.essential.length === 0;
  groups.pinned.hidden = !hasPinned;
  $("sepA").hidden = !(by.essential.length && hasPinned);
  $("sep").hidden =
    !(by.essential.length || hasPinned) || by.regular.length === 0;

  for (const [id, f] of made) {
    if (!tabs.some((t) => t.id === id)) {
      f.remove();
      made.delete(id);
      navInfo.delete(id);
    }
  }

  emptyEl.hidden = tabs.length > 0;
  pruneHistory(tabs);
  const active = tabs.find((t) => t.id === activeId);
  if (active) show(active);
  markLoaded();
  updateNav();
  updateAddr();
  rail
    .querySelector(".tab.active")
    ?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

const colorCache = new Map(); // icon url -> css color or null

// The most vivid colour in the favicon, used for an Essential's outline and tint.
function dominantColor(d) {
  const buckets = Array.from({ length: 12 }, () => ({
    w: 0,
    r: 0,
    g: 0,
    b: 0,
  }));
  let tr = 0,
    tg = 0,
    tb = 0,
    tn = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    tr += r;
    tg += g;
    tb += b;
    tn++;
    const rr = r / 255,
      gg = g / 255,
      bb = b / 255;
    const max = Math.max(rr, gg, bb),
      min = Math.min(rr, gg, bb);
    const c = max - min;
    if (c < 0.12) continue; // grey pixels do not decide the colour
    let h =
      max === rr
        ? ((gg - bb) / c) % 6
        : max === gg
          ? (bb - rr) / c + 2
          : (rr - gg) / c + 4;
    h = (h * 60 + 360) % 360;
    const w = c * (1 - Math.abs(max + min - 1) * 0.5);
    const k = buckets[Math.floor(h / 30) % 12];
    k.w += w;
    k.r += r * w;
    k.g += g * w;
    k.b += b * w;
  }
  const best = buckets.reduce((a, b) => (b.w > a.w ? b : a));
  let r, g, b;
  if (best.w >= 0.5) {
    r = best.r / best.w;
    g = best.g / best.w;
    b = best.b / best.w;
  } else if (tn) {
    r = tr / tn;
    g = tg / tn;
    b = tb / tn; // grey / monochrome icon
  } else return null;
  const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
  const lift = l < 0.4 ? 0.25 : 0; // keep dark icons visible on the dark bar
  const f = (v) => Math.round(v + (255 - v) * lift);
  return `rgb(${f(r)} ${f(g)} ${f(b)})`;
}

async function iconColor(src) {
  if (colorCache.has(src)) return colorCache.get(src);
  let color = null;
  try {
    // the extension's host permission lets this read the icon without tainting the canvas
    const res = await fetch(src, { signal: AbortSignal.timeout(4000) });
    const url = URL.createObjectURL(await res.blob());
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 24;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 24, 24);
      color = dominantColor(ctx.getImageData(0, 0, 24, 24).data);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {}
  colorCache.set(src, color);
  return color;
}

function xIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", "M4 4l8 8M12 4l-8 8");
  svg.append(path);
  return svg;
}

// Folders sit above the loose tabs, in their own order; tabs inside a folder keep the order they
// have in the tab list.
// The Pinned area: folders first, then pinned tabs that are not in a folder.
function makePinned(list) {
  const nodes = model.folders.map((f) =>
    makeFolder(
      f,
      list.filter((t) => t.folder === f.id),
    ),
  );
  for (const t of list) if (!t.folder) nodes.push(makeTab(t));
  return nodes;
}

function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const chars =
    words.length > 1
      ? words.slice(0, FOLDER_TEXT_MAX).map((w) => [...w][0])
      : [...(words[0] || "")].slice(0, FOLDER_TEXT_MAX);
  return chars.join("").toUpperCase();
}

// A solid folder with either letters or a preset glyph on it.
function folderIcon(icon, name, open) {
  const el = document.createElement("span");
  el.className = "icon ficon" + (open ? " open" : "");
  el.append(svgEl("0 0 20 16", open ? FOLDER_OPEN : FOLDER_CLOSED, "shape"));
  const inner = document.createElement("span");
  inner.className = "fin";
  if (icon.type === "glyph" && GLYPHS[icon.name]) {
    inner.append(svgEl("0 0 16 16", [[GLYPHS[icon.name]]]));
  } else {
    const text = icon.type === "text" ? icon.text : initials(name);
    inner.textContent = text;
    inner.dataset.n = String(text.length);
  }
  el.append(inner);
  return el;
}

const folderLabel = (f) => f.name.trim() || "Folder";

function makeFolder(f, kids) {
  const label = folderLabel(f);
  const wrap = document.createElement("div");
  wrap.className = "folder" + (f.collapsed ? " collapsed" : "");
  wrap.dataset.folderWrap = f.id;

  const head = document.createElement("div");
  head.className = "tab fhead";
  head.dataset.folder = f.id;
  head.setAttribute("role", "button");
  head.setAttribute("aria-expanded", String(!f.collapsed));
  head.tabIndex = 0;
  head.draggable = true;
  head.title = `${label}\n${kids.length} ${kids.length === 1 ? "tab" : "tabs"}\nClick to ${f.collapsed ? "expand" : "collapse"}, right-click for more`;

  const text = document.createElement("span");
  text.className = "label";
  text.textContent = label;
  const chev = document.createElement("span");
  chev.className = "chev";
  chev.append(svgEl("0 0 16 16", [["M6 4l4 4-4 4"]]));
  head.append(folderIcon(f.icon, f.name, !f.collapsed), text, chev);
  wrap.append(head);

  // A collapsed folder still shows the tab you are on, like Firefox and Zen do.
  const shown = f.collapsed
    ? kids.filter((t) => t.id === model.activeId)
    : kids;
  if (shown.length) {
    const box = document.createElement("div");
    box.className = "fkids";
    box.append(...shown.map(makeTab));
    wrap.append(box);
  }

  head.onclick = () => toggleFolder(f.id);
  head.oncontextmenu = (e) => {
    e.preventDefault();
    openFolderMenu(e, f.id);
  };
  head.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFolder(f.id);
    }
  };

  const isAfter = (e) => {
    const r = head.getBoundingClientRect();
    return model.layout === "horizontal"
      ? e.clientX > r.left + r.width / 2
      : e.clientY > r.top + r.height / 2;
  };
  head.ondragstart = (e) => {
    dragFolderId = f.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", f.id);
    head.classList.add("dragging");
  };
  head.ondragend = () => {
    dragFolderId = null;
    head.classList.remove("dragging");
    clearDropMarks();
  };
  head.ondragover = (e) => {
    if (dragFolderId && dragFolderId !== f.id) {
      e.preventDefault(); // reorder folders
      clearDropMarks();
      head.classList.add(isAfter(e) ? "drop-after" : "drop-before");
    } else if (
      dragId &&
      (model.tabs.find((x) => x.id === dragId)?.kind ?? "essential") !==
        "essential"
    ) {
      e.preventDefault(); // drop a tab into the folder
      clearDropMarks();
      head.classList.add("drop-into");
    }
  };
  head.ondrop = async (e) => {
    e.preventDefault();
    const folderFrom = dragFolderId;
    const tabFrom = dragId;
    dragFolderId = dragId = null;
    const after = isAfter(e);
    clearDropMarks();
    if (folderFrom) await moveFolder(folderFrom, f.id, after);
    else if (tabFrom) await moveTabIntoFolder(tabFrom, f.id);
  };
  return wrap;
}

function makeTab(t) {
  const label = labelOf(t);
  const el = document.createElement("div");
  el.className = `tab ${t.kind}` + (t.id === model.activeId ? " active" : "");
  el.dataset.id = t.id;
  el.setAttribute("role", "tab");
  el.setAttribute("aria-selected", String(t.id === model.activeId));
  el.tabIndex = 0;
  el.draggable = true;
  el.title = `${label}\n${t.url}${t.mobile ? "\nMobile site" : ""}\nDouble-click to edit, right-click for more`;

  const icon = document.createElement("span");
  icon.className = "icon";
  const img = document.createElement("img");
  img.className = "fav";
  img.alt = "";
  img.draggable = false;
  img.onload = () => el.classList.add("hasimg");
  findIcon(t.url).then((src) => {
    img.src = src;
    if (t.kind === "essential")
      iconColor(src).then((c) => {
        if (c) el.style.setProperty("--tab-color", c);
      });
  });
  const ltr = document.createElement("span");
  ltr.className = "ltr";
  ltr.textContent = (label.replace(/^:/, "")[0] || "?").toUpperCase();
  icon.append(img, ltr);

  const text = document.createElement("span");
  text.className = "label";
  text.textContent = label;
  el.append(icon, text);

  // Only regular tabs get a close button at all. Pinned and Essential tabs have none.
  if (t.kind === "regular") {
    const x = document.createElement("button");
    x.className = "x";
    x.append(xIcon());
    x.title = "Close tab";
    x.tabIndex = -1;
    x.onclick = (e) => {
      e.stopPropagation();
      closeTab(t.id);
    };
    el.append(x);
  }

  el.onclick = () => select(t.id);
  el.ondblclick = () => openPanel(t.id);
  el.oncontextmenu = (e) => {
    e.preventDefault();
    openMenu(e, t.id);
  };
  el.onauxclick = (e) => {
    if (e.button === 1) closeTab(t.id);
  };
  el.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(t.id);
    } else if (e.key === "Delete") closeTab(t.id);
  };

  const isAfter = (e) => {
    const r = el.getBoundingClientRect();
    return t.kind === "essential" || model.layout === "horizontal"
      ? e.clientX > r.left + r.width / 2
      : e.clientY > r.top + r.height / 2;
  };
  el.ondragstart = (e) => {
    dragId = t.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", t.id);
    el.classList.add("dragging");
  };
  el.ondragend = () => {
    dragId = null;
    el.classList.remove("dragging");
    clearDropMarks();
  };
  el.ondragover = (e) => {
    const from = model.tabs.find((x) => x.id === dragId);
    if (!from || from.kind !== t.kind || from.id === t.id) return; // reorder within a group only
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    clearDropMarks();
    el.classList.add(isAfter(e) ? "drop-after" : "drop-before");
  };
  el.ondrop = async (e) => {
    e.preventDefault();
    const from = dragId;
    dragId = null;
    const after = isAfter(e);
    clearDropMarks();
    if (from) await moveTab(from, t.id, after);
  };
  return el;
}

/* ---------- actions ---------- */

async function select(id) {
  const t = model.tabs.find((x) => x.id === id);
  if (t?.direct) {
    if (id !== model.activeId) await browser.storage.local.set({ active: id });
    goDirect(t.url);
    return;
  }
  if (id === model.activeId) return;
  await browser.storage.local.set({ active: id });
}

$("directGo").onclick = () => {
  const t = model.tabs.find((x) => x.id === model.activeId);
  if (t) goDirect(t.url);
};

function clearDropMarks() {
  for (const el of rail.querySelectorAll(
    ".drop-before, .drop-after, .drop-into",
  ))
    el.classList.remove("drop-before", "drop-after", "drop-into");
}

async function moveTab(fromId, toId, after) {
  const tabs = model.tabs.slice();
  const fi = tabs.findIndex((t) => t.id === fromId);
  if (fi < 0) return;
  const [item] = tabs.splice(fi, 1);
  const ti = tabs.findIndex((t) => t.id === toId);
  if (ti < 0) return;
  // dropping next to a tab puts the dragged tab in that tab's folder (or takes it out of one)
  tabs.splice(ti + (after ? 1 : 0), 0, { ...item, folder: tabs[ti].folder });
  await browser.storage.local.set({ tabs });
}

async function moveTabIntoFolder(id, folderId) {
  const tabs = model.tabs.slice();
  const fi = tabs.findIndex((t) => t.id === id);
  if (fi < 0 || tabs[fi].kind === "essential") return;
  const [item] = tabs.splice(fi, 1);
  let last = -1;
  tabs.forEach((t, i) => {
    if (t.folder === folderId) last = i;
  });
  tabs.splice(last < 0 ? tabs.length : last + 1, 0, {
    ...item,
    kind: "pinned", // a tab put into a folder is pinned
    folder: folderId,
  });
  // open the folder so the tab is seen arriving
  const folders = model.folders.map((f) =>
    f.id === folderId ? { ...f, collapsed: false } : f,
  );
  await browser.storage.local.set({ tabs, folders });
}

async function removeFromFolder(id) {
  const tabs = model.tabs.map((t) =>
    t.id === id ? { ...t, folder: null } : t,
  );
  await browser.storage.local.set({ tabs });
}

async function moveFolder(fromId, toId, after) {
  const folders = model.folders.slice();
  const fi = folders.findIndex((f) => f.id === fromId);
  if (fi < 0) return;
  const [item] = folders.splice(fi, 1);
  const ti = folders.findIndex((f) => f.id === toId);
  if (ti < 0) return;
  folders.splice(ti + (after ? 1 : 0), 0, item);
  await browser.storage.local.set({ folders });
}

async function toggleFolder(id) {
  const folders = model.folders.map((f) =>
    f.id === id ? { ...f, collapsed: !f.collapsed } : f,
  );
  await browser.storage.local.set({ folders });
}

// keepTabs: the tabs stay, loose, where the folder was. Otherwise they are closed with it.
async function deleteFolder(id, keepTabs) {
  const folders = model.folders.filter((f) => f.id !== id);
  let tabs = model.tabs;
  let active = model.activeId;
  if (keepTabs) {
    tabs = tabs.map((t) => (t.folder === id ? { ...t, folder: null } : t));
  } else {
    const doomed = new Set(
      tabs.filter((t) => t.folder === id).map((t) => t.id),
    );
    tabs = tabs.filter((t) => !doomed.has(t.id));
    if (doomed.has(active)) active = tabs[0]?.id ?? null;
  }
  closePanel();
  closeFolderPanel();
  await browser.storage.local.set({ folders, tabs, active });
}

/* ---------- loaded / unloaded tabs ---------- */

// A tab only has a page (an iframe) once it has been opened. Tabs without one are shown greyed out.
function markLoaded() {
  for (const el of rail.querySelectorAll(".tab[data-id]"))
    el.classList.toggle(
      "unloaded",
      !made.has(el.dataset.id) &&
        !model.tabs.find((t) => t.id === el.dataset.id)?.direct,
    );
}

// Tabs in the order they appear in the bar.
function orderedTabs() {
  const pinned = model.tabs.filter((t) => t.kind === "pinned");
  return [
    ...model.tabs.filter((t) => t.kind === "essential"),
    ...model.folders.flatMap((f) => pinned.filter((t) => t.folder === f.id)),
    ...pinned.filter((t) => !t.folder),
    ...model.tabs.filter((t) => t.kind === "regular"),
  ];
}

// Where to go when the tab you are on is unloaded: the next loaded tab, else the previous one.
function unloadNeighbour(id) {
  const list = orderedTabs();
  const i = list.findIndex((t) => t.id === id);
  const loaded = (t) => t.id !== id && made.has(t.id);
  return (
    list.slice(i + 1).find(loaded) ||
    list.slice(0, i).reverse().find(loaded) ||
    null
  );
}

async function unloadTab(id) {
  const f = made.get(id);
  if (!f) return;
  const next = id === model.activeId ? unloadNeighbour(id) : null;
  if (id === model.activeId && !next) return; // nowhere else to go
  f.remove();
  made.delete(id);
  navInfo.delete(id);
  if (next) await browser.storage.local.set({ active: next.id });
  else markLoaded();
}

async function closeTab(id) {
  const i = model.tabs.findIndex((t) => t.id === id);
  // Pinned and Essential tabs can never be closed from here.
  if (i < 0 || model.tabs[i].kind !== "regular") return;
  const tabs = model.tabs.filter((t) => t.id !== id);
  let active = model.activeId;
  if (id === active) active = (tabs[i] || tabs[i - 1])?.id ?? null;
  closePanel();
  await browser.storage.local.set({ tabs, active });
}

async function setMobile(id, mobile) {
  const tabs = model.tabs.map((t) => (t.id === id ? { ...t, mobile } : t));
  await browser.storage.local.set({ tabs });
}

async function setDirect(id, direct) {
  const tabs = model.tabs.map((t) => (t.id === id ? { ...t, direct } : t));
  await browser.storage.local.set({ tabs });
  const t = tabs.find((x) => x.id === id);
  if (direct && id === model.activeId && t) goDirect(t.url);
}

async function setKind(id, kind) {
  const tabs = model.tabs.map((t) =>
    t.id === id
      ? { ...t, kind, folder: kind === "pinned" ? t.folder : null }
      : t,
  );
  await browser.storage.local.set({ tabs });
}

/* ---------- address bar ---------- */

const currentUrl = () => {
  const t = model.tabs.find((x) => x.id === model.activeId);
  return navInfo.get(model.activeId)?.url || t?.url || "";
};
const displayUrl = (u) => u.replace(/^https?:\/\//i, "").replace(/\/$/, "");

function updateAddr() {
  if (document.activeElement === addr) return; // never overwrite what the user is typing
  const url = currentUrl();
  addr.value = url ? displayUrl(url) : "";
  addr.title = url;
  $("copy").disabled = $("hist").disabled = !url;
}

// Turns whatever was typed into a URL, like a browser's address bar:
//  - full http(s) URLs are used as they are
//  - "/path", "?q" and "#hash" are relative to the current page
//  - "example.com/x", "localhost:3000", "192.168.1.5:8080" become links
//    (http for local/private addresses, https for everything else)
//  - anything else is a search with the engine chosen in settings
const HOSTLIKE =
  /^(localhost|\d{1,3}(\.\d{1,3}){3}|\[[0-9a-f:]+\]|[a-z0-9_-]+(\.[a-z0-9_-]+)+)(:\d+)?([/?#]\S*)?$/i;
const LOCALHOST =
  /^(localhost|127(\.\d{1,3}){3}|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|\[[0-9a-f:]+\]|[a-z0-9_-]+(\.[a-z0-9_-]+)*\.(local|lan|internal|home\.arpa))(?=[:/?#]|$)/i;

function resolveInput(raw, base) {
  raw = raw.trim();
  if (!raw) throw new Error("empty");
  let u;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) u = new URL(raw);
  else if (/^[/?#]/.test(raw) && /^https?:/i.test(base)) u = new URL(raw, base);
  else if (HOSTLIKE.test(raw))
    u = new URL((LOCALHOST.test(raw) ? "http://" : "https://") + raw);
  else u = new URL(SEARCH[model.search].replace("%s", encodeURIComponent(raw)));
  if (u.protocol !== "http:" && u.protocol !== "https:")
    throw new Error("scheme");
  return u;
}

async function navigateTo(raw) {
  const active = model.tabs.find((t) => t.id === model.activeId);
  const f = made.get(model.activeId);
  if (!f && !active?.direct) return;
  let u;
  try {
    u = resolveInput(raw, currentUrl() || HOME);
  } catch {
    toast("That doesn't look like a valid web address.");
    return;
  }
  if (!f) return goDirect(u.href); // full-page tab
  const granted = await hasHostAccess(u);
  goFrame(f, u.href, false);
  if (!granted)
    toast(
      `Access to ${u.hostname} wasn't granted, so the page may refuse to load if it blocks embedding.`,
    );
}

// The manifest already grants access to every http/https site, so this normally just confirms it.
// Only if that access was taken away (about:addons > Permissions) does it ask, and only then can it
// come back false. Checking first also means no user gesture is needed in the common case.
async function hasHostAccess(u) {
  const origins = [`${u.protocol}//${u.hostname}/*`];
  try {
    if (await browser.permissions.contains({ origins })) return true;
  } catch {}
  try {
    return await browser.permissions.request({ origins });
  } catch {
    return false;
  }
}

function goTo(url) {
  const f = made.get(model.activeId);
  if (f) goFrame(f, url, false);
}

addr.addEventListener("focus", () => {
  addr.value = currentUrl();
  addr.select();
});
addr.addEventListener("blur", () => {
  updateAddr();
  if (!urlslot.matches(":hover")) setHover("url", false, 160);
});
addr.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const v = addr.value;
    addr.blur();
    navigateTo(v);
  } else if (e.key === "Escape") {
    e.preventDefault();
    addr.blur();
  }
});

let copyTimer;
async function copyLink() {
  const url = currentUrl();
  if (!url) return;
  let ok = false;
  try {
    await navigator.clipboard.writeText(url);
    ok = true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta);
    ta.select();
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
  }
  if (!ok) return toast("Couldn't copy the link.");
  $("copy").classList.add("ok");
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => $("copy").classList.remove("ok"), 1300);
}
$("copy").onclick = copyLink;

/* ---------- per-tab page history (stored locally, never sent anywhere) ---------- */

let histTimer;
function saveHistory() {
  clearTimeout(histTimer);
  histTimer = setTimeout(
    () => browser.storage.local.set({ history: hist }),
    500,
  );
}

async function loadHistory() {
  try {
    const { history } = await browser.storage.local.get("history");
    if (history && typeof history === "object") hist = history;
  } catch {}
}

function pruneHistory(tabs) {
  let changed = false;
  for (const id of Object.keys(hist))
    if (!tabs.some((t) => t.id === id)) {
      delete hist[id];
      changed = true;
    }
  if (changed) saveHistory();
}

function recordHistory(id, url, title, info) {
  if (!/^https?:/i.test(url)) return;
  const list = (hist[id] ||= []);
  const head = list[0];
  if (head && head.url === url) {
    if (title && head.title !== title) {
      head.title = title;
      saveHistory();
    }
    return;
  }
  const settling = performance.now() < info.settleUntil;
  const entry = { url, title };
  if (head && settling && info.histInSettle) {
    list[0] = entry; // a redirect while the page is starting up replaces the entry before it
  } else {
    hist[id] = [entry, ...list.filter((h) => h.url !== url)].slice(0, 30);
    info.histInSettle = settling;
  }
  saveHistory();
}

function openHistory() {
  const list = hist[model.activeId] || [];
  const cur = currentUrl();
  const items = list.map((h) => {
    const b = document.createElement("button");
    b.className = "hitem" + (h.url === cur ? " cur" : "");
    b.setAttribute("role", "menuitem");
    const t = document.createElement("span");
    t.className = "t";
    t.textContent = h.title || displayUrl(h.url);
    const u = document.createElement("span");
    u.className = "u";
    u.textContent = displayUrl(h.url);
    b.append(t, u);
    b.onclick = () => {
      closeHistory();
      goTo(h.url);
    };
    return b;
  });
  if (!items.length) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No pages visited in this tab yet.";
    items.push(e);
  } else {
    const clear = document.createElement("button");
    clear.className = "hitem";
    clear.textContent = "Clear history for this tab";
    clear.onclick = () => {
      delete hist[model.activeId];
      saveHistory();
      closeHistory();
    };
    items.push(document.createElement("hr"), clear);
  }
  hmenu.replaceChildren(...items);
  hmenu.hidden = false;
  const f = $("field").getBoundingClientRect();
  const hb = $("hist").getBoundingClientRect();
  const w = Math.min(Math.max(f.width, 240), innerWidth - 12);
  hmenu.style.width = w + "px";
  hmenu.style.left =
    Math.max(6, Math.min(hb.right - w, innerWidth - w - 6)) + "px"; // under the button
  hmenu.style.top = hb.bottom + 4 + "px";
}

function closeHistory() {
  hmenu.hidden = true;
  if (!urlslot.matches(":hover") && document.activeElement !== addr)
    setHover("url", false, 160);
}

$("hist").onclick = () => (hmenu.hidden ? openHistory() : closeHistory());

/* ---------- context menu ---------- */

function closeMenu() {
  menu.hidden = true;
}

function showMenu(e, items) {
  menu.replaceChildren(
    ...items.map((it) => {
      if (!it) return document.createElement("hr");
      const [text, fn, hide] = it;
      const b = document.createElement("button");
      b.textContent = text;
      b.hidden = !!hide;
      b.setAttribute("role", "menuitem");
      b.onclick = () => {
        closeMenu();
        fn();
      };
      return b;
    }),
  );
  menu.hidden = false;
  const r = menu.getBoundingClientRect();
  menu.style.left =
    Math.max(4, Math.min(e.clientX, innerWidth - r.width - 4)) + "px";
  menu.style.top =
    Math.max(4, Math.min(e.clientY, innerHeight - r.height - 4)) + "px";
}

function openMenu(e, id) {
  const t = model.tabs.find((x) => x.id === id);
  if (!t) return;
  const canUnload =
    made.has(id) && (id !== model.activeId || !!unloadNeighbour(id));
  const items = [
    ["Edit…", () => openPanel(id)],
    ["Reload", () => reloadTab(id)],
    ["Unload tab", () => unloadTab(id), !canUnload],
    [
      t.mobile ? "Use desktop site" : "Use mobile site",
      () => setMobile(id, !t.mobile),
    ],
    [
      t.direct ? "Show in a frame" : "Open as full page",
      () => setDirect(id, !t.direct),
    ],
    null,
    ["Pin tab", () => setKind(id, "pinned"), t.kind === "pinned"],
    [
      "Add to Essentials",
      () => setKind(id, "essential"),
      t.kind === "essential",
    ],
    ["Make regular", () => setKind(id, "regular"), t.kind === "regular"],
  ];
  // Folders live in the Pinned area; putting a tab in one pins it.
  if (t.kind !== "essential") {
    items.push(null);
    if (t.folder)
      items.push(["Remove from folder", () => removeFromFolder(id)]);
    for (const f of model.folders)
      if (f.id !== t.folder)
        items.push([
          `Move to ${folderLabel(f)}`,
          () => moveTabIntoFolder(id, f.id),
        ]);
    items.push(["New folder with this tab…", () => openFolderPanel(null, id)]);
  }
  if (t.kind === "regular") items.push(null, ["Close tab", () => closeTab(id)]);
  showMenu(e, items);
}

function openFolderMenu(e, id) {
  const f = model.folders.find((x) => x.id === id);
  if (!f) return;
  const kids = model.tabs.filter((t) => t.folder === id);
  const loaded = kids.filter((t) => made.has(t.id) && t.id !== model.activeId);
  showMenu(e, [
    [f.collapsed ? "Expand folder" : "Collapse folder", () => toggleFolder(id)],
    ["New tab in folder…", () => openPanel(null, id)],
    ["Edit folder…", () => openFolderPanel(id)],
    [
      "Unload tabs in folder",
      () => loaded.forEach((t) => unloadTab(t.id)),
      !loaded.length,
    ],
    null,
    [
      kids.length ? "Ungroup (keep tabs)" : "Delete folder",
      () => deleteFolder(id, true),
    ],
    [
      "Delete folder and close tabs",
      () => deleteFolder(id, false),
      !kids.length,
    ],
  ]);
}

// Right-clicking empty space in the bar offers the "new" actions.
rail.addEventListener("contextmenu", (e) => {
  if (e.target.closest("[data-id], [data-folder], #foot")) return;
  e.preventDefault();
  showMenu(e, [
    ["New tab", () => openPanel(null)],
    ["New folder…", () => openFolderPanel(null)],
  ]);
});

document.addEventListener("pointerdown", (e) => {
  if (!menu.hidden && !menu.contains(e.target)) closeMenu();
  if (
    !hmenu.hidden &&
    !hmenu.contains(e.target) &&
    !$("hist").contains(e.target)
  )
    closeHistory();
});
window.addEventListener("blur", closeMenu);

/* ---------- add / edit panel ---------- */

function openPanel(id, folderId) {
  closeMenu();
  closeFolderPanel();
  editingId = id;
  pendingFolder = id ? null : folderId || null;
  const t = id ? model.tabs.find((x) => x.id === id) : null;
  if (id && !t) return;
  formTitle.textContent = t ? "Edit tab" : "Add tab";
  nameIn.value = t ? t.name : "";
  urlIn.value = t ? t.url : "";
  form.elements.kind.value = t ? t.kind : pendingFolder ? "pinned" : "regular";
  mobileIn.checked = t ? t.mobile === true : false;
  directIn.checked = t ? t.direct === true : false;
  $("save").textContent = t ? "Save" : "Add";
  form.hidden = false;
  const first = t ? nameIn : urlIn;
  first.focus();
  first.select();
}

function closePanel() {
  form.hidden = true;
  editingId = null;
  pendingFolder = null;
}

form.onsubmit = async (e) => {
  e.preventDefault();
  let raw = urlIn.value.trim();
  if (!raw) {
    urlIn.focus();
    return;
  }
  let u;
  try {
    u = resolveInput(raw, HOME);
  } catch {
    toast("That doesn't look like a valid web address.");
    return;
  }

  // Normally already granted by the manifest; see hasHostAccess.
  const granted = await hasHostAccess(u);
  const into = pendingFolder;

  await load();
  const entry = {
    name: nameIn.value.trim(),
    url: u.href,
    kind: form.elements.kind.value,
    mobile: mobileIn.checked,
    direct: directIn.checked,
  };
  const tabs = model.tabs.slice();
  const patch = {};
  let id;
  const at = editingId ? tabs.findIndex((t) => t.id === editingId) : -1;
  if (at >= 0) {
    tabs[at] = { ...tabs[at], ...entry };
    if (entry.kind !== "pinned") tabs[at].folder = null;
    id = tabs[at].id;
  } else {
    id = crypto.randomUUID();
    const folder =
      entry.kind !== "essential" && model.folders.some((f) => f.id === into)
        ? into
        : null;
    if (folder) entry.kind = "pinned";
    tabs.push({ id, ...entry, folder });
    if (folder)
      patch.folders = model.folders.map((f) =>
        f.id === folder ? { ...f, collapsed: false } : f,
      );
  }
  closePanel();
  await browser.storage.local.set({ tabs, active: id, ...patch });
  if (entry.direct) return goDirect(entry.url);

  if (!granted) {
    toast(
      `Access to ${u.hostname} wasn't granted, so the page may refuse to load if it blocks embedding. Edit the tab to try again.`,
    );
  }
};

/* ---------- folder panel ---------- */

for (const name of Object.keys(GLYPHS)) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "g";
  b.dataset.name = name;
  b.title = name;
  b.setAttribute("role", "radio");
  b.append(svgEl("0 0 16 16", [[GLYPHS[name]]]));
  b.onclick = () => {
    fGlyph = name;
    syncFolderForm();
  };
  fGlyphs.append(b);
}
fText.maxLength = FOLDER_TEXT_MAX;

function folderDraft() {
  if (folderForm.elements.ficon.value === "glyph")
    return { type: "glyph", name: fGlyph || Object.keys(GLYPHS)[0] };
  return normIcon({ type: "text", text: fText.value });
}

function syncFolderForm() {
  const glyph = folderForm.elements.ficon.value === "glyph";
  fText.hidden = glyph;
  fGlyphs.hidden = !glyph;
  const chosen = fGlyph || Object.keys(GLYPHS)[0];
  for (const b of fGlyphs.children) {
    const on = b.dataset.name === chosen;
    b.classList.toggle("sel", on);
    b.setAttribute("aria-checked", String(on));
  }
  fPreview.replaceChildren(folderIcon(folderDraft(), fName.value, true));
}

function openFolderPanel(id, withTab) {
  closeMenu();
  closePanel();
  const f = id ? model.folders.find((x) => x.id === id) : null;
  if (id && !f) return;
  folderEditing = id;
  folderWithTab = withTab || null;
  $("folderTitle").textContent = f ? "Edit folder" : "New folder";
  fName.value = f ? f.name : "New folder";
  const icon = f ? f.icon : { type: "auto" };
  folderForm.elements.ficon.value = icon.type === "glyph" ? "glyph" : "text";
  fText.value = icon.type === "text" ? icon.text : "";
  fGlyph = icon.type === "glyph" ? icon.name : null;
  $("fSave").textContent = f ? "Save" : "Create";
  folderForm.hidden = false;
  syncFolderForm();
  fName.focus();
  fName.select();
}

function closeFolderPanel() {
  folderForm.hidden = true;
  folderEditing = null;
  folderWithTab = null;
}

folderForm.addEventListener("input", syncFolderForm);
folderForm.addEventListener("change", syncFolderForm);
$("fCancel").onclick = closeFolderPanel;

folderForm.onsubmit = async (e) => {
  e.preventDefault();
  await load();
  const name = fName.value.trim();
  const icon = folderDraft();
  let folders = model.folders.slice();
  let id = folderEditing;
  if (id && folders.some((f) => f.id === id)) {
    folders = folders.map((f) => (f.id === id ? { ...f, name, icon } : f));
  } else {
    id = crypto.randomUUID();
    folders.push({ id, name, icon, collapsed: false });
  }
  const patch = { folders };
  if (folderWithTab)
    patch.tabs = model.tabs.map((t) =>
      t.id === folderWithTab && t.kind !== "essential"
        ? { ...t, kind: "pinned", folder: id }
        : t,
    );
  closeFolderPanel();
  await browser.storage.local.set(patch);
};

groups.regular.addEventListener(
  "wheel",
  (e) => {
    if (model.layout === "horizontal" && e.deltaY) {
      groups.regular.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  },
  { passive: false },
);

$("add").onclick = () => openPanel(null);
$("addfolder").onclick = () => openFolderPanel(null);
$("cancel").onclick = closePanel;
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!hmenu.hidden) closeHistory();
  else if (!menu.hidden) closeMenu();
  else if (!form.hidden) closePanel();
  else if (!folderForm.hidden) closeFolderPanel();
});

// Start from a clean slate in the background script, then draw.
Promise.resolve(browser.runtime.sendMessage({ ssb: "reset" }))
  .catch(() => {})
  .then(loadHistory)
  .finally(render);
