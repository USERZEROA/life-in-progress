const REGULAR_STORAGE_KEY = "life-in-progress:v1";
const DEMO_TOKEN_KEY = "life-in-progress:local-demo-token";
const VALID_TOKEN = /^[a-z0-9-]{8,64}$/i;

/** A new local navigation gets a fresh demo; a reload or linked compact view keeps its demo. */
export function getStorageContext() {
  const localPreview = ["127.0.0.1", "localhost"].includes(location.hostname) && location.port === "4173";
  if (!localPreview) return { storageKey: REGULAR_STORAGE_KEY, demoToken: null };

  const requestedToken = new URL(location.href).searchParams.get("demo");
  let demoToken = VALID_TOKEN.test(requestedToken || "") ? requestedToken : null;
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  if (!demoToken && navigationType === "reload") {
    try {
      const savedToken = sessionStorage.getItem(DEMO_TOKEN_KEY);
      if (VALID_TOKEN.test(savedToken || "")) demoToken = savedToken;
    } catch { /* A fresh token still allows setup when session storage is unavailable. */ }
  }
  if (!demoToken) {
    demoToken = globalThis.crypto?.randomUUID?.()
      || Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }
  try { sessionStorage.setItem(DEMO_TOKEN_KEY, demoToken); } catch { /* Setup remains available. */ }
  return { storageKey: `life-in-progress:local-demo:${demoToken}`, demoToken };
}
