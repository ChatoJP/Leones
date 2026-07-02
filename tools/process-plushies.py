"""Cut white backgrounds off plushie/sticker renders and publish as WebP
(alpha preserved) into website/public/mascots and /stickers."""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).parent.parent
SRC = ROOT / "assets" / "plushies"
MASCOTS = ROOT / "website" / "public" / "mascots"
STICKERS = ROOT / "website" / "public" / "stickers"
MASCOTS.mkdir(parents=True, exist_ok=True)
STICKERS.mkdir(parents=True, exist_ok=True)

TOL = 18


def cutout(src: Path) -> Image.Image:
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_bg(x, y):
        r, g, b, _ = px[x, y]
        return r >= 255 - TOL and g >= 255 - TOL and b >= 255 - TOL

    mask = Image.new("L", (w, h), 0)
    mpx = mask.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        mpx[x, y] = 255
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(nx, ny):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    alpha = img.getchannel("A")
    img.putalpha(Image.composite(Image.new("L", (w, h), 0), alpha, mask.point(lambda v: 255 if v > 128 else 0)))
    bbox = img.getbbox()
    if bbox:
        pad = 10
        img = img.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    return img


CUTOUTS = {
    "cloudie": MASCOTS / "cloudie.webp",
    "jelly": MASCOTS / "jelly.webp",
    "boop-sad": MASCOTS / "boop-sad.webp",
    "boop-happy": MASCOTS / "boop-happy.webp",
    "sticker-heart": STICKERS / "heart.webp",
    "sticker-cloud": STICKERS / "cloud.webp",
    "sticker-sparkle": STICKERS / "sparkle.webp",
}

for name, dest in CUTOUTS.items():
    src = SRC / f"{name}.png"
    if not src.exists():
        print(f"SKIP {name} (missing)")
        continue
    img = cutout(src)
    img.save(dest, "WEBP", quality=85, method=6)
    print(f"{dest.name}: {img.size[0]}x{img.size[1]}")

# group scene: no cutout, just webp
group = SRC / "group.png"
if group.exists():
    Image.open(group).save(MASCOTS / "group.webp", "WEBP", quality=82, method=6)
    print("group.webp done")

# boop = existing transparent mascot sprite
import shutil
run = ROOT / "website" / "public" / "brand" / "mascot-run.webp"
if run.exists():
    shutil.copy(run, MASCOTS / "boop.webp")
    print("boop.webp (from mascot-run)")
