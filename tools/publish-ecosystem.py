"""Publish ecosystem assets into website/public as optimized webp.

- assets/ecosystem/products/on-pink/pink-0XX.png -> public/gallery/on-pink/LN-LIP-0XX.webp
- assets/ecosystem/products/macro/macro-0XX.png  -> public/gallery/macro/LN-LIP-0XX.webp
"""
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent.parent
ECO = ROOT / "assets" / "ecosystem"
PUB = ROOT / "website" / "public"


def publish(src: Path, dest: Path, max_px: int = 1280) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(src)
    if max(img.size) > max_px:
        img.thumbnail((max_px, max_px), Image.LANCZOS)
    img.save(dest, "WEBP", quality=82, method=6)
    print(f"{src.relative_to(ROOT)} -> {dest.relative_to(PUB)} ({dest.stat().st_size // 1024} KB)")


for png in sorted((ECO / "products" / "on-pink").glob("pink-*.png")):
    num = re.search(r"pink-(\d+)", png.stem).group(1)
    publish(png, PUB / "gallery" / "on-pink" / f"LN-LIP-{num}.webp")

for png in sorted((ECO / "products" / "macro").glob("macro-*.png")):
    num = re.search(r"macro-(\d+)", png.stem).group(1)
    publish(png, PUB / "gallery" / "macro" / f"LN-LIP-{num}.webp")
