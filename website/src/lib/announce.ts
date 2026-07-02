// Screen-reader announcements via a singleton aria-live region.

let region: HTMLElement | null = null;

function ensureRegion(): HTMLElement {
  if (region && document.body.contains(region)) return region;
  region = document.createElement("div");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("role", "status");
  region.className = "sr-only";
  document.body.appendChild(region);
  return region;
}

export function announce(message: string) {
  const el = ensureRegion();
  el.textContent = "";
  // small delay so repeated identical messages are re-announced
  setTimeout(() => {
    el.textContent = message;
  }, 30);
}
