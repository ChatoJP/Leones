import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Boop from "../components/Boop";
import { Card, ErrorNote, Field, PrimaryButton } from "../components/shop/Ui";
import { confettiBurst } from "../lib/confetti";
import { useI18n } from "../lib/i18n";
import { sparkleChime } from "../lib/sound";
import { getProgress, setProgress, useBookProgress } from "../lib/bookclub";
import { getBook } from "../data/bloopBooks";

const COPY = {
  en: {
    back: "← All books", pageOf: (a: number, b: number) => `page ${a} of ${b}`,
    next: "Next →", prev: "← Back", theEnd: "The end ✦", toQuiz: "Take the tiny quiz",
    quizTitle: "The tiny quiz", quizSub: "Three questions. Boop believes in you.",
    tryAgain: "Almost! Read again or try once more ✦", quizDone: "You really read it! ✦",
    parentTitle: "One last thing 😄", parentSub: "Boop keeps its promises with parents. A parent or guardian confirms, and the surprise unlocks.",
    childName: "Your first name (for the certificate)", parentEmail: "Parent or guardian email",
    parentCheck: "I'm the parent/guardian and I confirm this reading",
    confirm: "Confirm reading",
    rewardTitle: "Unlocked! ✦", rewardBadge: "Reader badge earned",
    rewardActive: (v: string) => `Boop prepared: ${v}`,
    rewardPending: "Boop is still preparing this book's surprise — your badge and certificate are yours forever, and the surprise arrives with the public launch. No fake promises here.",
    cert: "🐾 Download reading certificate", certPreparing: "Preparing…",
    lost: "This story ran off with the gloss.",
  },
  pt: {
    back: "← Todos os livros", pageOf: (a: number, b: number) => `página ${a} de ${b}`,
    next: "Seguinte →", prev: "← Voltar", theEnd: "Fim ✦", toQuiz: "Fazer o mini-quiz",
    quizTitle: "O mini-quiz", quizSub: "Três perguntas. O Boop acredita em ti.",
    tryAgain: "Quase! Relê ou tenta outra vez ✦", quizDone: "Leste mesmo! ✦",
    parentTitle: "Uma última coisa 😄", parentSub: "O Boop cumpre as promessas com os pais. Um pai/mãe ou responsável confirma, e a surpresa desbloqueia.",
    childName: "O teu primeiro nome (para o certificado)", parentEmail: "Email do pai/mãe ou responsável",
    parentCheck: "Sou o responsável e confirmo esta leitura",
    confirm: "Confirmar leitura",
    rewardTitle: "Desbloqueado! ✦", rewardBadge: "Crachá de leitura ganho",
    rewardActive: (v: string) => `O Boop preparou: ${v}`,
    rewardPending: "O Boop ainda está a preparar a surpresa deste livro — o teu crachá e certificado são teus para sempre, e a surpresa chega com o lançamento público. Aqui não há promessas falsas.",
    cert: "🐾 Descarregar certificado de leitura", certPreparing: "A preparar…",
    lost: "Esta história fugiu com o gloss.",
  },
} as const;

const REWARD_LABEL: Record<string, { en: string; pt: string }> = {
  sticker: { en: "a collectible sticker sheet", pt: "uma folha de autocolantes colecionáveis" },
  card: { en: "a collectible card", pt: "uma carta colecionável" },
  discount: { en: "a discount code", pt: "um código de desconto" },
  gift: { en: "a surprise gift", pt: "um presente surpresa" },
  gloss: { en: "a free gloss", pt: "um gloss grátis" },
  surprise: { en: "a surprise", pt: "uma surpresa" },
};

