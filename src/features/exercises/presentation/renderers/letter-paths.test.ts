import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  cumulativeLengths,
  glyphForTrace,
  placeStrokeLabels,
  pointAlong,
  sampleStroke,
  SAMPLES_PER_SEGMENT,
  smoothPath,
  strokeJoints,
  WRITING_LINES,
  type Point,
} from './letter-paths';

/** Every letter and number the shipped curriculum asks a child to trace. */
const manifest = readFileSync(
  join(__dirname, '../../../../content/manifests/curriculum-v1.json'),
  'utf8',
);
const traced = [
  ...new Set(
    [...manifest.matchAll(/"type":\s*"trace_letter",\s*"letter":\s*"([^"]+)"/g)].map(
      (match) => match[1] ?? '',
    ),
  ),
];

/** The slate as the renderer lays it out on a landscape iPad (scale 1.3). */
function layOut(text: string, board = { width: 760, height: 482 }) {
  const glyph = glyphForTrace(text);
  if (!glyph) {
    throw new Error(`no skeleton for ${text}`);
  }
  const inset = 28;
  const side = Math.min(board.height - inset * 2, (board.width - inset * 2) / glyph.aspect);
  const left = (board.width - side * glyph.aspect) / 2;
  const top = (board.height - side) / 2;
  const strokes = glyph.strokes.map((stroke) =>
    stroke.map(([x, y]) => [left + x * side, top + y * side] as const),
  );
  return { glyph, strokes, side, left, top, board };
}

describe('trace skeletons', () => {
  it('finds the shipped trace steps', () => {
    expect(traced.length).toBeGreaterThan(20);
    expect(traced).toEqual(expect.arrayContaining(['i', 'é', '9', '10', '90']));
  });

  it.each(traced)(
    'has a skeleton for « %s » — no step falls back to « contenu indisponible »',
    (text) => {
      expect(glyphForTrace(text)).not.toBeNull();
    },
  );

  it('keeps a single letter in its square box', () => {
    expect(glyphForTrace('i')?.aspect).toBe(1);
  });

  it('composes a two-digit number from its digits, side by side, undistorted', () => {
    const ten = glyphForTrace('10');
    const one = glyphForTrace('1');
    const zero = glyphForTrace('0');
    expect(ten && one && zero).toBeTruthy();
    if (!ten || !one || !zero) {
      return;
    }
    expect(ten.strokes).toHaveLength(one.strokes.length + zero.strokes.length);
    expect(ten.aspect).toBeGreaterThan(1);
    // Every point stays inside the box, and the heights are those of the digits.
    for (const [x, y] of ten.strokes.flat()) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(ten.aspect);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
    }
    expect(ten.strokes[0]?.map(([, y]) => y)).toEqual(one.strokes[0]?.map(([, y]) => y));
    // The 1 comes before the 0, with air between them.
    const oneRight = Math.max(...(ten.strokes[0] ?? []).map(([x]) => x));
    const zeroLeft = Math.min(...(ten.strokes[1] ?? []).map(([x]) => x));
    expect(zeroLeft - oneRight).toBeGreaterThan(0.15);
  });

  it('refuses a number with an untraceable character', () => {
    expect(glyphForTrace('1?')).toBeNull();
  });

  const SHORT = [...'acdeéèêgijmnopqrsuvwxyz'].filter((letter) => letter !== 'd');
  it.each(SHORT)('sits the body of « %s » between the x-height and the baseline', (letter) => {
    const strokes = glyphForTrace(letter)?.strokes ?? [];
    // Accents and dots stay above the body. What counts is the drawn curve.
    const body = strokes.filter((stroke) => stroke.some(([, y]) => y >= 0.2)).flatMap(sampleStroke);
    const ys = body.map(([, y]) => y);
    expect(Math.abs(Math.min(...ys) - WRITING_LINES.xHeight)).toBeLessThan(0.008);
    // Nothing of the body stops short of the baseline; only descenders go below it.
    expect(Math.max(...ys)).toBeGreaterThanOrEqual(WRITING_LINES.baseline - 0.008);
  });

  it.each([...'0123456789'])(
    'stands the digit %s on the baseline, as tall as a capital',
    (digit) => {
      const ys = (glyphForTrace(digit)?.strokes ?? []).flatMap(sampleStroke).map(([, y]) => y);
      expect(Math.abs(Math.max(...ys) - WRITING_LINES.baseline)).toBeLessThan(0.008);
      expect(Math.abs(Math.min(...ys) - 0.12)).toBeLessThan(0.008);
    },
  );

  it.each(['o', '0', '8'])('closes « %s » without a seam', (text) => {
    for (const stroke of glyphForTrace(text)?.strokes ?? []) {
      const samples = sampleStroke(stroke);
      const [a, b] = [samples[0], samples[1]];
      const [y, z] = [samples[samples.length - 2], samples[samples.length - 1]];
      expect(z).toEqual(a);
      if (!a || !b || !y || !z) {
        throw new Error('empty stroke');
      }
      // Same direction leaving the start as arriving at the end: no cusp.
      const out = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const back = Math.atan2(z[1] - y[1], z[0] - y[0]);
      expect(Math.abs(Math.atan2(Math.sin(out - back), Math.cos(out - back)))).toBeLessThan(0.15);
    }
  });

  it('starts the i on the x-height and ends it on the baseline', () => {
    const i = glyphForTrace('i');
    const stem = i?.strokes[0] ?? [];
    expect(stem[0]?.[1]).toBeCloseTo(WRITING_LINES.xHeight, 2);
    expect(stem.at(-1)?.[1]).toBeCloseTo(WRITING_LINES.baseline, 2);
  });
});

