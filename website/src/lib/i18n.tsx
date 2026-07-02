// Lightweight PT-PT / EN localization for commerce surfaces.
// Editorial/marketing copy stays EN for now (pending copywriting pass).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { productsPt } from "../data/products.pt";
import type { Product } from "../data/products";

export type Lang = "en" | "pt";

const DICT = {
  en: {
    "nav.drop": "The Drop",
    "nav.parents": "Parents",
    "nav.club": "Cubs Club",
    "nav.books": "Bloop Books",
    "nav.bag": "My Bag",
    "nav.account": "My account",
    "nav.login": "Sign in",
    "nav.search": "Search",
    "announce": "EU shipping · Free over €35 · Early concept drop",
    "cart.title": "Your bag",
    "cart.empty.title": "Nothing here yet.",
    "cart.empty.sub": "Your pink is still out there.",
    "cart.continue": "Continue shopping",
    "cart.summary": "Summary",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.free": "Free ✦",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.gift": "This is a gift 🎁",
    "cart.gift.sub": "Gift-ready packaging included — free ✦",
    "cart.more": "more for free shipping ✦",
    "cart.unlocked": "🎉 Free shipping unlocked!",
    "cart.complete": "Complete the drop ✦",
    "cart.cuter": "Your bag is getting cuter ✦",
    "checkout.title": "Checkout",
    "checkout.sub": "Almost yours ✦",
    "checkout.delivery": "Delivery details",
    "checkout.guest": "Checking out as guest — you can",
    "checkout.guest2": "create an account",
    "checkout.guest3": "after.",
    "checkout.name": "Name",
    "checkout.email": "Email",
    "checkout.phone": "Phone",
    "checkout.country": "Country (EU only)",
    "checkout.address": "Address",
    "checkout.city": "City",
    "checkout.postal": "Postal code",
    "checkout.notes": "Notes (optional)",
    "checkout.notes.ph": "Gift note, delivery hints…",
    "checkout.order": "Your order",
    "checkout.pay": "Pay now —",
    "checkout.secure": "Secure payment. Card details never touch our servers.",
    "search.placeholder": "Search the drop…",
    "search.empty": "Nothing found — try \"gloss\" or \"jelly\" ✦",
    "footer.explore": "Explore",
    "footer.quiz": "The Gloss Quiz",
    "footer.parents": "For Parents",
    "footer.parents.1": "Product details, ingredients and compliance information will be confirmed before public launch.",
    "footer.parents.2": "We only sell within the European Union. Prices in EUR.",
    "footer.legal": "The Fine Print",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.shipping": "Shipping & Returns",
    "footer.contact": "Contact",
    "footer.hi": "Say Hi",
  },
  pt: {
    "nav.drop": "O Drop",
    "nav.parents": "Pais",
    "nav.club": "Cubs Club",
    "nav.books": "Bloop Books",
    "nav.bag": "A Minha Mala",
    "nav.account": "Minha conta",
    "nav.login": "Entrar",
    "nav.search": "Pesquisar",
    "announce": "Envios UE · Grátis acima de €35 · Drop de conceito",
    "cart.title": "A tua mala",
    "cart.empty.title": "Ainda nada por aqui.",
    "cart.empty.sub": "O teu rosa anda por aí.",
    "cart.continue": "Continuar a explorar",
    "cart.summary": "Resumo",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Envio",
    "cart.free": "Grátis ✦",
    "cart.total": "Total",
    "cart.checkout": "Finalizar compra",
    "cart.gift": "É um presente 🎁",
    "cart.gift.sub": "Embalagem de presente incluída — grátis ✦",
    "cart.more": "para envio grátis ✦",
    "cart.unlocked": "🎉 Envio grátis desbloqueado!",
    "cart.complete": "Completa o drop ✦",
    "cart.cuter": "A tua mala está a ficar mais fofa ✦",
    "checkout.title": "Finalizar compra",
    "checkout.sub": "Quase teu ✦",
    "checkout.delivery": "Dados de entrega",
    "checkout.guest": "Compra como convidada — podes",
    "checkout.guest2": "criar conta",
    "checkout.guest3": "depois.",
    "checkout.name": "Nome",
    "checkout.email": "Email",
    "checkout.phone": "Telemóvel",
    "checkout.country": "País (apenas UE)",
    "checkout.address": "Morada",
    "checkout.city": "Cidade",
    "checkout.postal": "Código postal",
    "checkout.notes": "Notas (opcional)",
    "checkout.notes.ph": "Mensagem de presente, indicações…",
    "checkout.order": "A tua encomenda",
    "checkout.pay": "Pagar agora —",
    "checkout.secure": "Pagamento seguro. Os dados do cartão nunca tocam os nossos servidores.",
    "search.placeholder": "Procura no drop…",
    "search.empty": "Nada encontrado — tenta \"gloss\" ou \"jelly\" ✦",
    "footer.explore": "Explorar",
    "footer.quiz": "O Quiz do Gloss",
    "footer.parents": "Para os Pais",
    "footer.parents.1": "Detalhes do produto, ingredientes e informação de conformidade serão confirmados antes do lançamento público.",
    "footer.parents.2": "Vendemos apenas na União Europeia. Preços em EUR.",
    "footer.legal": "Letras Pequenas",
    "footer.privacy": "Privacidade",
    "footer.terms": "Termos",
    "footer.shipping": "Envios & Devoluções",
    "footer.contact": "Contacto",
    "footer.hi": "Diz Olá",
  },
} as const;

type Key = keyof typeof DICT.en;

export function localizeProduct(p: Product, lang: Lang): Product {
  if (lang !== "pt") return p;
  const pt = productsPt[p.sku];
  return pt ? { ...p, ...pt } : p;
}

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; lp: (p: Product) => Product }>({
  lang: "en",
  setLang: () => {},
  t: (k) => DICT.en[k],
  lp: (p) => p,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("leones-lang");
    if (saved === "pt" || saved === "en") return saved;
    return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
  });
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("leones-lang", l);
    setLangState(l);
  };
  const t = (k: Key) => (DICT[lang][k] ?? DICT.en[k]) as string;
  const lp = (p: Product) => localizeProduct(p, lang);
  return <I18nContext.Provider value={{ lang, setLang, t, lp }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