async function renderCertificate(bookTitle: string, reader: string, lang: "en" | "pt"): Promise<string> {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#c9e4f5"); bg.addColorStop(0.55, "#f7f5f3"); bg.addColorStop(1, "#fbd3de");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#f0c36b"; ctx.lineWidth = 6; ctx.setLineDash([2, 14]); ctx.lineCap = "round";
  ctx.strokeRect(56, 56, W - 112, H - 112); ctx.setLineDash([]);
  ctx.textAlign = "center"; ctx.fillStyle = "#3a2e3d";
  ctx.font = "700 42px Georgia, serif";
  ctx.fillText(lang === "pt" ? "✦ certificado de leitura ✦" : "✦ reading certificate ✦", W / 2, 170);
  ctx.font = "700 34px Georgia, serif"; ctx.fillStyle = "rgba(58,46,61,0.55)";
  ctx.fillText("Bloop Book Club", W / 2, 225);
  const img = new Image();
  await new Promise((res) => { img.onload = res; img.onerror = res; img.src = "/mascots/boop-happy.webp"; });
  if (img.width) { const bw = 330; ctx.drawImage(img, W / 2 - bw / 2, 270, bw, (img.height / img.width) * bw); }
  ctx.fillStyle = "#f6b7c8"; ctx.font = "700 72px Georgia, serif";
  ctx.fillText(reader || (lang === "pt" ? "Leitora Honesta" : "Honest Reader"), W / 2, 740);
  ctx.fillStyle = "#3a2e3d"; ctx.font = "600 36px Georgia, serif";
  ctx.fillText(lang === "pt" ? "leu do início ao fim" : "read from start to finish", W / 2, 810);
  ctx.font = "700 40px Georgia, serif";
  const words = bookTitle.split(" ");
  const mid = Math.ceil(words.length / 2);
  ctx.fillText(`"${words.slice(0, mid).join(" ")}`, W / 2, 880);
  ctx.fillText(`${words.slice(mid).join(" ")}"`, W / 2, 935);
  ctx.font = "600 30px Georgia, serif"; ctx.fillStyle = "rgba(58,46,61,0.6)";
  ctx.fillText(new Date().toLocaleDateString(lang === "pt" ? "pt-PT" : "en-IE", { day: "numeric", month: "long", year: "numeric" }), W / 2, 1010);
  ctx.fillStyle = "#3a2e3d"; ctx.font = "600 30px Georgia, serif";
  ctx.fillText(lang === "pt" ? "quiz superado · confirmado pelos pais" : "quiz passed · parent confirmed", W / 2, 1130);
  ctx.fillText(lang === "pt" ? "testemunhado pelo Boop 🐾" : "witnessed by Boop 🐾", W / 2, 1185);
  ctx.font = "700 34px Georgia, serif";
  ctx.fillText("LeoNes ✦ leones.co", W / 2, 1265);
  return canvas.toDataURL("image/png");
}

