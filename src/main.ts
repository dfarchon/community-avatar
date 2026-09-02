import "./fonts/fonts.css";
import "./style.css";
import { tokens } from "./tokens";
import { twemojiHtml } from "./twemoji";
import { downloadCanvasPng, copyText } from "./export";
import { CANVAS_SIZE, drawPixelRing } from "./ring";
import { env } from "./env";
import { iconDiscord, iconTelegram, iconX } from "./icons";

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

const FAMILY_SUFFIX = "(🦑,🪐)";

const maybeApp = document.getElementById("app");
if (!maybeApp) throw new Error("#app missing");
const app = maybeApp;

app.innerHTML = `
  <div class="workshop-page">
    <header class="workshop-head">
      <p class="tagline">
        <span>If you share the DFArchon team's philosophy,</span>
        <span>please add this ring to your X avatar</span>
        <span>and <span id="tagline-suffix"></span> after your display name.</span>
      </p>
      <a class="site-link" href="${escapeAttr(env.siteUrl)}" target="_blank" rel="noreferrer">${escapeAttr(env.siteLabel)}</a>
    </header>
    <article class="logo-card">
      <div class="logo-preview">
        <div class="dropzone" id="dropzone">
          <p><strong>Drop your X avatar</strong> or</p>
          <label class="file-btn">Choose file<input type="file" id="file-input" accept="image/*" hidden /></label>
        </div>
        <div class="preview hidden" id="preview">
          <canvas id="canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
        </div>
        <canvas class="ring-guide" id="ring-guide" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" aria-hidden="true"></canvas>
      </div>
      <label class="slider">
        <span>Zoom</span>
        <input id="zoom" type="range" min="1" max="3" step="0.01" value="1" />
        <span class="ratio-read" id="zoom-read">1.00</span>
      </label>
      <div class="dl-row">
        <button type="button" id="dl-ring" disabled>Download with ring</button>
        <button type="button" id="dl-plain" disabled>Download without ring</button>
      </div>
      <div class="suffix-block">
        <label class="suffix-field" for="name-input">
          <span class="suffix-label">Your X display name</span>
          <input type="text" id="name-input" autocomplete="off" spellcheck="false" placeholder="your name on X" />
        </label>
        <div class="suffix-out">
          <span class="suffix-label">Copy this into your X display name</span>
          <div class="suffix-result-row">
            <p class="suffix-result" id="name-result"></p>
            <button type="button" id="copy-suffixed">Copy</button>
          </div>
          <p class="suffix-hint">Paste it as your display name on X </p>
        </div>
      </div>
    </article>
    <nav class="socials" aria-label="DFArchon">
      <a class="social" href="${escapeAttr(env.xUrl)}" target="_blank" rel="noreferrer" aria-label="X">${iconX}</a>
      <a class="social" href="${escapeAttr(env.discordUrl)}" target="_blank" rel="noreferrer" aria-label="Discord">${iconDiscord}</a>
      <a class="social" href="${escapeAttr(env.telegramUrl)}" target="_blank" rel="noreferrer" aria-label="Telegram">${iconTelegram}</a>
    </nav>
  </div>
`;

const dropzone = document.getElementById("dropzone") as HTMLDivElement;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const zoomSlider = document.getElementById("zoom") as HTMLInputElement;
const zoomRead = document.getElementById("zoom-read") as HTMLElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const nameResult = document.getElementById("name-result") as HTMLElement;
const copySuffixedBtn = document.getElementById("copy-suffixed") as HTMLButtonElement;
const dlRing = document.getElementById("dl-ring") as HTMLButtonElement;
const dlPlain = document.getElementById("dl-plain") as HTMLButtonElement;

const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) throw new Error("Canvas 2d context unavailable");
const ctx: CanvasRenderingContext2D = maybeCtx;

let image: HTMLImageElement | null = null;
let zoom = 1;
let panX = 0;
let panY = 0;
let copyReset: ReturnType<typeof setTimeout> | undefined;

