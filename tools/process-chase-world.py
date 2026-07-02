"""Process Bloop Chase World assets into website/public/chase/* and library."""
from collections import deque
from pathlib import Path
import shutil

from PIL import Image, ImageFilter

ROOT = Path(__file__).parent.parent
SRC = ROOT / "assets" / "chase-world"
PUB = ROOT / "website" / "public" / "chase"
LIB = ROOT / "content-library"

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
    a = img.getchannel("A")
    img.putalpha(Image.composite(Image.new("L", (w, h), 0), a, mask.point(lambda v: 255 if v > 128 else 0)))
    bbox = img.getbbox()
    if bbox:
        pad = 8
        img = img.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    return img


def webp(src: Path, dest: Path, q=82):
    dest.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src).save(dest, "WEBP", quality=q, method=6)


count = 0
# cards, packaging, unboxing, thumbnails: straight webp
for cat in ["cards", "packaging", "unboxing", "thumbnails"]:
    for png in sorted((SRC / cat).glob("*.png")):
        webp(png, PUB / cat / f"{png.stem}.webp")
        count += 1

# poses, stickers, game sprites: cutout then webp (alpha)
for cat in ["poses", "stickers"]:
    for png in sorted((SRC / cat).glob("*.png")):
        img = cutout(png)
        dest = PUB / cat / f"{png.stem}.webp"
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "WEBP", quality=85, method=6)
        count += 1

for png in sorted((SRC / "game").glob("*.png")):
    dest = PUB / "game" / f"{png.stem}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)
    if png.stem.startswith("sprite-") or png.stem == "title-art":
        cutout(png).save(dest, "WEBP", quality=85, method=6)
    else:
        webp(png, dest)
    count += 1

# library copies
for cat in ["cards", "poses", "stickers", "packaging", "unboxing", "thumbnails"]:
    src_dir = PUB / cat
    if src_dir.exists():
        lib_dir = LIB / "chase-world" / cat
        lib_dir.mkdir(parents=True, exist_ok=True)
        for f in src_dir.glob("*.webp"):
            shutil.copy(f, lib_dir / f.name)

# chase videos into library
vid_lib = LIB / "chase-world" / "videos"
vid_lib.mkdir(parents=True, exist_ok=True)
for f in (ROOT / "website" / "public" / "videos" / "chase").glob("*.mp4"):
    shutil.copy(f, vid_lib / f.name)

print(f"processed {count} images -> website/public/chase + content-library/chase-world")
