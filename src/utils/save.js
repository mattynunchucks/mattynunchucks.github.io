export const SAVE_KEY     = "cosmo_universe_save";
export const SAVE_VERSION = "CGUv1";

function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").toUpperCase();
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastTick: Date.now() }));
  } catch {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function exportSaveFile(state) {
  const payload = JSON.stringify({ ...state, lastTick: Date.now() });
  const encoded = btoa(unescape(encodeURIComponent(payload)));
  return `${SAVE_VERSION}:${simpleHash(payload)}:${encoded}`;
}

export function parseSaveFile(text) {
  const parts = text.trim().split(":");
  if (parts.length < 3) throw new Error("Invalid save format");
  const [version, hash, ...rest] = parts;
  if (version !== SAVE_VERSION) throw new Error(`Unknown version: ${version}`);
  const payload = decodeURIComponent(escape(atob(rest.join(":"))));
  if (simpleHash(payload) !== hash) throw new Error("Save file integrity check failed");
  return JSON.parse(payload);
}
