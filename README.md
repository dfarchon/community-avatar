# Community avatar

A small page for anyone who wants to show up on X with DFArchon's optional signals: a removable pink pixel ring, and the family suffix `(🦑,🪐)` on a display name.

Your photo never leaves this page. Nothing is uploaded, nothing is counted. Fonts are self-hosted.

## Use

- Drop an image, then zoom and drag to fit the X circle crop.
- Preview includes the 16×16 pink pixel ring (`#FFB7C5`, one cell thick, inside the crop). Download 800×800 PNG with or without it.
- Optional name-suffix copy `name (🦑,🪐)` — never burned into the image.

The ring is a boundary, not a new face. Take it off anytime. No announcement needed.

Copy `.env.example` to `.env` and set the site and social URLs. Vite reads `VITE_*` at build time. On Netlify, set the same `VITE_*` values as site environment variables.

```sh
cp .env.example .env
pnpm install
pnpm dev        # http://localhost:5274
pnpm build
pnpm preview
```

`netlify.toml` publishes `dist/` from `pnpm build`. Asset paths are relative.

Local deploys build with `.env`, then upload that `dist/`. Link the site once, then use a draft URL before production:

```sh
pnpm netlify:link
pnpm netlify:deploy
pnpm netlify:deploy:prod
```

A Git-connected Netlify site still builds on its own and reads `VITE_*` from the site environment, not from this `.env`.
