<!--
  TODO:
  - Replace the placeholder screenshots in preview-pictures/ (file names below).
  - Replace YOUR-USER/YOUR-REPO and the AMO link with this fork's real addresses.
-->

<div align="center">

<img src="icons/icon-128.png" alt="Web Sidebar icon" width="96" height="96">

# Web Sidebar

**A mini browser in Firefox's sidebar. Open any website as a named vertical or horizontal tab, with an address bar, search, back/forward, history and a per-tab mobile site switch.**

[![Get the add-on](https://img.shields.io/badge/Firefox-Get%20the%20add--on-FF7139?logo=firefox-browser&logoColor=white&style=for-the-badge)](https://addons.mozilla.org/en-US/firefox/addon/web-sidebar/)

![Firefox 142+](https://img.shields.io/badge/Firefox-142%2B-orange?logo=firefox-browser&logoColor=white)
![License: MIT](https://img.shields.io/github/license/YOUR-USER/YOUR-REPO)
![No data collected](https://img.shields.io/badge/data%20collected-none-brightgreen)

</div>

<p align="center">
  <img src="preview-pictures/PLACEHOLDER-main.png" alt="Web Sidebar showing a website in Firefox (placeholder)" width="720">
</p>

---

## What it does

Web Sidebar keeps the sites and apps you use most one keystroke away while you browse. Add an address, give it a name, and it lives in the Firefox sidebar as a tab. It opens with a DuckDuckGo tab in mobile mode, so you can search straight away.

Great for:

- Search, chat and reference sites you check all day
- Dashboards, media servers and home automation panels
- Dev servers (Vite, Next.js) and docs sites running locally or in Docker
- Phone-sized versions of sites, which fit a narrow sidebar far better than the desktop layout
- Anything you can reach at a web address

> Many large sites forbid being embedded, and some break when framed (logins, cookies). Sites that refuse may not load, and for ones that break you can try a **Full page** tab.

This project is a fork of my earlier Self-Hosted Sidebar. It keeps the tab bar and address bar, and widens the scope from self-hosted apps to any website.

## Screenshots

> Placeholders for now. Replace these files with real screenshots.

| Horizontal tabs                                                 | Vertical tabs                                               | Vertical, expanded on hover                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| ![Horizontal tabs](preview-pictures/PLACEHOLDER-horizontal.png) | ![Vertical tabs](preview-pictures/PLACEHOLDER-vertical.png) | ![Expanded on hover](preview-pictures/PLACEHOLDER-expanded.png) |

| Add or edit a tab, with the Mobile site switch                        |
| --------------------------------------------------------------------- |
| ![Mobile site switch](preview-pictures/PLACEHOLDER-mobile-toggle.png) |

## Features

**Tabs**

- **Horizontal or vertical.** The classic horizontal strip is the default, and vertical tabs in the style of Firefox and Zen are one setting away.
- **Essentials, Pinned and regular tabs.** Essentials are icon tiles outlined in the color of their favicon. Pinned and Essential tabs have no close button, so they cannot be closed by accident.
- **Mobile site, per tab.** A switch in the add and edit form (and "Use mobile site" in the right-click menu) makes a tab identify as Firefox on Android. Sites then serve their phone layout, which suits a narrow sidebar. The first tab, DuckDuckGo, starts with it on.
- **Full page, per tab.** For a site that still misbehaves inside a frame, a switch in the add and edit form (and "Open as full page" in the right-click menu) loads that site as the whole sidebar instead of inside a frame. The tab bar and address bar are not shown while it is open. A small edge tab on the left of the sidebar brings them back, and so does closing and reopening the sidebar. Full page tabs are not kept loaded, and the Mobile site switch does not apply to them.
- **Named tabs.** Give each site a name, or leave it blank to show the host or port.
- **Tabs stay loaded.** Switching keeps each page's state, scroll position and connections.
- **Unloaded tabs are greyed out.** Only tabs you have opened hold a page; the rest are dimmed until you click them. Right-click a loaded tab and choose **Unload tab** to free its page. Unloading the tab you are on moves you to the next loaded tab.
- **Folders.** Collapsible folders live in the Pinned area, like in Zen, and any tab you put into one is pinned automatically (Essentials cannot go in folders). A folder's icon holds up to two letters (taken from its name unless you type your own) or a preset icon. Drag tabs in and out, drag folders to reorder them, and right-click a folder to edit it, add a tab, unload its tabs, ungroup it or delete it. Tabs you take out of a folder stay pinned. A collapsed folder still shows the tab you are on.
- **Any address.** Websites, `localhost`, `127.0.0.1`, LAN IPs, `.local` names or your own domain, over http or https.
- **Easy editing.** Double-click a tab to edit it, right-click for a menu (edit, reload, unload, mobile or desktop site, open as full page, pin, add to Essentials, move to a folder, close), and drag to reorder within a group. Close a regular tab with the x that appears on hover, or with a middle-click.

**Address bar**

- **Back, forward and reload.** Back and forward only appear when there is somewhere to go.
- **Address field with a copy-link button.** Type an address and press Enter to go there. Anything that is not an address is searched with the engine you chose.
- **Search engines.** DuckDuckGo, Google, Bing, Brave Search, Startpage or Ecosia.
- **Page history for each tab.** A button on the right lists the pages you visited in that tab, so you can jump straight to one.
- **Placement.** A bar across the top with vertical tabs, and below the tab strip with horizontal tabs. It can be turned off, and back, forward and reload then move to the bottom toolbar.

**Layout and look**

- **Compact mode.** Shrinks the vertical tab bar to a thin strip of icons. It can expand when hovered, floating over the page or pushing it aside.
- **Auto-hide.** Hides the tab bar, the address bar, or both until you hover their edge. It works on its own or together with compact mode.
- **Display modes.** Favicon and name, favicon only, or name only.
- **Three sizes.** Small, medium (matches Zen's own sidebar) and large.
- **Essentials box.** Show a background box on every Essential, only on the selected one, or none.
- **Toolbar buttons.** Show or hide the collapse button and the back and forward buttons.
- **Keyboard shortcut.** `Alt+Shift+W` toggles the sidebar.

## Install

[![Add to Firefox](https://img.shields.io/badge/Add%20to%20Firefox-FF7139?logo=firefox-browser&logoColor=white&style=for-the-badge)](https://addons.mozilla.org/en-US/firefox/addon/web-sidebar/)

## Usage

1. Open the sidebar with `Alt+Shift+W`. It starts with a DuckDuckGo tab in mobile mode.
2. Click **New tab**, enter an address or a search (for example `wikipedia.org` or `localhost:8080`), an optional name, a type (Regular, Pinned or Essential), and choose whether to use the **Mobile site** or open it as a **Full page**.
3. To change a tab later, double-click it, or right-click it and choose **Edit…**, **Use mobile site**, **Use desktop site** or **Open as full page**.
   To group tabs, right-click empty space in the tab bar and choose **New folder…** (with vertical tabs there is also a folder button next to **New tab**), or right-click a tab and choose **New folder with this tab…**. Folders sit in the Pinned area, and tabs you put in one are pinned.
4. Open the settings from the gear at the bottom of the tab bar, or from `about:addons`, to change layout, search engine, compact mode, auto-hide and appearance.

To change the shortcut, open `about:addons`, click the gear icon and choose **Manage Extension Shortcuts**.

## Settings

| Setting         | Options                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Search engine   | DuckDuckGo, Google, Bing, Brave Search, Startpage or Ecosia. Used for anything typed in the address bar that is not an address.  |
| Tab layout      | Horizontal (classic strip, the default), or vertical.                                                                            |
| Tab bar side    | Left or right of the sidebar panel (vertical tabs only).                                                                         |
| Address bar     | Show or hide it.                                                                                                                 |
| Compact mode    | Thin icon strip (vertical tabs only), with an option to expand on hover.                                                         |
| Auto-hide       | Vertical tabs: off, address bar only, tab bar only, or both. Horizontal tabs: one switch for the strip and address bar together. |
| Hover style     | Float over the page, or push the page aside. Applies to compact expansion and to auto-hidden bars.                               |
| Toolbar buttons | Collapse button, back and forward. Settings and reload are always shown.                                                         |
| Tab display     | Favicon and name, favicon only, or name only.                                                                                    |
| Tab size        | Small, medium or large.                                                                                                          |
| Essentials box  | On every Essential, only on the selected one, or off.                                                                            |

The mobile site and full page switches are per tab, so they live in each tab's add and edit form rather than here.

Settings that have no effect for your current combination are greyed out.

> Firefox decides which side of the window the sidebar is on. "Tab bar side" moves the tabs inside the panel. To move the whole sidebar, use Firefox's own sidebar settings.

## Permissions

| Permission                         | Why                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage`                          | Saves your tabs (including each tab's mobile setting), your settings and each tab's recently visited pages locally.                                                                                                                                                                                                                                                                                                         |
| `http://*/*`, `https://*/*`        | Granted at install, so any site you open in a tab works without a per-site prompt. It is used to load pages and their icons, and by the two features below. The extension only contacts addresses you add or type.                                                                                                                                                                                                          |
| `webRequest`, `webRequestBlocking` | Used in three places, always for pages shown inside this extension's sidebar and never for normal tabs: removing `X-Frame-Options` and the CSP `frame-ancestors` directive so pages can load in the iframe, sending a mobile `User-Agent` header for tabs set to Mobile site, and rewriting a few "am I framed?" checks in the scripts those pages load, which would otherwise throw inside the sidebar and break the site. |

For frames in this sidebar, a small helper script (`frame-nav.js`) is also registered. It stays idle until the sidebar page greets it, reports the frame's address, title and back/forward state back to the sidebar, and makes no network requests. For tabs set to Mobile site it also makes `navigator.userAgent`, `appVersion` and `platform` match the mobile header, so sites that check in JavaScript agree with the request. In a Full page tab, where the sidebar itself shows the site, the same script asks the background script whether it is running in the sidebar and only then adds a small edge tab that returns to the tab bar. It does nothing in normal tabs. No extra permission is needed for it, for the address bar, or for the copy-link button.

## Privacy

The extension collects no data and sends nothing to the developer or any third party. It only contacts the addresses you add or type, to load the page and find its icon. Your tabs, settings and the list of pages visited in each tab (address and title, up to 30 per tab) are stored locally with `storage.local`. A tab's list can be cleared from the history menu and is deleted when you close the tab.

## Known limits

- Many sites forbid being embedded. Large public sites and single sign-on pages may refuse to load.
- Mobile site changes the identity the page sees (the `User-Agent` header, and `navigator.userAgent`, `appVersion` and `platform`). It does not emulate a phone screen or touch input, so a site that decides by other signals may still show its desktop layout. Changing a tab's mobile setting reloads that tab.
- Back and forward, the live address and the page history rely on the helper script. If it cannot run on a page, the address bar shows the tab's saved address and back and forward stay hidden.
- Redirects and routing that a page performs while it is loading do not count as history, so Back does not appear until you navigate within the page yourself.
- Some sites check whether they are in a frame and stop working. The extension adjusts the common checks (comparing `window.top` or `window.parent` with the window) in scripts loaded inside the sidebar, but a site that detects framing another way can still misbehave. Open it as a **Full page** tab instead. The adjustment holds each script until it has downloaded, so heavy sites can paint slightly later.
- A Full page tab replaces the sidebar's own interface while it is open, so there is no tab bar or address bar until you click the edge tab or reopen the sidebar. It is not kept loaded and ignores the Mobile site switch.
- For an https site with a self-signed certificate, open it once in a normal tab and accept the certificate.
- Folders live in the Pinned area and hold pinned tabs only (putting a tab in one pins it), so Essentials cannot go in them. They sit above your loose pinned tabs. With horizontal tabs a folder is a chip followed by its tabs.
- Firefox unloads sidebar content when the sidebar is closed or switched to another panel (such as History), so pages reload the next time you open it.

## Development

There is no build step.

> **Note:** These instructions use `bunx` for speed, but you can still use `npx` perfectly fine if you prefer (just replace `bunx` with `npx` in the commands below).

1. Check the extension

   ```bash
   bunx web-ext lint
   ```

2. Launch in a temporary Firefox profile

   ```bash
   bunx web-ext run
   ```

3. Create the zip

   ```bash
   bunx web-ext build
   ```

Files:

| File                         | Purpose                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.json`              | Extension manifest.                                                                                                                       |
| `background.js`              | Removes frame-blocking headers, sends the mobile User-Agent, adjusts framing checks in scripts and registers the helper script.           |
| `frame-nav.js`               | Helper script that reports back/forward state and address, aligns `navigator` for mobile, and adds the return edge tab on Full page tabs. |
| `sidebar.html`, `sidebar.js` | The sidebar: tab bar, address bar, history menu, add and edit form.                                                                       |
| `options.html`, `options.js` | The settings page.                                                                                                                        |

Issues and pull requests are welcome. Please ensure you fork the repository and submit all Pull Requests to the `dev` branch, as this project follows a `dev` -> `main` workflow.

## License

[MIT](LICENSE)

---

<sub>Not affiliated with any of the sites or projects you may choose to embed.</sub>
