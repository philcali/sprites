import { describe, it, expect, vi } from 'vitest';
import { cssToInternal, getCropBounds } from '../src/Editor';

// --- Pure function tests (no DOM needed) ---

describe('cssToInternal', () => {
  it('returns internal coordinates when CSS and internal sizes match (1:1)', () => {
    const result = cssToInternal(10, 20, 100, 100, 100, 100);
    expect(result).toEqual({ x: 10, y: 20 });
  });

  it('scales up when internal is larger than CSS (zoomed in)', () => {
    // CSS shows 50px wide, but internal canvas is 100px wide (2x zoom)
    const result = cssToInternal(25, 50, 50, 100, 100, 200);
    expect(result).toEqual({ x: 50, y: 100 });
  });

  it('scales down when internal is larger than CSS display (scaled down on small screen)', () => {
    // CSS shows 600px wide, but internal canvas is 32px (very small sprite on wide screen)
    const result = cssToInternal(300, 200, 600, 400, 32, 24);
    expect(result).toEqual({ x: 16, y: 12 });
  });

  it('rounds correctly for odd pixel values', () => {
    const result = cssToInternal(1, 1, 3, 3, 10, 10);
    expect(result).toEqual({ x: 3, y: 3 });
  });

  it('handles zero CSS coordinates', () => {
    const result = cssToInternal(0, 0, 100, 100, 100, 100);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('handles negative CSS coordinates (outside canvas)', () => {
    const result = cssToInternal(-10, -10, 100, 100, 100, 100);
    expect(result).toEqual({ x: -10, y: -10 });
  });

  it('handles non-square aspect ratios', () => {
    // CSS: 200x100, Internal: 100x50 (same ratio, 0.5x)
    const result = cssToInternal(100, 50, 200, 100, 100, 50);
    expect(result).toEqual({ x: 50, y: 25 });
  });
});

describe('getCropBounds', () => {
  it('returns correct bounds when start is top-left', () => {
    const bounds = getCropBounds({ x: 10, y: 10 }, { x: 50, y: 30 });
    expect(bounds).toEqual({ x: 10, y: 10, w: 40, h: 20 });
  });

  it('handles reverse drag (start bottom-right)', () => {
    const bounds = getCropBounds({ x: 50, y: 30 }, { x: 10, y: 10 });
    expect(bounds).toEqual({ x: 10, y: 10, w: 40, h: 20 });
  });

  it('handles horizontal-only drag', () => {
    const bounds = getCropBounds({ x: 10, y: 20 }, { x: 50, y: 20 });
    expect(bounds).toEqual({ x: 10, y: 20, w: 40, h: 0 });
  });

  it('handles vertical-only drag', () => {
    const bounds = getCropBounds({ x: 10, y: 10 }, { x: 10, y: 50 });
    expect(bounds).toEqual({ x: 10, y: 10, w: 0, h: 40 });
  });

  it('handles zero-width/height (single point)', () => {
    const bounds = getCropBounds({ x: 10, y: 10 }, { x: 10, y: 10 });
    expect(bounds).toEqual({ x: 10, y: 10, w: 0, h: 0 });
  });

  it('handles negative coordinates', () => {
    const bounds = getCropBounds({ x: -10, y: -5 }, { x: 10, y: 5 });
    expect(bounds).toEqual({ x: -10, y: -5, w: 20, h: 10 });
  });
});