export default function BloopBookReader() {
  const { slug } = useParams();
  const { lang } = useI18n();
  const c = COPY[lang];
  const book = getBook(slug ?? "");
  useBookProgress(slug ?? ""); // subscribe to cross-tab changes
  const [page, setPage] = useState(0);
  const [stage, setStage] = useState<"read" | "quiz" | "parent" | "reward">("read");
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizErr, setQuizErr] = useState(false);
  const [childName, setChildName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentChecked, setParentChecked] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<{ type: string; value: string } | null>(null);
  const [certBusy, setCertBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const p = getProgress(slug);
    setPage(Math.min(p.page, (book?.pages.length ?? 1) - 1));
    if (p.confirmed) setStage("reward");
    else if (p.quizPassed) setStage("parent");
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (stage === "reward" && slug) {
      fetch("/api/bookclub/rewards")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setReward(d?.rewards?.[slug] ?? null))
        .catch(() => {});
    }
  }, [stage, slug]);

  if (!book || !slug) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{c.lost}</h1>
        <Link to="/bloop-books" className="mt-6 inline-block font-bold text-amber">{c.back}</Link>
      </div>
    );
  }

  const last = book.pages.length - 1;

  const goNext = () => {
    const n = Math.min(page + 1, last);
    setPage(n);
    setProgress(slug, { page: Math.max(getProgress(slug).page, n), finished: n === last ? true : getProgress(slug).finished });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitQuiz = () => {
    const allRight = book.quiz.every((q, i) => answers[i] === q.answer);
    if (allRight) {
      setQuizErr(false);
      setProgress(slug, { quizPassed: true });
      sparkleChime();
      confettiBurst(window.innerWidth / 2, 260, 22);
      setStage("parent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setQuizErr(true);
      setAnswers([]);
    }
  };

  const submitParent = async () => {
    if (busy || !parentChecked) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/bookclub/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: slug, childName, parentEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setProgress(slug, { confirmed: true });
      sessionStorage.setItem("leones-reader-name", childName);
      sparkleChime();
      confettiBurst(window.innerWidth / 2, 300, 28);
      setStage("reward");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const downloadCert = async () => {
    if (certBusy) return;
    setCertBusy(true);
    try {
      const url = await renderCertificate(book.title[lang], sessionStorage.getItem("leones-reader-name") ?? childName, lang);
      sparkleChime();
      const a = document.createElement("a");
      a.href = url;
      a.download = lang === "pt" ? "certificado-de-leitura-bloop.png" : "bloop-reading-certificate.png";
      a.click();
    } finally {
      setCertBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/bloop-books" className="text-sm font-bold text-ink/60 hover:text-ink">{c.back}</Link>
      <h1 className="font-display mt-3 text-3xl font-semibold text-ink sm:text-4xl">
        {book.emoji} {book.title[lang]}
      </h1>

      <AnimatePresence mode="wait">
        {stage === "read" && (
          <motion.div key={`p${page}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="mt-6 overflow-hidden rounded-[2rem] shadow-xl ring-8 ring-white/70">
              <img src={book.pages[page].img} alt="" className="aspect-video w-full object-cover" />
            </div>
            <p className="mx-auto mt-6 max-w-xl text-center text-lg font-semibold leading-relaxed text-ink/80">
              {book.pages[page][lang]}
            </p>
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:scale-105 disabled:opacity-30"
              >
                {c.prev}
              </button>
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink/55">{c.pageOf(page + 1, book.pages.length)}</span>
              {page < last ? (
                <button onClick={goNext} className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cloud transition hover:scale-105">
                  {c.next}
                </button>
              ) : (
                <button
                  onClick={() => { setProgress(slug, { finished: true }); setStage("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="rounded-full bg-gradient-to-r from-pink to-sky px-6 py-3 text-sm font-extrabold text-ink ring-2 ring-white transition hover:scale-105"
                >
                  {c.theEnd} {c.toQuiz}
                </button>
              )}
            </div>
            {/* progress dots */}
            <div className="mt-5 flex justify-center gap-1.5">
              {book.pages.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i <= page ? "bg-pink-deep" : "bg-ink/15"}`} />
              ))}
            </div>
          </motion.div>
        )}

        {stage === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-8">
            <Card>
              <h2 className="font-display text-2xl font-semibold text-ink">{c.quizTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-ink/60">{c.quizSub}</p>
              {quizErr && <p className="mt-3 rounded-2xl bg-gold/20 px-4 py-2.5 text-sm font-bold text-ink">{c.tryAgain}</p>}
              <div className="mt-5 space-y-6">
                {book.quiz.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-bold text-ink">{qi + 1}. {q.q[lang]}</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {q.options[lang].map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })}
                          className={`rounded-full px-5 py-2.5 text-left text-sm font-bold transition ${
                            answers[qi] === oi ? "bg-ink text-cloud" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-pink-deep"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <PrimaryButton onClick={submitQuiz} disabled={answers.filter((a) => a !== undefined).length < book.quiz.length}>
                  ✦
                </PrimaryButton>
              </div>
            </Card>
          </motion.div>
        )}

        {stage === "parent" && (
          <motion.div key="parent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-8">
            <Card>
              <p className="rounded-2xl bg-sky/30 px-4 py-2.5 text-sm font-extrabold text-ink">{c.quizDone}</p>
              <h2 className="font-display mt-4 text-2xl font-semibold text-ink">{c.parentTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-ink/60">{c.parentSub}</p>
              <div className="mt-5 space-y-4">
                <ErrorNote>{err}</ErrorNote>
                <Field label={c.childName} value={childName} maxLength={40} onChange={(e) => setChildName(e.target.value)} />
                <Field label={c.parentEmail} type="email" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" />
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cloud px-4 py-3">
                  <input type="checkbox" checked={parentChecked} onChange={(e) => setParentChecked(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#3a2e3d]" />
                  <span className="text-sm font-bold text-ink">{c.parentCheck}</span>
                </label>
                <PrimaryButton onClick={submitParent} loading={busy} disabled={!parentChecked || !parentEmail}>
                  {c.confirm}
                </PrimaryButton>
              </div>
            </Card>
          </motion.div>
        )}

        {stage === "reward" && (
          <motion.div key="reward" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="mt-8">
            <Card className="text-center">
              <div className="inline-block">
                <Boop src="/mascots/boop-happy.webp" imgClassName="h-32 w-auto" showCounter={false} />
              </div>
              <h2 className="font-display mt-3 text-3xl font-semibold text-ink">{c.rewardTitle}</h2>
              <p className="mt-2 inline-block rounded-full bg-gold/25 px-4 py-1.5 text-sm font-extrabold text-amber">
                {book.emoji} {c.rewardBadge}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm font-semibold text-ink/70">
                {reward
                  ? c.rewardActive(REWARD_LABEL[reward.type]?.[lang] ?? reward.type) + (reward.value ? ` — ${reward.value}` : "")
                  : c.rewardPending}
              </p>
              <div className="mt-6">
                <button
                  onClick={downloadCert}
                  disabled={certBusy}
                  className="rounded-full bg-gradient-to-r from-pink to-sky px-7 py-3 text-sm font-extrabold text-ink shadow-lg ring-2 ring-white transition hover:scale-105 disabled:opacity-50"
                >
                  {certBusy ? c.certPreparing : c.cert}
                </button>
              </div>
              <Link to="/bloop-books" className="mt-5 inline-block text-sm font-bold text-amber hover:underline">{c.back}</Link>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
