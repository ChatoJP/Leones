"""Optimize the brand pack: WebP copy next to each PNG original + README index.

PNG originals stay (print/social full quality); .webp for web use.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent.parent
PACK = ROOT / "assets" / "brand-pack"

lines = ["# LeoNes Brand Asset Pack", "",
         "PNG = full-quality original (social/print). WEBP = web-optimized copy.", ""]
total_png = total_webp = count = 0

for cat_dir in sorted(p for p in PACK.iterdir() if p.is_dir()):
    pngs = sorted(cat_dir.glob("*.png"))
    if not pngs:
        continue
    lines.append(f"## {cat_dir.name} ({len(pngs)})")
    for png in pngs:
        img = Image.open(png)
        webp = png.with_suffix(".webp")
        img.save(webp, "WEBP", quality=82, method=6)
        total_png += png.stat().st_size
        total_webp += webp.stat().st_size
        count += 1
        lines.append(f"- `{cat_dir.name}/{png.name}` ({img.size[0]}×{img.size[1]}) → .webp {webp.stat().st_size // 1024} KB")
    lines.append("")

lines.append(f"**{count} assets · PNG {total_png // 1024 // 1024} MB · WebP {total_webp // 1024} KB**")
(PACK / "README.md").write_text("\n".join(lines), encoding="utf-8")
print(f"{count} assets optimized: PNG {total_png // 1024 // 1024} MB -> WebP {total_webp // 1024} KB")
print("index: assets/brand-pack/README.md")
