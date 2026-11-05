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
    on = details.frameAncestors.some((a) => frameMobile.get(a.frameId) === true);
  if (!on) return {};
  return {
    requestHeaders: details.requestHeaders.map((h) =>
      h.name.toLowerCase() === "user-agent" ? { ...h, value: MOBILE_UA } : h,
    ),
  };
}

// Only messages from our own sidebar page are accepted.
browser.runtime.onMessage.addListener((m, sender) => {
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