describe('slate geometry', () => {
  const zigzag: Point[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ];

  it('samples the smooth curve through every checkpoint', () => {
    const samples = sampleStroke(zigzag);
    expect(samples).toHaveLength((zigzag.length - 1) * SAMPLES_PER_SEGMENT + 1);
    zigzag.forEach((checkpoint, index) => {
      expect(samples[index * SAMPLES_PER_SEGMENT]).toEqual(checkpoint);
    });
  });

  it('draws only the first segments of a stroke when asked', () => {
    expect(smoothPath(zigzag, 0)).toBe('M0 0');
    expect(smoothPath(zigzag, 1).match(/C/g)).toHaveLength(1);
    expect(smoothPath(zigzag).match(/C/g)).toHaveLength(3);
    // The written part follows the very curve of the model.
    expect(smoothPath(zigzag).startsWith(smoothPath(zigzag, 2))).toBe(true);
  });

  it('rounds the joint where a stroke ends on another one, and only there', () => {
    const seven = layOut('7');
    const sevenJoints = strokeJoints(seven.strokes.map(sampleStroke), 18);
    expect(sevenJoints.length).toBeGreaterThan(0);
    const i = layOut('i');
    expect(strokeJoints(i.strokes.map(sampleStroke), 18)).toEqual([]);
    // The u goes up, then down again: no disk poking above the x-height.
    const u = layOut('u');
    const top = u.top + WRITING_LINES.xHeight * u.side;
    expect(strokeJoints(u.strokes.map(sampleStroke), 18).filter(([, y]) => y <= top + 1)).toEqual(
      [],
    );
  });

  it('walks along a path', () => {
    const line: Point[] = [
      [0, 0],
      [0, 50],
      [0, 100],
    ];
    expect(cumulativeLengths(line)).toEqual([0, 50, 100]);
    const at = pointAlong(line, 75);
    expect(at?.point).toEqual([0, 75]);
    expect(at?.direction).toEqual([0, 1]);
    expect(pointAlong(line, 150)).toBeNull();
  });

  it.each(traced.filter((text) => (glyphForTrace(text)?.strokes.length ?? 0) > 1))(
    'numbers each stroke of « %s » off every band, inside the slate, clear of the model chip',
    (text) => {
      const { strokes, board } = layOut(text);
      const bandHalf = 18;
      const labelRadius = 16;
      const chip = { x: 0, y: 0, width: 93, height: 93 };
      const sampled = strokes.map(sampleStroke);
      const labels = placeStrokeLabels({
        strokes: sampled,
        bandHalf,
        startRadius: 22,
        labelRadius,
        bounds: board,
        keepOut: [chip],
      });
      expect(labels).toHaveLength(strokes.length);
      const all = sampled.flat();
      labels.forEach(([x, y], index) => {
        const clearance = Math.min(...all.map(([px, py]) => Math.hypot(x - px, y - py))) - bandHalf;
        expect(clearance).toBeGreaterThanOrEqual(labelRadius);
        expect(x - labelRadius).toBeGreaterThanOrEqual(0);
        expect(y - labelRadius).toBeGreaterThanOrEqual(0);
        expect(x + labelRadius).toBeLessThanOrEqual(board.width);
        expect(y + labelRadius).toBeLessThanOrEqual(board.height);
        expect(x - labelRadius >= chip.width || y - labelRadius >= chip.height).toBe(true);
        // Close to its own start (a little farther only at the crossing of the 8).
        const start = strokes[index]?.[0];
        expect(start).toBeDefined();
        if (start) {
          expect(Math.hypot(x - start[0], y - start[1])).toBeLessThan(text.includes('8') ? 80 : 50);
        }
        // Never on another number.
        labels.forEach(([ox, oy], other) => {
          if (other !== index) {
            expect(Math.hypot(x - ox, y - oy)).toBeGreaterThanOrEqual(labelRadius * 2);
          }
        });
      });
    },
  );
});
