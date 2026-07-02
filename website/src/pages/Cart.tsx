import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Bloop from "../components/Bloop";
import { useCart } from "../context/CartContext";
import { useI18n } from "../lib/i18n";
import { products } from "../data/products";
import { Card, ShopShell, money } from "../components/shop/Ui";

export default function Cart() {
  const { t } = useI18n();
  const { itemsDetailed, subtotal, shipping, total, freeShippingOver, setQty, remove, count } = useCart();

  if (count === 0) {
    return (
      <ShopShell title={t("cart.title")} narrow>
        <Card className="text-center">
          <div className="mx-auto inline-block">
            <Bloop src="/mascots/boop-sad.webp" imgClassName="h-36 w-auto" />
          </div>
          <p className="font-display mt-4 text-2xl font-semibold text-ink">{t("cart.empty.title")}</p>
          <p className="mt-2 font-semibold text-ink/60">{t("cart.empty.sub")}</p>
          <Link
            to="/#drop"
            className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105"
          >
            {t("cart.continue")}
          </Link>
        </Card>
      </ShopShell>
    );
  }

  return (
    <ShopShell title={t("cart.title")} subtitle={`${count} ${count === 1 ? "treasure" : "treasures"} inside.`}>
      <div className="mb-6 flex items-center gap-3 rounded-3xl bg-pink/20 px-5 py-3">
        <Bloop src="/mascots/boop-happy.webp" float={false} showCounter={false} imgClassName="h-14 w-auto" />
        <p className="text-sm font-extrabold text-ink">{t("cart.cuter")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {itemsDetailed.map(({ product, qty, lineTotal }) => (
            <Card key={product.sku} className="flex items-center gap-4 !p-4 sm:!p-5">
              <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl bg-white object-contain ring-1 ring-ink/10" />
              <div className="min-w-0 flex-1">
                <p translate="no" className="notranslate font-display font-semibold text-ink">{product.name}</p>
                <p translate="no" className="notranslate text-xs font-bold text-ink/60">{product.sku}</p>
                <p className="mt-1 text-sm font-bold text-amber">{money(product.price)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-ink/10">
                <button aria-label="decrease" onClick={() => setQty(product.sku, qty - 1)} className="h-7 w-7 rounded-full font-black text-ink/60 transition hover:bg-cloud">−</button>
                <span className="w-6 text-center text-sm font-extrabold text-ink">{qty}</span>
                <button aria-label="increase" onClick={() => setQty(product.sku, qty + 1)} className="h-7 w-7 rounded-full font-black text-ink/60 transition hover:bg-cloud">+</button>
              </div>
              <p className="hidden w-20 text-right font-bold text-ink sm:block">{money(lineTotal)}</p>
              <button onClick={() => remove(product.sku)} aria-label={`remove ${product.name}`} className="text-ink/55 transition hover:text-pink-deep">✕</button>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="font-display text-xl font-semibold text-ink">{t("cart.summary")}</h2>
          <dl className="mt-4 space-y-2 text-sm font-semibold text-ink/70">
            <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between">
              <dt>{t("cart.shipping")}</dt>
              <dd>{shipping === 0 ? t("cart.free") : money(shipping)}</dd>
            </div>
            {shipping > 0 ? (
              <div className="rounded-xl bg-sky/30 px-3 py-2">
                <p className="text-xs font-bold text-ink/70">
                  {money(freeShippingOver - subtotal)} {t("cart.more")}
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.min(100, (subtotal / freeShippingOver) * 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-deep to-pink-deep"
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-gold/20 px-3 py-2 text-xs font-extrabold text-ink/70">
                {t("cart.unlocked")}
              </p>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-extrabold text-ink">
              <dt>{t("cart.total")}</dt><dd>{money(total)}</dd>
            </div>
          </dl>
          <GiftToggle />
          <Link
            to="/checkout"
            className="mt-6 block rounded-full bg-ink px-8 py-3.5 text-center font-bold text-cloud shadow-lg transition hover:scale-[1.02]"
          >
            {t("cart.checkout")}
          </Link>
          <Link to="/#drop" className="mt-3 block text-center text-sm font-bold text-ink/60 hover:text-ink">
            {t("cart.continue")}
          </Link>
        </Card>
      </div>

      {/* you may also like */}
      <UpsellRow />
    </ShopShell>
  );
}

function UpsellRow() {
  const { t } = useI18n();
  const { lines, add } = useCart();
  const inCart = new Set(lines.map((l) => l.sku));
  const picks = products.filter((p) => !inCart.has(p.sku)).slice(0, 3);
  if (picks.length === 0) return null;
  return (
    <div className="mt-12">
      <h2 className="font-display text-xl font-semibold text-ink">{t("cart.complete")}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {picks.map((p) => (
          <div key={p.sku} className="flex items-center gap-3 rounded-3xl bg-white/70 p-4 shadow-sm ring-1 ring-white/60">
            <Link to={`/products/${p.slug}`} className="shrink-0">
              <img src={p.image} alt={p.name} loading="lazy" className="h-16 w-16 rounded-2xl bg-white object-contain ring-1 ring-ink/10" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/products/${p.slug}`} translate="no" className="notranslate block truncate text-sm font-bold text-ink hover:underline">
                {p.name}
              </Link>
              <p className="text-xs font-bold text-amber">{money(p.price)}</p>
            </div>
            <button
              onClick={() => add(p)}
              aria-label={`add ${p.name} to bag`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-lg font-black text-cloud transition hover:scale-110"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


function GiftToggle() {
  const { t } = useI18n();
  const [gift, setGift] = useState(() => sessionStorage.getItem("leones-gift") === "1");
  return (
    <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-pink/20 px-4 py-3">
      <input
        type="checkbox"
        checked={gift}
        onChange={(e) => {
          setGift(e.target.checked);
          sessionStorage.setItem("leones-gift", e.target.checked ? "1" : "0");
        }}
        className="h-5 w-5 accent-[#3a2e3d]"
      />
      <span className="text-sm font-bold text-ink">
        {t("cart.gift")}
        <span className="block text-xs font-semibold text-ink/60">
          {t("cart.gift.sub")}
        </span>
      </span>
    </label>
  );
}