function clampPan(): void {
  if (!image) return;
  const base = CANVAS_SIZE / Math.min(image.width, image.height);
  const scale = base * zoom;
  const maxX = Math.max(0, (image.width * scale - CANVAS_SIZE) / 2);
  const maxY = Math.max(0, (image.height * scale - CANVAS_SIZE) / 2);
  panX = Math.min(maxX, Math.max(-maxX, panX));
  panY = Math.min(maxY, Math.max(-maxY, panY));
}

function paint(target: CanvasRenderingContext2D, ring: boolean): void {
  target.fillStyle = tokens.ink;
  target.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (image) {
    const base = CANVAS_SIZE / Math.min(image.width, image.height);
    const scale = base * zoom;
    const w = image.width * scale;
    const h = image.height * scale;
    target.drawImage(image, (CANVAS_SIZE - w) / 2 + panX, (CANVAS_SIZE - h) / 2 + panY, w, h);
  }
  if (ring) drawPixelRing(target);
}

function render(): void {
  paint(ctx, false);
}

function setHasImage(next: boolean): void {
  dropzone.classList.toggle("hidden", next);
  preview.classList.toggle("hidden", !next);
  dlRing.disabled = !next;
  dlPlain.disabled = !next;
}

function loadFile(file: File): void {
  if (!file.type.startsWith("image/")) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    image = img;
    zoom = 1;
    panX = 0;
    panY = 0;
    zoomSlider.value = "1";
    zoomRead.textContent = "1.00";
    setHasImage(true);
    render();
  };
  img.src = url;
}

function download(ring: boolean): void {
  if (!image) return;
  const off = document.createElement("canvas");
  off.width = CANVAS_SIZE;
  off.height = CANVAS_SIZE;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;
  paint(offCtx, ring);
  const suffix = ring ? "ring" : "plain";
  downloadCanvasPng(off, `avatar-${suffix}-${CANVAS_SIZE}.png`);
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) loadFile(file);
});

for (const evt of ["dragover", "dragenter"] as const) {
  document.body.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragging");
  });
}
document.body.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
document.body.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragging");
  const file = e.dataTransfer?.files?.[0];
  if (file) loadFile(file);
});

zoomSlider.addEventListener("input", () => {
  zoom = Number(zoomSlider.value);
  zoomRead.textContent = zoom.toFixed(2);
  clampPan();
  render();
});

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", (e) => {
  if (!image) return;
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging || !image) return;
  const rect = canvas.getBoundingClientRect();
  const factor = CANVAS_SIZE / rect.width;
  panX += (e.clientX - lastX) * factor;
  panY += (e.clientY - lastY) * factor;
  lastX = e.clientX;
  lastY = e.clientY;
  clampPan();
  render();
});

canvas.addEventListener("pointerup", () => (dragging = false));
canvas.addEventListener("pointercancel", () => (dragging = false));

function baseDisplayName(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.endsWith(FAMILY_SUFFIX)) return trimmed.slice(0, -FAMILY_SUFFIX.length).trim();
  return trimmed;
}

function suffixedDisplayName(): string {
  const name = baseDisplayName(nameInput.value);
  return name ? `${name} ${FAMILY_SUFFIX}` : FAMILY_SUFFIX;
}

function renderNameResult(): void {
  nameResult.innerHTML = twemojiHtml(suffixedDisplayName());
}

nameInput.addEventListener("input", renderNameResult);

copySuffixedBtn.addEventListener("click", () => {
  void copyText(suffixedDisplayName()).then((ok) => {
    copySuffixedBtn.textContent = ok ? "Copied" : "Copy failed";
    if (copyReset !== undefined) clearTimeout(copyReset);
    copyReset = setTimeout(() => {
      copySuffixedBtn.textContent = "Copy";
    }, 1400);
  });
});

dlRing.addEventListener("click", () => download(true));
dlPlain.addEventListener("click", () => download(false));

const ringGuide = document.getElementById("ring-guide") as HTMLCanvasElement;
const ringGuideCtx = ringGuide.getContext("2d");
if (ringGuideCtx) {
  ringGuideCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawPixelRing(ringGuideCtx);
}

renderNameResult();
const taglineSuffix = document.getElementById("tagline-suffix");
if (taglineSuffix) taglineSuffix.innerHTML = twemojiHtml(FAMILY_SUFFIX);
render();
