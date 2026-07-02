"""Remove the white studio background from product hero PNGs.

Flood-fills transparency inward from the image borders so whites *inside*
the product (frosted glass, labels) are preserved. Writes in place to
website/public/products/*.png.
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

TOLERANCE = 18  # max channel distance from white to count as background


def remove_bg(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_bg(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= 255 - TOLERANCE and g >= 255 - TOLERANCE and b >= 255 - TOLERANCE

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

    # soften the cutout edge slightly so it doesn't look clipped
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    alpha = img.getchannel("A").point(lambda a: a)
    new_alpha = Image.composite(Image.new("L", (w, h), 0), alpha, mask.point(lambda v: 255 if v > 128 else 0))
    img.putalpha(new_alpha)
    img.save(path)
    print(f"{path.name}: background removed")


if __name__ == "__main__":
    targets = sys.argv[1:] or sorted(
        str(p) for p in (Path(__file__).parent.parent / "website" / "public" / "products").glob("LN-LIP-*.png")
    )
    for t in targets:
        remove_bg(Path(t))
