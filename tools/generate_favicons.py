"""Build the Jay & Co favicon set from the supplied official logo asset."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/brand/jay-co-logo.jpeg"
ICON_DIR = ROOT / "assets/img"


def mark_from_logo() -> Image.Image:
    """Crop the existing J&C emblem; do not redraw, recolor, or stretch it."""
    logo = Image.open(SOURCE).convert("RGB")
    # The top emblem in the supplied square logo. The crop retains the full
    # monogram and diamond with a small clear margin, excluding the wordmark.
    mark = logo.crop((590, 320, 1545, 1090))
    mark.thumbnail((496, 496), Image.Resampling.LANCZOS)
    square = Image.new("RGB", (512, 512), "white")
    square.paste(mark, ((512 - mark.width) // 2, (512 - mark.height) // 2))
    return square


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    mark = mark_from_logo()
    for size, path in [
        (16, ROOT / "favicon-16x16.png"),
        (32, ROOT / "favicon-32x32.png"),
        (48, ROOT / "favicon-48x48.png"),
        (180, ICON_DIR / "apple-touch-icon.png"),
        (192, ICON_DIR / "android-chrome-192x192.png"),
        (512, ICON_DIR / "android-chrome-512x512.png"),
    ]:
        resized = mark.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(path, format="PNG", optimize=True)

    # Keep the full mark inside the conventional 80% maskable safe area.
    maskable = Image.new("RGB", (512, 512), "white")
    mark_crop = Image.open(SOURCE).convert("RGB").crop((590, 320, 1545, 1090))
    mark_crop.thumbnail((410, 410), Image.Resampling.LANCZOS)
    maskable.paste(mark_crop, ((512 - mark_crop.width) // 2, (512 - mark_crop.height) // 2))
    maskable.save(ICON_DIR / "maskable-512x512.png", format="PNG", optimize=True)

    # Windows and legacy browsers use a multi-resolution ICO.
    ico_sizes = [16, 32, 48]
    mark.save(ROOT / "favicon.ico", format="ICO", sizes=[(s, s) for s in ico_sizes])

    png = io.BytesIO()
    mark.save(png, format="PNG", optimize=True)
    encoded = base64.b64encode(png.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
        f'<image width="512" height="512" href="data:image/png;base64,{encoded}" />'
        '</svg>\n'
    )
    (ROOT / "favicon.svg").write_text(svg)


if __name__ == "__main__":
    main()
