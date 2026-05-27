#!/usr/bin/env python3
"""
Regenerate every 531 app-icon asset from one source layout.

Layout: paper-coloured full-bleed square with "531" in IBM Plex Sans Bold
(ink0) and a trailing circular dot in amber. No rounded corners — iOS and
Android apply their own masks, and the App Store rejects PNGs that carry
transparency in the icon slot.

Outputs (under apps/mobile/assets/images/):
  icon.png                          1024  full-bleed, no alpha  -> ios.icon + base
  splash-icon.png                   1024  full-bleed, no alpha  -> splash screen
  android-icon-foreground.png       1024  content fits the 66%  -> adaptive fg
                                          safe zone; bg is the
                                          adaptiveIcon.backgroundColor
  android-icon-background.png       1024  flat paper            -> adaptive bg
  android-icon-monochrome.png       1024  alpha-defined shape   -> themed icon
                                          (Android 13+)
  playstore-icon.png                 512  full-bleed, no alpha  -> Play Console
                                                                   listing
  favicon.png                         48  full-bleed            -> web favicon

Source-of-truth colours (apps/mobile/src/design/tokens.ts):
  paper #E7E3D6, ink0 #1A1812, amber #8E5345.

Usage:
  python3 scripts/regenerate-icon.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = REPO_ROOT / "apps/mobile/assets/fonts/IBMPlexSans-Bold.ttf"
OUT_DIR = REPO_ROOT / "apps/mobile/assets/images"

PAPER = (231, 227, 214, 255)  # #E7E3D6
INK = (26, 24, 18, 255)        # #1A1812
AMBER = (142, 83, 69, 255)     # #8E5345

# Canonical 1024 layout. Cap height of "531" lands at ~218 px (about 21%
# of canvas), matching the proportions of the previous 512 icon doubled.
# Other sizes downscale this with Lanczos.
CANVAS = 1024
FONT_SIZE = 320               # tuned against IBM Plex Sans Bold metrics
DOT_DIAMETER = 76
DOT_GAP = 36
BLOCK_Y_OFFSET = -12          # text sits slightly above geometric centre

# Android adaptive-icon safe zone: a centred circle of diameter 66% of the
# canvas (816 px on 1024). When rendering the foreground variant we shrink
# the layout so the content fits inside that circle.
ANDROID_SAFE_RATIO = 0.66


def load_font(size: int) -> ImageFont.FreeTypeFont:
    if not FONT_PATH.exists():
        sys.exit(f"font not found: {FONT_PATH}")
    return ImageFont.truetype(str(FONT_PATH), size)


def render_text(text: str, size: int, color) -> Image.Image:
    canvas = Image.new("RGBA", (size * 4, size * 4), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).text(
        (size * 2, size * 2), text, font=load_font(size), fill=color
    )
    bbox = canvas.getbbox()
    if bbox is None:
        sys.exit(f"empty render for {text!r}")
    return canvas.crop(bbox)


def compose_block(scale: float, color_text, color_dot) -> Image.Image:
    """Render the "531." block on a transparent canvas at the given scale."""
    font_size = max(1, int(FONT_SIZE * scale))
    dot_d = max(1, int(DOT_DIAMETER * scale))
    gap = max(1, int(DOT_GAP * scale))

    text_img = render_text("531", font_size, color_text)
    block_w = text_img.width + gap + dot_d
    block_h = max(text_img.height, dot_d)
    out = Image.new("RGBA", (block_w, block_h), (0, 0, 0, 0))
    out.alpha_composite(text_img, (0, block_h - text_img.height))

    dot_x = text_img.width + gap
    dot_y = block_h - dot_d
    ImageDraw.Draw(out).ellipse(
        (dot_x, dot_y, dot_x + dot_d, dot_y + dot_d), fill=color_dot
    )
    return out


def place_centered(canvas: Image.Image, block: Image.Image, y_offset: int = 0):
    w, h = canvas.size
    x = (w - block.width) // 2
    y = (h - block.height) // 2 + y_offset
    canvas.alpha_composite(block, (x, y))


def make_full_bleed(amber_dot: bool = True) -> Image.Image:
    """Paper bg, 531 in ink, dot in amber (or ink if amber_dot=False)."""
    img = Image.new("RGBA", (CANVAS, CANVAS), PAPER)
    dot_color = AMBER if amber_dot else INK
    block = compose_block(1.0, INK, dot_color)
    place_centered(img, block, BLOCK_Y_OFFSET)
    return img


def make_android_foreground() -> Image.Image:
    """Transparent bg; content shrunk to fit Android's circular safe zone.

    The adaptiveIcon backgroundColor (#E7E3D6 in app.json) renders behind
    this layer at runtime, so we keep the foreground transparent rather
    than baking the paper bg in.
    """
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    # Compute scale so the rendered block fits within the safe-zone circle.
    # Approximation: scale until the block's bounding diagonal ≈ safe diameter.
    block_full = compose_block(1.0, INK, AMBER)
    diag = (block_full.width ** 2 + block_full.height ** 2) ** 0.5
    safe_diameter = CANVAS * ANDROID_SAFE_RATIO
    scale = (safe_diameter / diag) * 0.95  # 5% breathing room
    block = compose_block(scale, INK, AMBER)
    place_centered(img, block, int(BLOCK_Y_OFFSET * scale))
    return img


def make_android_monochrome() -> Image.Image:
    """Solid black silhouette on transparent — Android tints at runtime.

    Both the "531" glyphs and the dot collapse to one ink colour; the
    system supplies the theme tint based on the user's wallpaper.
    """
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    block_full = compose_block(1.0, INK, INK)
    diag = (block_full.width ** 2 + block_full.height ** 2) ** 0.5
    safe_diameter = CANVAS * ANDROID_SAFE_RATIO
    scale = (safe_diameter / diag) * 0.95
    block = compose_block(scale, INK, INK)
    place_centered(img, block, int(BLOCK_Y_OFFSET * scale))
    return img


def make_android_background() -> Image.Image:
    """Flat paper square. Mirrors adaptiveIcon.backgroundColor in app.json
    so the asset stays self-consistent if the colour field is ever dropped.
    """
    return Image.new("RGBA", (CANVAS, CANVAS), PAPER)


def save_png(img: Image.Image, path: Path, size: int, *, drop_alpha: bool = False):
    out = img if img.size == (size, size) else img.resize((size, size), Image.LANCZOS)
    if drop_alpha:
        # Composite onto paper so the PNG ships without an alpha channel
        # (App Store / Play Store hi-res icon both reject alpha).
        bg = Image.new("RGB", out.size, PAPER[:3])
        bg.paste(out, mask=out.split()[3] if out.mode == "RGBA" else None)
        bg.save(path, format="PNG", optimize=True)
    else:
        out.save(path, format="PNG", optimize=True)
    print(f"  wrote {path.relative_to(REPO_ROOT)} ({size}x{size})")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    full_bleed = make_full_bleed(amber_dot=True)
    android_fg = make_android_foreground()
    android_bg = make_android_background()
    android_mono = make_android_monochrome()

    # In-app + iOS marketing icon (no alpha; full bleed; square).
    save_png(full_bleed, OUT_DIR / "icon.png", 1024, drop_alpha=True)
    save_png(full_bleed, OUT_DIR / "splash-icon.png", 1024, drop_alpha=True)

    # Android adaptive icon trio.
    save_png(android_fg, OUT_DIR / "android-icon-foreground.png", 1024)
    save_png(android_bg, OUT_DIR / "android-icon-background.png", 1024)
    save_png(android_mono, OUT_DIR / "android-icon-monochrome.png", 1024)

    # Play Store Console listing — separate upload, not bundled in the APK.
    save_png(full_bleed, OUT_DIR / "playstore-icon.png", 512, drop_alpha=True)

    # Web favicon.
    save_png(full_bleed, OUT_DIR / "favicon.png", 48)

    print("\n✓ regenerated icon set (dot in amber, full-square, no rounded corners)")
    print("  Restart Metro to pick up the new images:")
    print("    pnpm --filter @fivethreeone/mobile start --clear")


if __name__ == "__main__":
    main()
