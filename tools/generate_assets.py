#!/usr/bin/env python3
"""Generate JAY & CO brand assets from the source Logo.jpg.

Outputs:
  assets/img/logo.png / logo-256.webp          - upscaled, white matted out (original colours)
  assets/img/logo-gold.png / logo-gold*.webp   - champagne-gold variant for dark surfaces
  assets/img/logo-mark*.png / .webp            - monogram only
  assets/img/apple-touch-icon.png, android-chrome-*.png, maskable-512x512.png
  assets/img/social-card.png                   - 1200x630 Open Graph share image
  favicon.ico, favicon-16x16/32x32/48x48.png, favicon.svg, site.webmanifest
"""
import base64
import io
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = "Logo.jpg"
OUT_IMG = "assets/img"
os.makedirs(OUT_IMG, exist_ok=True)

OBSIDIAN = (252, 251, 248)   # warm white (light theme)
GRAPHITE = (240, 236, 228)   # soft ivory shade
INK_LINE = (168, 132, 43)    # deep gold hairline for light surfaces
GOLD_TOP = (229, 197, 88)     # #E5C558
GOLD_MID = (212, 175, 55)     # #D4AF37
GOLD_DEEP = (197, 160, 89)    # #C5A059

ALPHA_CUT = 0.12   # below this is JPEG halo -> fully transparent
ALPHA_LO = 0.14    # alpha curve floor before rescale


# ---------------------------------------------------------------- matte removal
def remove_white_matte(img):
    """Un-composite a light-on-white JPEG: P = a*C + (1-a)*255."""
    img = img.convert("RGB").filter(ImageFilter.MedianFilter(3))  # kill JPEG noise
    w, h = img.size
    src = img.load()

    # reference "full strength" colour = darkest observed pixel
    ref = (255, 255, 255)
    for y in range(h):
        for x in range(w):
            p = src[x, y]
            if sum(p) < sum(ref):
                ref = p
    denom = tuple(max(1, 255 - c) for c in ref)

    rgb = Image.new("RGB", (w, h))
    alpha = Image.new("L", (w, h))
    rp, ap = rgb.load(), alpha.load()

    for y in range(h):
        for x in range(w):
            p = src[x, y]
            a = min(1.0, max((255 - p[0]) / denom[0],
                             (255 - p[1]) / denom[1],
                             (255 - p[2]) / denom[2]))
            if a <= ALPHA_CUT:
                ap[x, y] = 0
                rp[x, y] = (0, 0, 0)
                continue
            inv = 1.0 - a
            if a >= 0.97:
                rp[x, y] = p
            else:
                rp[x, y] = tuple(
                    max(0, min(255, round((p[i] - 255.0 * inv) / a)))
                    for i in range(3)
                )
            ap[x, y] = round(a * 255)

    # alpha curve: cut floor, rescale to full range, median out isolated specks
    alpha = alpha.point(lambda v: 0 if v < ALPHA_LO * 255
                        else min(255, round((v - ALPHA_LO * 255) / (1 - ALPHA_LO))))
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    alpha = alpha.filter(ImageFilter.MedianFilter(3))

    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def gold_tint(rgba):
    """Recolour an RGBA image to a vertical champagne-gold gradient."""
    w, h = rgba.size
    rgb = Image.new("RGB", (w, h))
    px = rgb.load()
    for y in range(h):
        t = y / max(1, h - 1)
        if t < 0.5:
            k = t / 0.5
            col = tuple(round(GOLD_TOP[i] + (GOLD_MID[i] - GOLD_TOP[i]) * k) for i in range(3))
        else:
            k = (t - 0.5) / 0.5
            col = tuple(round(GOLD_MID[i] + (GOLD_DEEP[i] - GOLD_MID[i]) * k) for i in range(3))
        for x in range(w):
            px[x, y] = col
    out = rgba.copy()
    out.paste(rgb, (0, 0), rgba)
    return out


def polish(rgba, sharpen_pct=130):
    """Smooth the alpha edge, sharpen colour only."""
    rgb, a = rgba.convert("RGB"), rgba.split()[-1]
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2.2, percent=sharpen_pct, threshold=2))
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=60, threshold=2))
    out = rgb.convert("RGBA")
    out.putalpha(a)
    return out


