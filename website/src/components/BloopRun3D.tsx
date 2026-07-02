// Bloop Run 3D — endless-runner where Bloop chases the gloss INTO the screen.
// Three lanes, swipe / arrow keys, 60s runs, pastel cloud world. Keeps the
// existing progression: sparkles feed lib/chase card unlocks + Roars.
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Sparkles as DreiSparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Sticker from "./Sticker";
import { awardRoars } from "../lib/roars";
import { recordRun, type ChaseCard } from "../lib/chase";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { pop, sparkleChime, soundEnabled } from "../lib/sound";

/* ---------------- shared run state (refs, no re-renders) ---------------- */

const LANES = [-2.1, 0, 2.1];
const RUN_SECONDS = 60;
const SPAWN_Z = -46;
const KILL_Z = 8;

type Kind = "sparkle" | "heart" | "gloss" | "cloud" | "gift";
type Entity = { id: number; kind: Kind; lane: number; z: number; y: number; taken: boolean; spin: number };

type RunState = {
  playing: boolean;
  t: number;
  speed: number;
  score: number;
  lane: number; // target lane index
  x: number; // actual x
  y: number;
  vy: number;
  stumbleUntil: number;
  entities: Entity[];
  nextSpawn: number;
  id: number;
  distance: number;
};

const freshRun = (): RunState => ({
  playing: false, t: RUN_SECONDS, speed: 11, score: 0, lane: 1, x: 0, y: 0, vy: 0,
  stumbleUntil: 0, entities: [], nextSpawn: 0, id: 0, distance: 0,
});

/* ---------------- Bloop, built from plush primitives ---------------- */

function Bloop({ run }: { run: React.MutableRefObject<RunState> }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const feetL = useRef<THREE.Mesh>(null);
  const feetR = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const s = run.current;
    const g = group.current;
    if (!g) return;
    // lane lerp + banking tilt
    const targetX = LANES[s.lane];
    s.x += (targetX - s.x) * Math.min(1, dt * 10);
    g.position.x = s.x;
    g.position.y = s.y;
    g.rotation.z = (s.x - targetX) * 0.25;
    // run bounce (only on ground)
    const t = state.clock.elapsedTime;
    const bounce = s.playing && s.y < 0.02 ? Math.abs(Math.sin(t * 12)) * 0.12 : 0;
    if (body.current) {
      body.current.position.y = 0.62 + bounce;
      const squash = s.y < 0.02 ? 1 - bounce * 0.5 : 1.08;
      body.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    }
    if (feetL.current && feetR.current) {
      feetL.current.position.z = Math.sin(t * 12) * 0.22;
      feetR.current.position.z = -Math.sin(t * 12) * 0.22;
    }
    // stumble wobble
    const now = performance.now();
    g.rotation.x = now < s.stumbleUntil ? Math.sin(now / 30) * 0.15 : 0;
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh ref={body} castShadow position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#f9b8cb" roughness={0.9} />
      </mesh>
      {/* cloud cap */}
      {[[-0.22, 1.12, 0.05, 0.2], [0, 1.24, 0, 0.24], [0.22, 1.12, 0.05, 0.2], [0, 1.1, -0.2, 0.18]].map(([x, y, z, r], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
      {/* eyes */}
      <mesh position={[-0.18, 0.72, 0.48]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#3A2E3D" roughness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.48]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#3A2E3D" roughness={0.4} />
      </mesh>
      {/* blush */}
      <mesh position={[-0.32, 0.58, 0.42]} rotation={[0, -0.5, 0]}>
        <circleGeometry args={[0.09, 16]} />
        <meshBasicMaterial color="#f27ba0" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.32, 0.58, 0.42]} rotation={[0, 0.5, 0]}>
        <circleGeometry args={[0.09, 16]} />
        <meshBasicMaterial color="#f27ba0" transparent opacity={0.7} />
      </mesh>
      {/* feet */}
      <mesh ref={feetL} castShadow position={[-0.2, 0.12, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#f6a3bd" roughness={0.9} />
      </mesh>
      <mesh ref={feetR} castShadow position={[0.2, 0.12, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#f6a3bd" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---------------- the forever-fleeing gloss ---------------- */

function FleeingGloss() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!g.current) return;
    g.current.position.set(Math.sin(t * 0.7) * 1.8, 0.75 + Math.sin(t * 3) * 0.15, -26);
    g.current.rotation.y = t * 1.5;
  });
  return (
    <group ref={g}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.1, 20]} />
        <meshStandardMaterial color="#fde4ec" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 20]} />
        <meshStandardMaterial color="#C9E4F5" roughness={0.5} />
      </mesh>
      <pointLight color="#ffd9e8" intensity={2} distance={6} />
    </group>
  );
}

