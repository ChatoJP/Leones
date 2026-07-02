import { useEffect, useRef, useState } from "react";

/**
 * Subtle looping video behind a section's content. Site-wide motion layer:
 * - plays only while the section is on screen (IntersectionObserver)
 * - static poster for prefers-reduced-motion
 * - veil gradient keeps text readable at any clip brightness
 * - quietly disappears if the clip 404s
 *
 * Parent section needs `relative`; content needs `relative` (or z-10).
 */
export default function MotionBackground({
  clip,
  opacity = 0.5,
  veil = true,
}: {
  clip: string;
  opacity?: number;
  veil?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, broken]);

  if (broken) return null;
  const poster = `/posters/ambient/${clip}.jpg`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {reduced ? (
        <img src={poster} alt="" className="h-full w-full object-cover" style={{ opacity }} onError={() => setBroken(true)} />
      ) : (
        <video
          ref={ref}
          src={`/videos/ambient/${clip}.mp4`}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
          style={{ opacity }}
        />
      )}
      {veil && <div className="absolute inset-0 bg-gradient-to-b from-cloud/70 via-cloud/30 to-cloud/70" />}
    </div>
  );
}