# ---------------------------------------------------------------- build logo
base = remove_white_matte(Image.open(SRC))
bbox = base.split()[-1].point(lambda v: 255 if v > 16 else 0).getbbox()
base = base.crop(bbox)

# split monogram from wordmark: first band of >=3 blank rows
w0, h0 = base.size
alpha = base.split()[-1]
rows = [alpha.crop((0, y, w0, y + 1)).getextrema()[1] > 12 for y in range(h0)]
seen, gap_start, monogram_end = False, None, h0
for y, has in enumerate(rows):
    if has:
        seen, gap_start = True, None
    elif seen:
        if gap_start is None:
            gap_start = y
        elif y - gap_start >= 3:
            monogram_end = gap_start
            break
mark = base.crop((0, 0, w0, monogram_end))
mark = mark.crop(mark.split()[-1].point(lambda v: 255 if v > 16 else 0).getbbox())

BIG = 1024
logo_big = base.resize((BIG, round(BIG * base.size[1] / base.size[0])), Image.LANCZOS)
logo_big = polish(logo_big)
logo_gold = gold_tint(logo_big)

mark_h = 512
mark_big = mark.resize((round(mark_h * mark.size[0] / mark.size[1]), mark_h), Image.LANCZOS)
mark_big = polish(mark_big)
mark_gold = gold_tint(mark_big)

logo_big.save(f"{OUT_IMG}/logo.png", optimize=True)
logo_gold.save(f"{OUT_IMG}/logo-gold.png", optimize=True)
mark_big.save(f"{OUT_IMG}/logo-mark.png", optimize=True)
mark_gold.save(f"{OUT_IMG}/logo-mark-gold.png", optimize=True)


def webp(img, name, width=None, quality=86):
    if width and img.size[0] != width:
        img = img.resize((width, round(img.size[1] * width / img.size[0])), Image.LANCZOS)
    img.save(f"{OUT_IMG}/{name}.webp", "WEBP", quality=quality, method=6)
    return img


webp(logo_gold, "logo-gold-256", width=256, quality=90)
webp(logo_gold, "logo-gold", width=768, quality=88)
webp(logo_big, "logo-256", width=256, quality=90)
webp(logo_big, "logo", width=768, quality=88)
webp(mark_gold, "logo-mark-gold-192", width=192, quality=92)
webp(mark_gold, "logo-mark-gold", width=480, quality=90)
webp(mark_big, "logo-mark-192", width=192, quality=92)
webp(mark_big, "logo-mark", width=480, quality=90)

# ---------------------------------------------------------------- icon tiles
def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def make_tile(size, mark_img, radius_frac=0.20, inset=0.0, border=False, solid=False):
    """Ivory tile with the brand monogram (light theme)."""
    grad = Image.new("RGB", (1, size))
    gp = grad.load()
    for y in range(size):
        t = y / max(1, size - 1)
        gp[0, y] = tuple(round(GRAPHITE[i] + (OBSIDIAN[i] - GRAPHITE[i]) * t) for i in range(3))
    grad = grad.resize((size, size))
    bg = Image.new("RGBA", (size, size))
    bg.paste(grad, (0, 0))
    mask = (rounded_mask(size, round(size * radius_frac)) if not solid
            else Image.new("L", (size, size), 255))

    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tile.paste(bg, (0, 0), mask)

    zone = size * (1 - 2 * inset) * 0.72
    mw, mh = mark_img.size
    k = min(zone / mw, zone / mh)
    m = mark_img.resize((max(1, round(mw * k)), max(1, round(mh * k))), Image.LANCZOS)
    tile.alpha_composite(m, (round((size - m.size[0]) / 2), round((size - m.size[1]) / 2)))

    if border:
        d = ImageDraw.Draw(tile)
        pad = max(1, round(size * 0.035))
        d.rounded_rectangle([pad, pad, size - 1 - pad, size - 1 - pad],
                            radius=max(0, round(size * max(0.0, radius_frac - 0.05))),
                            outline=(168, 132, 43, 190), width=max(1, round(size / 160)))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(tile, (0, 0), mask)
    return out


fav32 = make_tile(32, mark_big, radius_frac=0.24)
fav16 = make_tile(16, mark_big, radius_frac=0.24)
fav48 = make_tile(48, mark_big, radius_frac=0.24)
fav32.save("favicon-32x32.png", optimize=True)
fav16.save("favicon-16x16.png", optimize=True)
fav48.save("favicon-48x48.png", optimize=True)
fav32.save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

