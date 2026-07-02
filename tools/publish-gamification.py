"""Publish gamification assets from assets/ecosystem into website/public.

- achievement stickers  -> public/stickers/achievements/*.webp (256px)
- mascot expressions    -> public/mascots/expressions/*.webp (420px)
- plush avatars         -> public/mascots/avatars/*.webp (420px)
- world map art         -> public/scenes/world-map.webp (1600px)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent.parent
ECO = ROOT / "assets" / "ecosystem"
PUB = ROOT / "website" / "public"


def publish(src: Path, dest: Path, max_px: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(src)
    if max(img.size) > max_px:
        img.thumbnail((max_px, max_px), Image.LANCZOS)
    img.save(dest, "WEBP", quality=84, method=6)
    print(f"{dest.relative_to(PUB)} ({dest.stat().st_size // 1024} KB)")


STICKERS = {  # achievement id -> source sticker
    "rainbow": "stickers/sticker-rainbow.png",
    "crown": "stickers/sticker-crown.png",
    "moon": "stickers/sticker-moon.png",
    "star": "stickers/sticker-star.png",
    "paw": "stickers/sticker-paw.png",
    "jelly": "stickers/sticker-jelly-heart-v1.png",
    "lips": "stickers/sticker-lips.png",
    "gift": "stickers/sticker-gift.png",
    "cub": "stickers/sticker-cub-v1.png",
    "butterfly": "stickers/sticker-butterfly.png",
}
for name, rel in STICKERS.items():
    publish(ECO / rel, PUB / "stickers" / "achievements" / f"{name}.webp", 256)

EXPRESSIONS = ["cloudie-laugh", "cloudie-surprised", "cloudie-hearteyes",
               "boop-think", "boop-cheer", "jelly-giggle"]
for name in EXPRESSIONS:
    publish(ECO / "mascots" / "expressions" / f"{name}.png",
            PUB / "mascots" / "expressions" / f"{name}.webp", 420)

AVATARS = ["avatar-leona-v1", "avatar-leona-v2", "avatar-leona-poses-v1",
           "avatar-leona-poses-v2", "avatar-group-v1", "avatar-group-v2"]
for name in AVATARS:
    publish(ECO / "mascots" / "avatars" / f"{name}.png",
            PUB / "mascots" / "avatars" / f"{name}.webp", 420)

publish(ECO / "campaigns" / "the-leones-world" / "camp-world-wide.png",
        PUB / "scenes" / "world-map.webp", 1600)
