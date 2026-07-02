"""Build the transparent brand PNG set from the generated dark wordmark.

The dark logo (plum on white) is soft-keyed against white to get a clean alpha
mask — including inside letter counters — then recolored flat for each variant.
The light version reuses the exact same mask so both logos are geometrically
identical. Outputs to website/public/brand/.
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).parent.parent
SRC = ROOT / "assets" / "brand"
OUT = ROOT / "website" / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)

PLUM = (58, 46, 61)
CLOUD = (255, 255, 255)
PAD = 24

src = Image.open(SRC / "logo-dark.png").convert("RGB")
w, h = src.size

# soft key: darker than white -> more opaque
gray = src.convert("L")
# noise floor: paper-texture pixels (a=under ~35) drop to fully transparent
alpha = gray.point(lambda v: 0 if (255 - v) * 2.2 < 35 else min(255, int((255 - v) * 2.2)))
# clean stray speckle noise from generation
alpha = alpha.filter(ImageFilter.MedianFilter(3))

bbox = alpha.point(lambda v: 255 if v > 96 else 0).filter(ImageFilter.MedianFilter(5)).getbbox()
left, top, right, bottom = bbox
box = (max(0, left - PAD), max(0, top - PAD), min(w, right + PAD), min(h, bottom + PAD))
alpha = alpha.crop(box)
cw, ch = alpha.size


def variant(color: tuple, dest: Path) -> None:
    img = Image.new("RGBA", (cw, ch), color + (0,))
    img.putalpha(alpha)
    img.save(dest)
    print(f"{dest.relative_to(ROOT)}  {cw}x{ch}")


variant(PLUM, OUT / "leones-logo.png")
variant(CLOUD, OUT / "leones-logo-light.png")

# app icon: flood-fill the near-black corner filler, crop, resize
icon = Image.open(SRC / "icon.png").convert("RGBA")
iw, ih = icon.size
px = icon.load()
corners = [px[0, 0], px[iw - 1, 0], px[0, ih - 1], px[iw - 1, ih - 1]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))


def is_bg(x, y):
    r, g, b, _ = px[x, y]
    return abs(r - bg[0]) <= 40 and abs(g - bg[1]) <= 40 and abs(b - bg[2]) <= 40


mask = Image.new("L", (iw, ih), 0)
mpx = mask.load()
seen = bytearray(iw * ih)
q = deque()
for x in range(iw):
    for y in (0, ih - 1):
        if is_bg(x, y) and not seen[y * iw + x]:
            seen[y * iw + x] = 1
            q.append((x, y))
for y in range(ih):
    for x in (0, iw - 1):
        if is_bg(x, y) and not seen[y * iw + x]:
            seen[y * iw + x] = 1
            q.append((x, y))
while q:
    x, y = q.popleft()
    mpx[x, y] = 255
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < iw and 0 <= ny < ih and not seen[ny * iw + nx] and is_bg(nx, ny):
            seen[ny * iw + nx] = 1
            q.append((nx, ny))
a = icon.getchannel("A")
icon.putalpha(Image.composite(Image.new("L", (iw, ih), 0), a, mask.point(lambda v: 255 if v > 128 else 0)))
icon = icon.crop(icon.getbbox())
icon.resize((512, 512), Image.LANCZOS).save(OUT / "leones-icon.png")
icon.resize((64, 64), Image.LANCZOS).save(ROOT / "website" / "public" / "favicon.png")
print("leones-icon.png 512 + favicon.png 64")