make_tile(180, mark_big, solid=True).save(f"{OUT_IMG}/apple-touch-icon.png", optimize=True)
make_tile(192, mark_big, solid=True, border=True)\
    .save(f"{OUT_IMG}/android-chrome-192x192.png", optimize=True)
make_tile(512, mark_big, solid=True, border=True)\
    .save(f"{OUT_IMG}/android-chrome-512x512.png", optimize=True)
make_tile(512, mark_big, solid=True, inset=0.18)\
    .save(f"{OUT_IMG}/maskable-512x512.png", optimize=True)

# SVG favicon (self-contained: raster mark embedded as a data URI)
svg_mark = mark_gold.resize((240, round(240 * mark_gold.size[1] / mark_gold.size[0])),
                            Image.LANCZOS)
buf = io.BytesIO()
svg_mark.save(buf, format="PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
mw, mh = svg_mark.size
mx, my = round((512 - mw) / 2), round((512 - mh) / 2)
with open("favicon.svg", "w") as f:
    f.write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#C5A059"/><stop offset=".55" stop-color="#A8842B"/>'
        '<stop offset="1" stop-color="#8A6D1F"/></linearGradient>'
        f'<mask id="m"><image href="data:image/png;base64,{b64}" width="{mw}" height="{mh}" '
        f'x="{mx}" y="{my}"/></mask></defs>'
        '<rect width="512" height="512" rx="120" fill="#FBFAF8"/>'
        '<rect x="18" y="18" width="476" height="476" rx="104" fill="none" '
        'stroke="rgba(168,132,43,.55)" stroke-width="6"/>'
        '<rect width="512" height="512" fill="url(#g)" mask="url(#m)"/></svg>'
    )


# ---------------------------------------------------------------- social card
def make_social_card():
    W, H = 1200, 630
    card = Image.new("RGB", (W, H), OBSIDIAN)
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    for r in range(520, 0, -6):
        v = int(70 * (1 - r / 520) ** 2)
        gd.ellipse([W // 2 - r, H // 2 - r - 60, W // 2 + r, H // 2 + r - 60], fill=v)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    warm = Image.new("RGB", (W, H), (197, 160, 89))
    card = Image.composite(warm, card, glow.point(lambda v: v))

    d = ImageDraw.Draw(card)
    d.rectangle([28, 28, W - 29, H - 29], outline=(120, 100, 45), width=2)

    # logo, vertically centred in the upper block (original brand colours on ivory)
    LOGO_H = 330
    logo = logo_big
    k = LOGO_H / logo.size[1]
    lg = logo.resize((round(logo.size[0] * k), LOGO_H), Image.LANCZOS)
    logo_x = round((W - lg.size[0]) / 2)
    logo_y = 74
    card.paste(lg, (logo_x, logo_y), lg)
    logo_bottom = logo_y + LOGO_H

    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Didot.ttc", 30)
    except Exception:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 30)

    divider_y = logo_bottom + 34
    d.line([(W / 2 - 90, divider_y), (W / 2 + 90, divider_y)],
           fill=(168, 132, 43), width=1)

    caption = "FINE JEWELERS  •  EST. 2003"
    spacing = 12
    widths = [d.textlength(ch, font=font) for ch in caption]
    total = sum(widths) + spacing * (len(caption) - 1)
    x = (W - total) / 2
    y = divider_y + 26
    for ch, cw in zip(caption, widths):
        d.text((x, y), ch, font=font, fill=(96, 91, 84))
        x += cw + spacing

    card.save(f"{OUT_IMG}/social-card.png", optimize=True)
    card.save(f"{OUT_IMG}/og-image.jpg", quality=88, optimize=True)


make_social_card()

# ---------------------------------------------------------------- manifest
with open("site.webmanifest", "w") as f:
    f.write("""{
  "name": "Jay & Co Jewelers",
  "short_name": "Jay & Co",
  "description": "Fine jewelers & bespoke craftsmanship since 2003.",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#FCFBF8",
  "theme_color": "#FCFBF8",
  "icons": [
    { "src": "favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "assets/img/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/img/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "assets/img/maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
""")

print("base bbox:", bbox, "| monogram rows:", monogram_end, "| logo:", logo_big.size)
print("done")
