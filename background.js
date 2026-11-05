// Lets the sidebar embed any website.
//
// Only for frames loaded inside this extension's own sidebar, it removes
// X-Frame-Options and the frame-ancestors part of any Content-Security-Policy.
// Normal browser tabs are never touched. The extension holds http/https host
// access from install, so no per-site prompt is needed.
//
// It sends a mobile User-Agent for frames of tabs set to "Mobile site" (see applyMobile below).
//
// It also registers frame-nav.js on those same hosts. That script lets the
// sidebar know whether Back/Forward are possible inside a framed page, and it
// only does anything after the sidebar page sends it a handshake message.

const EXT_BASE = browser.runtime.getURL("");
let current = null;
let uaListener = null;
let navScript = null;
let queue = Promise.resolve();

function allowEmbedding(details) {
  // Leave frames alone unless the top of the frame tree is our own sidebar page.
  const chain = details.frameAncestors;
  const top =
    chain && chain.length ? chain[chain.length - 1].url : details.documentUrl;
  if (!top || !top.startsWith(EXT_BASE)) return {};

  const headers = [];
  for (const h of details.responseHeaders) {
    const name = h.name.toLowerCase();
    if (name === "x-frame-options") continue;
    if (name === "content-security-policy" && h.value) {
      const value = h.value
        .split(";")
        .filter((d) => !d.trim().toLowerCase().startsWith("frame-ancestors"))
        .join(";");
      if (value.trim()) headers.push({ name: h.name, value });
      continue;
    }
    headers.push(h);
  }
  return { responseHeaders: headers };
}

// ---------- mobile site ----------
// A tab set to "Mobile site" has its frame sent with a Firefox-on-Android User-Agent.
// Before loading a frame, the sidebar says which URL it is about to load and whether it should be
// mobile ("expect"). The first request that matches, coming from a direct child frame of the
// sidebar page, claims that note, and from then on the frame (and any frames inside it) is
// treated as mobile or not, whatever it navigates to.
const frameMobile = new Map(); // frameId -> boolean
let pending = []; // [{ url, mobile, t }]
const PENDING_MS = 15000;
const FF_VERSION = /Firefox\/(\d+)/.exec(navigator.userAgent)?.[1] || "142";
const MOBILE_UA = `Mozilla/5.0 (Android 14; Mobile; rv:${FF_VERSION}.0) Gecko/${FF_VERSION}.0 Firefox/${FF_VERSION}.0`;

function normUrl(u) {
  try {
    const x = new URL(u);
    x.hash = "";
    return x.href;
  } catch {
    return String(u);
  }
}

function inSidebar(details) {
  const chain = details.frameAncestors;
  const top =
    chain && chain.length ? chain[chain.length - 1].url : details.documentUrl;
  return !!top && top.startsWith(EXT_BASE);
}

function applyMobile(details) {
  let on = frameMobile.get(details.frameId);
  if (
    on === undefined &&
    details.type === "sub_frame" &&
    details.parentFrameId === 0 &&
    inSidebar(details)
  ) {
    const now = Date.now();
    pending = pending.filter((p) => now - p.t < PENDING_MS);
    const i = pending.findIndex((p) => p.url === normUrl(details.url));
    if (i >= 0) {
      on = pending[i].mobile;
      pending.splice(i, 1);
      if (frameMobile.size > 500) frameMobile.clear();
      frameMobile.set(details.frameId, on);
    }
  }
  if (!on && details.frameAncestors)
    on = details.frameAncestors.some(
      (a) => frameMobile.get(a.frameId) === true,
    );
  if (!on) return {};
  return {
    requestHeaders: details.requestHeaders.map((h) =>
      h.name.toLowerCase() === "user-agent" ? { ...h, value: MOBILE_UA } : h,
    ),
  };
}

// ---------- framing-check patches ----------
// Many sites read (window.top || window).location.origin to find out where they run. Inside the
// sidebar the top window is our own extension page, so Firefox throws and the site's script
// stops (duck.ai, for one, then leaves its Ask button disabled). For scripts loaded inside the
// sidebar, the expression is rewritten to use the frame's own location. window.top cannot be
// faked from a content script, so rewriting the script is the only option. The patterns are
// kept narrow on purpose; anything that does not match is passed through unchanged.
const PATCHES = [
  [/\(\s*window\.top\s*\|\|\s*window\s*\)\.location\b/g, "(window).location"],
  [
    /\(\s*window\.parent\s*\|\|\s*window\s*\)\.location\b/g,
    "(window).location",
  ],
  [/\bwindow\.top\.location\.origin\b/g, "window.location.origin"],
  // "am I framed?" comparisons: framed is reported as not framed
  [
    /\b(?:window\.self|window)\s*([!=]==?)\s*window\.top(?![\w$.])/g,
    (_m, op) => (op[0] === "!" ? "false" : "true"),
  ],
  [
    /\bwindow\.top\s*([!=]==?)\s*(?:window\.self|window)(?![\w$.])/g,
    (_m, op) => (op[0] === "!" ? "false" : "true"),
  ],
  [
    /\bwindow\.parent\s*([!=]==?)\s*(?:window\.self|window)(?![\w$.])/g,
    (_m, op) => (op[0] === "!" ? "false" : "true"),
  ],
  [
    /\b(?:window\.self|window)\s*([!=]==?)\s*window\.parent(?![\w$.])/g,
    (_m, op) => (op[0] === "!" ? "false" : "true"),
  ],
];
const PATCH_DEBUG = false; // true: log every patched script in this background page's console
const PATCH_QUICK = /window\s*\.\s*(top|parent)/; // cheap test before running the patterns
let patchListener = null;

