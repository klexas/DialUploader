/**
 * styles.ts — injects the minimal CSS needed for animations/LEDs into <head>.
 * Called from a useEffect so it only runs in the browser.
 * The singleton guard prevents duplicate style tags.
 */

let injected = false;

export function injectStyles(): void {
  if (injected || typeof document === 'undefined') return;
  injected = true;

  const css = `
@keyframes _dul-blink {
  0%,49%{opacity:1}50%,100%{opacity:0}
}
@keyframes _dul-blink-fast {
  0%,24%{opacity:1}25%,74%{opacity:0}75%,100%{opacity:1}
}
._dul-blink   { animation: _dul-blink      1s   step-end infinite }
._dul-blink-f { animation: _dul-blink-fast 0.3s step-end infinite }
._dul-led-g { color:#00ff00; text-shadow:0 0 5px #00ff00 }
._dul-led-y { color:#ffff00; text-shadow:0 0 5px #ffff00 }
._dul-led-r { color:#ff5555; text-shadow:0 0 5px #ff5555 }
._dul-led-off{ opacity:.2 }
._dul-btn:hover{ background:rgba(51,255,51,.12)!important }
._dul-btn:focus{ outline:1px dashed currentColor; outline-offset:2px }
`;

  const el = document.createElement('style');
  el.id = 'dial-up-loader-css';
  el.textContent = css;
  document.head.appendChild(el);
}

/** Reset for tests / SSR hot-reload scenarios. */
export function resetStyleInjection(): void {
  injected = false;
}
