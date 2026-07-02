"""Create optimized WebP versions of all site imagery (keeps PNG originals).

Products/swatches/scenes/brand PNGs -> .webp next to them (quality 82,
alpha preserved). Prints per-file savings.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent.parent / "website" / "public"
DIRS = ["products", "swatches", "scenes", "brand"]
SKIP = {"leones-logo.png", "leones-logo-light.png", "leones-icon.png"}  # tiny/UI-critical, keep as-is

total_before = total_after = 0
for d in DIRS:
    for png in sorted((ROOT / d).glob("*.png")):
        if png.name in SKIP:
            continue
        img = Image.open(png)
        dest = png.with_suffix(".webp")
        img.save(dest, "WEBP", quality=82, method=6)
        b, a = png.stat().st_size, dest.stat().st_size
        total_before += b
        total_after += a
        print(f"{d}/{png.name}: {b//1024} KB -> {a//1024} KB")

print(f"TOTAL: {total_before//1024//1024} MB -> {total_after//1024//1024} MB")
