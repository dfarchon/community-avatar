// 16×16 pixel ring on the crop edge — same cell language as temple / octopus
// in local/twitter-vi. One cell thick, inside the inscribed circle so X never clips it.
import { tokens } from "./tokens";

export const CANVAS_SIZE = 800;
export const RING_GRID = 16;

type PixelGrid = readonly string[];
type PixelColors = Readonly<Record<string, string>>;

/** `o` = pink-300. Corners stay empty (outside the X circle). */
const RING_16 = [
  ".....oooooo.....",
  "...ooo....ooo...",
  "..oo........oo..",
  ".oo..........oo.",
  ".o............o.",
  "oo............oo",
  "o..............o",
  "o..............o",
  "o..............o",
  "o..............o",
  "oo............oo",
  ".o............o.",
  ".oo..........oo.",
  "..oo........oo..",
  "...ooo....ooo...",
  ".....oooooo.....",
] as const satisfies PixelGrid;

function drawGridInto(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  x: number,
  y: number,
  cell: number,
  colors: PixelColors,
): void {
  for (let j = 0; j < grid.length; j++) {
    const row = grid[j];
    if (!row) continue;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (!ch || ch === ".") continue;
      const fill = colors[ch];
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(x + i * cell, y + j * cell, cell, cell);
    }
  }
}

export function drawPixelRing(ctx: CanvasRenderingContext2D): void {
  const cell = Math.floor(CANVAS_SIZE / RING_GRID);
  const origin = Math.round((CANVAS_SIZE - cell * RING_GRID) / 2);
  drawGridInto(ctx, RING_16, origin, origin, cell, { o: tokens["pink-300"] });
}
