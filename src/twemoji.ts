// X draws emoji with Twemoji, not the OS set. These two SVGs are vendored
// from twitter/twemoji v14.0.2 (CC-BY 4.0) so the preview matches the feed.
import squid from "./twemoji/1f991.svg?url";
import planet from "./twemoji/1fa90.svg?url";

const GLYPHS: Readonly<Record<string, string>> = {
  "🦑": squid,
  "🪐": planet,
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    if (ch === '"') return "&quot;";
    return "&#39;";
  });
}

/** Safe HTML: text escaped, 🦑 and 🪐 replaced with Twemoji <img> (alt keeps the glyph). */
export function twemojiHtml(text: string): string {
  return escapeHtml(text).replace(/🦑|🪐/g, (ch) => {
    const src = GLYPHS[ch];
    if (!src) return ch;
    return `<img class="twemoji" src="${src}" alt="${ch}" draggable="false" />`;
  });
}
