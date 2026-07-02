import { useEffect, useRef, useState } from "react";

// Ambient looping backgrounds behind the hero headline. Each clip is an
// 8s seamless loop; we let the active clip play through once (~8s), then
// crossfade to the next. Static poster for prefers-reduced-motion.
const DESKTOP_CLIPS = [
  "bg-hero-clouds-v1",
  "bg-hero-sparkle-v1",
  "bg-hero-silk",
  "bg-hero-clouds-v2",
  "bg-hero-sparkle-v2",
];
const MOBILE_CLIPS = [
  "bg-hero-mobile-clouds-v1",
  "bg-hero-mobile-sparkle",
  "bg-hero-mobile-clouds-v2",
];

const ROTATE_MS = 8000;
const FADE_S = 1.2;

export default function AmbientHero() {
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [idx, setIdx] = useState(0);
  const [dead, setDead] = useState<Set<string>>(new Set());
  const timer = useRef<number>(undefined);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 640px)");
    const syncMotion = () => setReduced(motion.matches);
    const syncWidth = () => setMobile(width.matches);
    syncMotion();
    syncWidth();
    motion.addEventListener("change", syncMotion);
    width.addEventListener("change", syncWidth);
    return () => {
      motion.removeEventListener("change", syncMotion);
      width.removeEventListener("change", syncWidth);
    };
  }, []);

  const clips = (mobile ? MOBILE_CLIPS : DESKTOP_CLIPS).filter((c) => !dead.has(c));

  useEffect(() => {
    if (reduced || clips.length < 2) return;
    timer.current = window.setInterval(() => setIdx((i) => i + 1), ROTATE_MS);
    return () => window.clearInterval(timer.current);
  }, [reduced, clips.length]);

  if (clips.length === 0) return null;
  const active = idx % clips.length;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {reduced ? (
        <img
          src={`/posters/ambient/${clips[0]}.jpg`}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        clips.map((clip, i) => (
          <AmbientClip key={clip} name={clip} visible={i === active} onBroken={() =>
            setDead((prev) => new Set(prev).add(clip))
          } />
        ))
      )}
      {/* soft veil keeps the giant headline readable over any clip */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-white/55" />
    </div>
  );
}

function AmbientClip({ name, visible, onBroken }: {
  name: string;
  visible: boolean;
  onBroken: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      // let the crossfade finish before pausing the outgoing clip
      const t = window.setTimeout(() => el.pause(), FADE_S * 1000);
      return () => window.clearTimeout(t);
    }
  }, [visible]);
  return (
    <video
      ref={ref}
      src={`/videos/ambient/${name}.mp4`}
      poster={`/posters/ambient/${name}.jpg`}
      muted
      loop
      playsInline
      preload="auto"
      onError={onBroken}
      className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_S}s` }}
    />
  );
}