/* ---------------- entities (collectibles + obstacles) ---------------- */

const entityGeometry = {
  sparkle: <octahedronGeometry args={[0.28]} />,
  heart: <sphereGeometry args={[0.3, 16, 16]} />,
  gloss: <cylinderGeometry args={[0.18, 0.18, 0.72, 14]} />,
  cloud: <sphereGeometry args={[0.5, 14, 14]} />,
  gift: <boxGeometry args={[0.8, 0.8, 0.8]} />,
};
const entityColor: Record<Kind, string> = {
  sparkle: "#F0C36B", heart: "#f27ba0", gloss: "#fde4ec", cloud: "#b7c3cf", gift: "#f9b8cb",
};

function Entities({ run }: { run: React.MutableRefObject<RunState> }) {
  const [, force] = useState(0);
  const seen = useRef(0);
  useFrame(() => {
    // re-render only when the entity set actually changes
    if (run.current.id !== seen.current) {
      seen.current = run.current.id;
      force((n) => n + 1);
    }
  });
  return (
    <>
      {run.current.entities.map((e) => (
        <EntityMesh key={e.id} entity={e} run={run} />
      ))}
    </>
  );
}

function EntityMesh({ entity, run }: { entity: Entity; run: React.MutableRefObject<RunState> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    g.visible = !entity.taken && entity.z < KILL_Z;
    g.position.set(LANES[entity.lane], entity.y, entity.z);
    if (entity.kind === "sparkle" || entity.kind === "gloss") g.rotation.y = state.clock.elapsedTime * 2 + entity.spin;
    if (entity.kind === "heart") g.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4 + entity.spin) * 0.1);
  });
  const emissive = entity.kind === "sparkle" ? "#F0C36B" : entity.kind === "heart" ? "#f27ba0" : "#000000";
  return (
    <group ref={ref}>
      <mesh castShadow={entity.kind === "gift"}>
        {entityGeometry[entity.kind]}
        <meshStandardMaterial
          color={entityColor[entity.kind]}
          roughness={entity.kind === "cloud" ? 1 : 0.35}
          emissive={emissive}
          emissiveIntensity={entity.kind === "sparkle" || entity.kind === "heart" ? 0.35 : 0}
        />
      </mesh>
      {entity.kind === "gift" && (
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.86, 0.1, 0.2]} />
          <meshStandardMaterial color="#C9E4F5" roughness={0.4} />
        </mesh>
      )}
      {entity.kind === "cloud" && (
        <>
          <mesh position={[-0.4, -0.05, 0]}>
            <sphereGeometry args={[0.34, 12, 12]} />
            <meshStandardMaterial color="#b7c3cf" roughness={1} />
          </mesh>
          <mesh position={[0.4, -0.05, 0]}>
            <sphereGeometry args={[0.34, 12, 12]} />
            <meshStandardMaterial color="#b7c3cf" roughness={1} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ---------------- scrolling cloud track + scenery ---------------- */

function Track({ run }: { run: React.MutableRefObject<RunState> }) {
  const tiles = useRef<THREE.Group>(null);
  const TILE = 6;
  const COUNT = 12;
  useFrame((_, dt) => {
    const s = run.current;
    const g = tiles.current;
    if (!g) return;
    const move = s.playing ? s.speed * dt : 2 * dt;
    for (const child of g.children) {
      child.position.z += move;
      if (child.position.z > TILE) child.position.z -= COUNT * TILE;
    }
  });
  return (
    <group ref={tiles}>
      {Array.from({ length: COUNT }, (_, i) => (
        <group key={i} position={[0, 0, -i * TILE]}>
          {/* road slab */}
          <mesh receiveShadow position={[0, -0.12, 0]}>
            <boxGeometry args={[7.4, 0.24, TILE - 0.15]} />
            <meshStandardMaterial color={i % 2 ? "#fef2f6" : "#fbe8f0"} roughness={0.95} />
          </mesh>
          {/* lane divider dots */}
          {[-1.05, 1.05].map((x) => (
            <mesh key={x} position={[x, 0.02, 0]}>
              <boxGeometry args={[0.09, 0.02, 1.6]} />
              <meshBasicMaterial color="#f5c7d8" />
            </mesh>
          ))}
          {/* fluffy edges */}
          {[-4.4, 4.4].map((x) => (
            <group key={x} position={[x, -0.1, 0]}>
              <mesh>
                <sphereGeometry args={[0.9, 10, 10]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
              <mesh position={[0, 0, 2.2]}>
                <sphereGeometry args={[0.7, 10, 10]} />
                <meshStandardMaterial color="#fdf3f7" roughness={1} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function SkyClouds() {
  const clouds = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      x: (i % 2 ? 1 : -1) * (6 + (i * 37) % 8),
      y: 3 + (i * 53) % 5,
      z: -8 - (i * 71) % 34,
      s: 0.8 + ((i * 29) % 10) / 8,
    })),
    []
  );
  return (
    <>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          <mesh>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          <mesh position={[0.9, -0.15, 0]}>
            <sphereGeometry args={[0.7, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          <mesh position={[-0.9, -0.15, 0]}>
            <sphereGeometry args={[0.7, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ---------------- simulation (runs inside the Canvas) ---------------- */

function Simulation({ run, onTick, onEnd }: {
  run: React.MutableRefObject<RunState>;
  onTick: (score: number, t: number) => void;
  onEnd: () => void;
}) {
  const lastHud = useRef(0);
  useFrame((_, rawDt) => {
    const s = run.current;
    if (!s.playing) return;
    const dt = Math.min(0.05, rawDt);

    // clock + ramp
    s.t -= dt;
    s.speed = Math.min(26, s.speed + dt * 0.22);
    s.distance += s.speed * dt;

    // jump physics
    s.vy -= 22 * dt;
    s.y = Math.max(0, s.y + s.vy * dt);
    if (s.y === 0 && s.vy < 0) s.vy = 0;

    // spawn waves
    s.nextSpawn -= dt;
    if (s.nextSpawn <= 0) {
      const lane = Math.floor(Math.random() * 3);
      const r = Math.random();
      if (r < 0.5) {
        // sparkle trail: 3 in a row
        for (let i = 0; i < 3; i++) {
          s.entities.push({ id: s.id++, kind: "sparkle", lane, z: SPAWN_Z - i * 1.6, y: 0.6, taken: false, spin: Math.random() * 6 });
        }
      } else if (r < 0.64) {
        s.entities.push({ id: s.id++, kind: "heart", lane, z: SPAWN_Z, y: 0.65, taken: false, spin: Math.random() * 6 });
      } else if (r < 0.72) {
        s.entities.push({ id: s.id++, kind: "gloss", lane, z: SPAWN_Z, y: 0.7, taken: false, spin: Math.random() * 6 });
      } else if (r < 0.88) {
        s.entities.push({ id: s.id++, kind: "gift", lane, z: SPAWN_Z, y: 0.4, taken: false, spin: 0 });
      } else {
        // low cloud: jump over it
        s.entities.push({ id: s.id++, kind: "cloud", lane, z: SPAWN_Z, y: 0.55, taken: false, spin: 0 });
      }
      s.nextSpawn = Math.max(0.35, 0.85 - s.distance / 900);
    }

    // move + collide
    const now = performance.now();
    const keep: Entity[] = [];
    for (const e of s.entities) {
      e.z += s.speed * dt;
      if (!e.taken && e.z > -0.7 && e.z < 0.7 && e.lane === s.lane) {
        const jumpedOver = s.y > 0.75;
        if (e.kind === "sparkle") { s.score += 1; e.taken = true; pop(); }
        else if (e.kind === "heart") { s.score += 5; e.taken = true; sparkleChime(); }
        else if (e.kind === "gloss") { s.score += 10; e.taken = true; sparkleChime(); }
        else if (!jumpedOver && now > s.stumbleUntil) {
          s.score = Math.max(0, s.score - 3);
          s.stumbleUntil = now + 900;
          e.taken = true;
          pop();
        }
      }
      if (e.z < KILL_Z && !e.taken) keep.push(e);
      else if (e.taken) s.id++; // nudge entity-set version so meshes hide
    }
    s.entities = keep;

    // HUD ~5x/s
    if (now - lastHud.current > 200) {
      lastHud.current = now;
      onTick(s.score, s.t);
    }

    if (s.t <= 0) {
      s.playing = false;
      onEnd();
    }
  });
  return null;
}

/* ---------------- component ---------------- */

const COPY = {
  en: {
    start: "▶ Run!",
    again: "↻ Run again",
    over1: "The gloss escaped…",
    over2: "again. But look what you collected!",
    best: "best",
    roars: (n: number) => `+${n} Roars earned 🦁`,
    newCard: "NEW CARD UNLOCKED!",
    hint: "swipe / ← → to steer · swipe up / space to jump",
    music: "music",
  },
  pt: {
    start: "▶ Corre!",
    again: "↻ Correr outra vez",
    over1: "O gloss fugiu…",
    over2: "outra vez. Mas olha o que apanhaste!",
    best: "recorde",
    roars: (n: number) => `+${n} Rugidos ganhos 🦁`,
    newCard: "CARTA NOVA DESBLOQUEADA!",
    hint: "desliza / ← → para virar · desliza para cima / espaço para saltar",
    music: "música",
  },
} as const;

export default function BloopRun3D({ bestScore }: { bestScore: number }) {
  const { lang } = useI18n();
  const c = COPY[lang];
  const run = useRef<RunState>(freshRun());
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RUN_SECONDS);
  const [newCards, setNewCards] = useState<ChaseCard[]>([]);
  const [roarsEarned, setRoarsEarned] = useState(0);
  const [music, setMusic] = useState(soundEnabled);
  const audio = useRef<HTMLAudioElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const steer = (dir: -1 | 1) => {
    const s = run.current;
    if (s.playing) s.lane = Math.max(0, Math.min(2, s.lane + dir));
  };
  const jump = () => {
    const s = run.current;
    if (s.playing && s.y === 0) { s.vy = 8.5; pop(); }
  };

  const start = () => {
    run.current = { ...freshRun(), playing: true };
    setScore(0); setTimeLeft(RUN_SECONDS); setNewCards([]); setRoarsEarned(0);
    setPhase("playing");
    if (music) {
      audio.current ??= new Audio("/music/bloop-run-v1.mp3");
      audio.current.loop = true;
      audio.current.volume = 0.35;
      audio.current.play().catch(() => {});
    }
  };

  const end = () => {
    audio.current?.pause();
    const s = run.current;
    const unlocked = recordRun(s.score);
    const roars = Math.floor(s.score / 10);
    if (roars > 0) awardRoars(roars);
    setScore(s.score);
    setRoarsEarned(roars);
    setNewCards(unlocked);
    if (unlocked.length > 0) {
      sparkleChime();
      confettiBurst(window.innerWidth / 2, 300, 30);
    }
    setPhase("over");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) steer(-1);
      else if (["ArrowRight", "KeyD"].includes(e.code)) steer(1);
      else if (["Space", "ArrowUp", "KeyW"].includes(e.code)) { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => audio.current?.pause(), []);

  return (
    <div
      className="relative mx-auto h-[70svh] max-h-[46rem] w-full max-w-md touch-none select-none overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-white/70"
      onPointerDown={(e) => { touch.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t) return;
        const dx = e.clientX - t.x, dy = e.clientY - t.y;
        if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { jump(); return; } // tap = jump
        if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1);
        else if (dy < 0) jump();
      }}
      role="application"
      aria-label="Bloop Run 3D"
    >
      <Canvas shadows camera={{ position: [0, 4.4, 7.5], fov: 52, near: 0.1, far: 60 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#dceffb"]} />
        <fog attach="fog" args={["#f4dfe9", 14, 46]} />
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <group position={[0, 0, 0]} onUpdate={(g) => g.lookAt(0, 0, 0)} />
        <Track run={run} />
        <SkyClouds />
        <Bloop run={run} />
        <FleeingGloss />
        <Entities run={run} />
        <DreiSparkles count={40} scale={[10, 5, 30]} position={[0, 2.5, -12]} size={2.5} speed={0.3} color="#F0C36B" />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={12} blur={2.4} far={3} />
        <Simulation run={run} onTick={(sc, t) => { setScore(sc); setTimeLeft(Math.max(0, t)); }} onEnd={end} />
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-2 text-xs font-extrabold">
        <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink shadow">✦ {score}</span>
        <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink shadow">⏱ {Math.ceil(timeLeft)}s</span>
        <span className="rounded-full bg-white/85 px-3 py-1.5 text-ink/60 shadow">{c.best}: {bestScore}</span>
      </div>
      <button
        onClick={() => {
          setMusic((m) => {
            const next = !m;
            if (!next) audio.current?.pause();
            else if (phase === "playing") { audio.current ??= new Audio("/music/bloop-run-v1.mp3"); audio.current.loop = true; audio.current.volume = 0.35; audio.current.play().catch(() => {}); }
            return next;
          });
        }}
        aria-pressed={music}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/85 px-3 py-1.5 text-xs font-extrabold text-ink shadow"
      >
        {music ? "🔔" : "🔕"} {c.music}
      </button>

      {/* start overlay */}
      {phase === "idle" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/25 backdrop-blur-[2px]">
          <img src="/chase/game/title-art.webp" alt="Bloop Run" className="w-64 max-w-[80%] drop-shadow-xl" />
          <button
            onClick={start}
            className="rounded-full bg-ink px-10 py-4 text-lg font-extrabold text-cloud shadow-xl transition hover:scale-105"
          >
            {c.start}
          </button>
          <p className="max-w-xs text-center text-xs font-extrabold uppercase tracking-wider text-ink/60">{c.hint}</p>
        </div>
      )}

      {/* game over overlay */}
      <AnimatePresence>
        {phase === "over" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/60 p-4 text-center backdrop-blur-sm"
          >
            <p className="font-display text-2xl font-semibold text-ink">{c.over1}</p>
            <p className="text-sm font-bold text-ink/60">{c.over2}</p>
            <p className="font-display text-5xl font-semibold text-pink-deep">✦ {score}</p>
            {roarsEarned > 0 && <Sticker tone="gold" rotate={-3}>{c.roars(roarsEarned)}</Sticker>}
            {newCards.map((card) => (
              <div key={card.id} className="mt-1 flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 shadow-lg ring-2 ring-gold">
                <span className="text-xs font-black uppercase tracking-wider text-amber">{c.newCard}</span>
                <span className="text-sm font-bold text-ink">{card.name[lang]}</span>
              </div>
            ))}
            <button
              onClick={start}
              className="mt-2 rounded-full bg-ink px-8 py-3.5 font-extrabold text-cloud shadow-xl transition hover:scale-105"
            >
              {c.again}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