function patchScript(details) {
  if (!inSidebar(details)) return {};
  let filter;
  try {
    filter = browser.webRequest.filterResponseData(details.requestId);
  } catch {
    return {};
  }
  const chunks = [];
  filter.ondata = (e) => chunks.push(e.data);
  filter.onstop = () => {
    let out = null;
    try {
      const dec = new TextDecoder("utf-8", { fatal: true });
      let text = "";
      for (const c of chunks) text += dec.decode(c, { stream: true });
      text += dec.decode();
      if (PATCH_QUICK.test(text)) {
        let hits = 0;
        for (const [re, to] of PATCHES)
          text = text.replace(re, (...a) => {
            hits++;
            return typeof to === "function" ? to(...a) : to;
          });
        if (PATCH_DEBUG) {
          // show where scripts compare top/parent to something, in case a check is not covered
          const cmp =
            /.{0,60}(?:\b(?:top|parent)\b\s*[!=]==?|[!=]==?\s*(?:window\.)?(?:top|parent)\b).{0,60}/g;
          const seen = (text.match(cmp) || []).slice(0, 6);
          if (seen.length) console.log("[patch:left]", details.url, seen);
        }
        if (hits) {
          out = new TextEncoder().encode(text);
          if (PATCH_DEBUG) console.log("[patch]", details.url, "hits:", hits);
        }
      }
    } catch {
      out = null; // not valid UTF-8 or anything unexpected: leave the script as it was
    }
    if (out) filter.write(out);
    else for (const c of chunks) filter.write(c);
    filter.close();
  };
  filter.onerror = () => {};
  return {};
}

// Full-page tabs: the sidebar itself is navigated to the site, and frame-nav.js (running there as
// the top document) asks whether it is that situation. A normal browser tab always has sender.tab;
// the sidebar never does, so the two cannot be confused. "home" puts our own sidebar page back.
const isSidebarTop = (sender) => !sender.tab && sender.frameId === 0;

// Only messages from our own sidebar page are accepted.
browser.runtime.onMessage.addListener((m, sender) => {
  if (m && m.ssb === "isDirect") return Promise.resolve(isSidebarTop(sender));
  if (m && m.ssb === "home" && isSidebarTop(sender))
    return browser.sidebarAction.setPanel({ panel: EXT_BASE + "sidebar.html" });
  if (!m || !sender.url || !sender.url.startsWith(EXT_BASE + "sidebar.html"))
    return;
  if (m.ssb === "reset") {
    frameMobile.clear();
    pending = [];
    return Promise.resolve();
  }
  if (m.ssb === "expect" && typeof m.url === "string") {
    // wait for any permission change to finish registering, so the first load is covered too
    return queue.then(() => {
      pending.push({
        url: normUrl(m.url),
        mobile: m.mobile === true,
        t: Date.now(),
      });
    });
  }
});

async function register() {
  const { origins = [] } = await browser.permissions.getAll();
  const urls = origins.filter((o) => /^(https?|\*):\/\//.test(o));

  if (current) {
    browser.webRequest.onHeadersReceived.removeListener(current);
    current = null;
  }
  if (uaListener) {
    browser.webRequest.onBeforeSendHeaders.removeListener(uaListener);
    uaListener = null;
  }
  if (patchListener) {
    browser.webRequest.onBeforeRequest.removeListener(patchListener);
    patchListener = null;
  }
  if (navScript) {
    try {
      await navScript.unregister();
    } catch {}
    navScript = null;
  }
  if (!urls.length) return;

  current = allowEmbedding;
  browser.webRequest.onHeadersReceived.addListener(
    current,
    { urls, types: ["sub_frame"] },
    ["blocking", "responseHeaders"],
  );

  // tabId -1 is the sidebar (it is not a browser tab), so ordinary tabs never reach this listener
  uaListener = applyMobile;
  browser.webRequest.onBeforeSendHeaders.addListener(
    uaListener,
    { urls, tabId: -1 },
    ["blocking", "requestHeaders"],
  );

  patchListener = patchScript;
  browser.webRequest.onBeforeRequest.addListener(
    patchListener,
    { urls, types: ["script"], tabId: -1 },
    ["blocking"],
  );

  try {
    navScript = await browser.contentScripts.register({
      matches: urls,
      js: [{ file: "frame-nav.js" }],
      allFrames: true,
      runAt: "document_start",
    });
  } catch (err) {
    console.warn("Could not register frame-nav.js", err);
  }
}

// Serialise calls so quick permission changes cannot interleave.
const schedule = () => {
  queue = queue.then(register).catch((err) => console.error(err));
};

browser.permissions.onAdded.addListener(schedule);
browser.permissions.onRemoved.addListener(schedule);
schedule();

// Older versions stored a three-way "bar" setting (full / compact / hidden) and a hover
// value of "none". Convert them once to the independent compact / autohide / expand settings.
async function migrateSettings() {
  const s = await browser.storage.local.get(["bar", "hover"]);
  if (s.bar === undefined && s.hover !== "none") return;
  const patch = {};
  if (s.bar !== undefined) {
    patch.compact = s.bar === "compact";
    patch.autohide = s.bar === "hidden" ? "tabs" : "none";
  }
  if (s.hover === "none") {
    patch.hover = "overlay";
    patch.expand = false;
  }
  await browser.storage.local.set(patch);
  if (s.bar !== undefined) await browser.storage.local.remove("bar");
}
migrateSettings().catch((err) => console.error(err));
