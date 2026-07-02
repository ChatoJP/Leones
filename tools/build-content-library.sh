#!/usr/bin/env bash
# Assemble the platform-organized LeoNes launch content library.
# Zero-credit derivatives: logo-branded ads (fixes AI label drift), square
# crops for IG feed, covers from posters. Idempotent.
set -e
cd "$(dirname "$0")/.."

LIB=content-library
LOGO_LIGHT=website/public/brand/leones-logo-light.png
LOGO_DARK=website/public/brand/leones-logo.png

mkdir -p $LIB/{tiktok/{ads,loops,covers},instagram/{feed,feed-square-video,carousels,stories,reels-covers},facebook/{ads,posts},website/{heroes,banners},brand/{logos,mascots,stickers,overlays,templates},products,campaigns,thumbnails}

# ---- 1. Brand-locked ads: overlay the real logo top-center on all concept ads ----
# (AI-generated label text drifts; the overlay carries the brand.)
for f in assets/campaigns/ph-gloss/*/*-ad.mp4; do
  name=$(basename "$f" .mp4)
  out="$LIB/tiktok/ads/branded-$name.mp4"
  [ -f "$out" ] && continue
  ffmpeg -y -i "$f" -i "$LOGO_LIGHT" \
    -filter_complex "[1:v]scale=340:-1[logo];[0:v][logo]overlay=(W-w)/2:64" \
    -c:a copy -c:v libx264 -crf 21 -preset fast "$out" 2>/dev/null
  echo "branded: $name"
done
# mascot ad + unboxing too
for f in assets/collection-01-lips/LN-LIP-001/mascot-ad.mp4 assets/brand/unboxing.mp4; do
  name=$(basename "$f" .mp4)
  out="$LIB/tiktok/ads/branded-$name.mp4"
  [ -f "$out" ] && continue
  ffmpeg -y -i "$f" -i "$LOGO_LIGHT" \
    -filter_complex "[1:v]scale=340:-1[logo];[0:v][logo]overlay=(W-w)/2:64" \
    -c:a copy -c:v libx264 -crf 21 -preset fast "$out" 2>/dev/null
  echo "branded: $name"
done

# ---- 2. Product loops (as-is, already 9:16) ----
for f in website/public/videos/LN-LIP-*.mp4; do
  cp -n "$f" "$LIB/tiktok/loops/" 2>/dev/null || true
done
cp -n website/public/videos/collection-film.mp4 "$LIB/tiktok/loops/" 2>/dev/null || true

# ---- 3. IG feed squares: center-crop 3 hero loops to 1:1 ----
for sku in LN-LIP-001 LN-LIP-008 LN-LIP-003; do
  out="$LIB/instagram/feed-square-video/$sku-square.mp4"
  [ -f "$out" ] && continue
  ffmpeg -y -i "website/public/videos/$sku.mp4" \
    -vf "crop=720:720:0:(ih-720)/2" -c:a copy -c:v libx264 -crf 21 -preset fast "$out" 2>/dev/null
  echo "square: $sku"
done

# ---- 4. Covers from posters ----
cp -n website/public/posters/*.jpg "$LIB/instagram/reels-covers/" 2>/dev/null || true
cp -n website/public/posters/*.jpg "$LIB/tiktok/covers/" 2>/dev/null || true

# ---- 5. Brand assets ----
cp -n website/public/brand/leones-logo.png website/public/brand/leones-logo-light.png website/public/brand/leones-icon.png "$LIB/brand/logos/" 2>/dev/null || true
cp -n website/public/mascots/*.webp "$LIB/brand/mascots/" 2>/dev/null || true
cp -n website/public/stickers/*.webp "$LIB/brand/stickers/" 2>/dev/null || true
cp -n assets/brand/mascot-chase-scene.png assets/brand/package-v2.png "$LIB/brand/mascots/" 2>/dev/null || true

# ---- 6. Website visuals ----
cp -n website/public/brand/family.webp "$LIB/website/heroes/" 2>/dev/null || true
cp -n website/public/brand/unboxing.webp "$LIB/website/heroes/" 2>/dev/null || true

# ---- 7. Product & scene imagery ----
cp -n website/public/products/LN-LIP-*.webp "$LIB/products/" 2>/dev/null || true
cp -n website/public/scenes/*.webp "$LIB/products/" 2>/dev/null || true
cp -n website/public/swatches/*.webp "$LIB/products/" 2>/dev/null || true

# ---- 8. Brand pack (48) into platform folders ----
if [ -d assets/brand-pack ]; then
  cp -n assets/brand-pack/logos/*.webp "$LIB/brand/logos/" 2>/dev/null || true
  cp -n assets/brand-pack/stickers/*.webp "$LIB/brand/stickers/" 2>/dev/null || true
  cp -n assets/brand-pack/mascots/*.webp "$LIB/brand/mascots/" 2>/dev/null || true
  cp -n assets/brand-pack/heroes/*.webp "$LIB/website/heroes/" 2>/dev/null || true
  cp -n assets/brand-pack/banners/*.webp "$LIB/website/banners/" 2>/dev/null || true
  cp -n assets/brand-pack/social/*.webp "$LIB/instagram/feed/" 2>/dev/null || true
  cp -n assets/brand-pack/packaging/*.webp "$LIB/products/" 2>/dev/null || true
  cp -n assets/brand-pack/products/*.webp "$LIB/products/" 2>/dev/null || true
  cp -n assets/brand-pack/campaigns/*.webp "$LIB/campaigns/" 2>/dev/null || true
  cp -n assets/brand-pack/icons/*.webp "$LIB/brand/stickers/" 2>/dev/null || true
fi

# ---- 9. Wave 2 into platform folders ----
if [ -d assets/content-wave2 ]; then
  cp -rn assets/content-wave2/ads "$LIB/facebook/" 2>/dev/null || true
  cp -rn assets/content-wave2/instagram/* "$LIB/instagram/carousels/" 2>/dev/null || true
  cp -n assets/content-wave2/covers/*.png "$LIB/instagram/reels-covers/" 2>/dev/null || true
  cp -n assets/content-wave2/facebook/*.png "$LIB/facebook/ads/" 2>/dev/null || true
  cp -n assets/content-wave2/templates/*.png "$LIB/brand/templates/" 2>/dev/null || true
  cp -n assets/content-wave2/products/*.png "$LIB/products/" 2>/dev/null || true
  cp -n assets/content-wave2/thumbnails/*.png "$LIB/thumbnails/" 2>/dev/null || true
  cp -n assets/content-wave2/mascots/*.png "$LIB/brand/mascots/" 2>/dev/null || true
  cp -n assets/content-wave2/overlays/*.png "$LIB/brand/overlays/" 2>/dev/null || true
  cp -n assets/content-wave2/campaigns/*.png "$LIB/campaigns/" 2>/dev/null || true
  # wave2 videos
  [ -d assets/content-wave2/loops ] && cp -n assets/content-wave2/loops/*.mp4 "$LIB/tiktok/loops/" 2>/dev/null || true
  [ -d assets/content-wave2/chase ] && cp -n assets/content-wave2/chase/*.mp4 "$LIB/tiktok/ads/" 2>/dev/null || true
  [ -d assets/content-wave2/plush ] && cp -n assets/content-wave2/plush/*.mp4 "$LIB/tiktok/ads/" 2>/dev/null || true
  [ -d assets/content-wave2/stings ] && cp -n assets/content-wave2/stings/*.mp4 "$LIB/tiktok/ads/" 2>/dev/null || true
fi

echo "---"
find $LIB -type f | wc -l | xargs echo "library files:"
du -sh $LIB
