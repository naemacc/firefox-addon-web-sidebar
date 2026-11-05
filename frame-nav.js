// Runs inside pages framed by the sidebar (registered by background.js for
// hosts the user granted). It stays idle until the sidebar page sends a
// "hello" message, so it does nothing in normal tabs or in other sites' frames.
//
// For tabs set to the mobile site it also makes navigator.userAgent match the header.
//
// It reports whether Back/Forward are possible (using the Navigation API when
// the browser has it) and performs back/forward when asked.
(() => {
  "use strict";
  if (window === window.top) {
    returnButton();
    return;
  }

  // When a tab is opened as a full page, the sidebar itself shows the site and nothing of the
  // wrapper is left. Add a small edge tab that brings the wrapper back. Normal browser tabs are
  // excluded by the background script (it only says yes for the sidebar's top document).
  function returnButton() {
    Promise.resolve(browser.runtime.sendMessage({ ssb: "isDirect" }))
      .then((yes) => {
        if (yes !== true) return;
        const add = () => {
          const host = document.createElement("div");
          host.style.cssText =
            "all:initial;position:fixed;left:0;top:50%;z-index:2147483647";
          const root = host.attachShadow({ mode: "closed" });
          root.innerHTML = `<style>
            button{all:unset;box-sizing:border-box;display:grid;place-items:center;
              width:10px;height:44px;margin-top:-22px;border-radius:0 8px 8px 0;
              background:#6c8cff;opacity:.35;cursor:pointer;color:#fff;
              font:600 15px system-ui,sans-serif;overflow:hidden;
              transition:width .12s ease,opacity .12s ease}
            button:hover,button:focus-visible{width:26px;opacity:1}
          </style><button title="Back to Web Sidebar tabs" aria-label="Back to Web Sidebar tabs">\u2039</button>`;
          root.querySelector("button").onclick = () =>
            browser.runtime.sendMessage({ ssb: "home" }).catch(() => {});
          document.documentElement.appendChild(host);
        };
        if (document.documentElement) add();
        else document.addEventListener("DOMContentLoaded", add, { once: true });
      })
      .catch(() => {});
  }

  // Tabs set to "Mobile site" are framed with this name (see sidebar.js). The background script
  // already sends a mobile User-Agent header for them; this makes navigator.* agree with it.
  // The name is only read, never written, and nothing happens for any other frame.
  if (window.name === "ssb-mobile") {
    try {
      const v = /Firefox\/(\d+)/.exec(navigator.userAgent)?.[1] || "142";
      const fake = {
        userAgent: `Mozilla/5.0 (Android 14; Mobile; rv:${v}.0) Gecko/${v}.0 Firefox/${v}.0`,
        appVersion: "5.0 (Android 14)",
        platform: "Linux armv81",
      };
      const proto = Object.getPrototypeOf(window.wrappedJSObject.navigator);
      for (const [key, value] of Object.entries(fake))
        Object.defineProperty(proto, key, {
          get: exportFunction(() => value, window),
          configurable: true,
          enumerable: true,
        });
    } catch {}
  }

  const EXT = browser.runtime.getURL("").replace(/\/$/, ""); // moz-extension://<uuid>
  let id = null;
  let last = "";
  let timer = null;

  function snapshot() {
    const nav = window.navigation;
    const native = !!nav && typeof nav.canGoBack === "boolean";
    let index = -1;
    let length = 0;
    if (native) {
      try {
        index = nav.currentEntry ? nav.currentEntry.index : -1;
        length = nav.entries().length;
      } catch {}
    }
    return {
      native,
      canBack: native && nav.canGoBack === true,
      canForward: native && nav.canGoForward === true,
      index,
      length,
      url: location.href,
      title: document.title,
    };
  }

  function report(force) {
    if (!id) return;
    const s = snapshot();
    const sig = JSON.stringify(s);
    if (force !== true && sig === last) return;
    last = sig;
    // targetOrigin limits delivery to our own sidebar page.
    window.parent.postMessage({ ssb: "nav", id, ...s }, EXT);
  }

  function step(dir) {
    const nav = window.navigation;
    if (!nav) return;
    try {
      const r =
        dir === "back"
          ? nav.canGoBack && nav.back()
          : nav.canGoForward && nav.forward();
      if (r) {
        r.committed?.catch(() => {});
        r.finished?.catch(() => {});
      }
    } catch {}
    setTimeout(report, 150);
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== EXT) return; // only our sidebar page may talk to us
    const m = e.data;
    if (!m || typeof m !== "object") return;

    if (m.ssb === "hello" && typeof m.id === "string") {
      id = m.id;
      report(true);
      if (!timer) {
        timer = setInterval(report, 400);
        window.navigation?.addEventListener?.("currententrychange", () =>
          report(),
        );
      }
    } else if (m.ssb === "back" || m.ssb === "forward") {
      step(m.ssb);
    } else if (m.ssb === "reload") {
      location.reload(); // reloads in place without adding a history entry
    }
  });
})();
