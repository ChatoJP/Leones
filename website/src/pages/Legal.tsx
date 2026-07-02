import { Card, ShopShell } from "../components/shop/Ui";
import { useI18n } from "../lib/i18n";

const PENDING = {
  en: "This document is a structured placeholder and will be finalized with legal counsel before public launch.",
  pt: "Este documento é um placeholder estruturado e será finalizado com aconselhamento jurídico antes do lançamento público.",
};

const FOOTER = {
  en: "Questions? hello@leones.co ·",
  pt: "Dúvidas? hello@leones.co ·",
};

function LegalPage({ title, sections }: { title: string; sections: Array<[string, string]> }) {
  const { lang } = useI18n();
  return (
    <ShopShell narrow title={title}>
      <Card>
        <p className="rounded-xl bg-gold/15 px-3 py-2 text-xs font-bold text-ink/60">{PENDING[lang]}</p>
        <div className="mt-5 space-y-5">
          {sections.map(([h, body]) => (
            <div key={h}>
              <h2 className="font-display text-lg font-semibold text-ink">{h}</h2>
              <p className="mt-1 text-sm font-semibold text-ink/60">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs font-bold text-ink/60">
          {FOOTER[lang]} <span translate="no" className="notranslate">LeoNes</span> Cosmética · European Union
        </p>
      </Card>
    </ShopShell>
  );
}

const PRIVACY = {
  en: {
    title: "Privacy",
    sections: [
      ["What we collect", "Account details (name, email), order and delivery information, and the contents of your bag. Card details never touch our servers — payment is handled by our payment provider."],
      ["What we don't do", "We do not sell personal data. We do not run third-party advertising trackers. Collection-album and cart data live in your own browser."],
      ["Children's privacy", "LeoNes is designed for young audiences with their parents. Accounts and purchases are intended to be made or supervised by a parent or guardian. Final age and consent flows (GDPR Art. 8) will be defined before launch."],
      ["Your rights (GDPR)", "Access, correction, deletion and portability of your data — email us and we will handle it. A full DPO contact and legal basis table will be published before launch."],
      ["Cookies & storage", "We use essential storage only: your session cookie (sign-in), your bag, language and sticker album (localStorage). No marketing cookies."],
    ] as Array<[string, string]>,
  },
  pt: {
    title: "Privacidade",
    sections: [
      ["O que recolhemos", "Dados de conta (nome, email), informação de encomenda e entrega, e o conteúdo da tua mala. Os dados do cartão nunca tocam os nossos servidores — o pagamento é gerido pelo nosso fornecedor de pagamentos."],
      ["O que não fazemos", "Não vendemos dados pessoais. Não usamos trackers de publicidade de terceiros. A caderneta e a mala vivem no teu próprio navegador."],
      ["Privacidade de menores", "A LeoNes é pensada para públicos jovens com os pais. Contas e compras devem ser feitas ou supervisionadas por um adulto responsável. Os fluxos finais de idade e consentimento (RGPD Art. 8) serão definidos antes do lançamento."],
      ["Os teus direitos (RGPD)", "Acesso, correção, eliminação e portabilidade dos teus dados — escreve-nos e tratamos disso. O contacto do DPO e a tabela de bases legais serão publicados antes do lançamento."],
      ["Cookies e armazenamento", "Usamos apenas armazenamento essencial: cookie de sessão (login), mala, idioma e caderneta (localStorage). Zero cookies de marketing."],
    ] as Array<[string, string]>,
  },
};

const TERMS = {
  en: {
    title: "Terms of Sale",
    sections: [
      ["Who we are", "LeoNes Cosmética, selling exclusively within the European Union. Prices in EUR, VAT treatment to be finalized before launch."],
      ["Ordering", "Orders are confirmed by email after successful payment. We validate all prices server-side at the moment of purchase."],
      ["Early concept status", "Products shown are part of an early concept drop. Formulas, packaging and compliance details will be confirmed before anything ships."],
      ["Right of withdrawal", "EU consumers have a 14-day right of withdrawal on eligible items. Hygiene-sealed cosmetics may be excluded once opened; final policy will be published before launch."],
      ["Liability & disputes", "EU consumer law applies. Full clauses will be added with legal review."],
    ] as Array<[string, string]>,
  },
  pt: {
    title: "Termos de Venda",
    sections: [
      ["Quem somos", "LeoNes Cosmética, com venda exclusiva na União Europeia. Preços em EUR, tratamento de IVA a finalizar antes do lançamento."],
      ["Encomendas", "As encomendas são confirmadas por email após pagamento bem-sucedido. Todos os preços são validados no servidor no momento da compra."],
      ["Estado de conceito", "Os produtos mostrados fazem parte de um drop de conceito. Fórmulas, embalagens e conformidade serão confirmadas antes de qualquer envio."],
      ["Direito de livre resolução", "Os consumidores da UE têm 14 dias de direito de livre resolução em artigos elegíveis. Cosméticos selados por higiene podem ser excluídos depois de abertos; a política final será publicada antes do lançamento."],
      ["Responsabilidade e litígios", "Aplica-se o direito do consumidor da UE. As cláusulas completas serão adicionadas com revisão jurídica."],
    ] as Array<[string, string]>,
  },
};

const SHIPPING = {
  en: {
    title: "Shipping & Returns",
    sections: [
      ["Where we ship", "European Union only, all 27 member states."],
      ["Cost", "Flat €4.90. Free on orders over €35. Always shown at checkout before you pay."],
      ["When", "Dispatch and delivery estimates will be published when fulfillment is live."],
      ["Returns", "14-day EU withdrawal right on eligible items. Unopened, hygiene-sealed products only. Contact hello@leones.co to start a return; full self-service flow coming before launch."],
      ["Damaged or wrong item", "Email a photo within 7 days of delivery and we make it right — replacement or refund, your choice."],
    ] as Array<[string, string]>,
  },
  pt: {
    title: "Envios & Devoluções",
    sections: [
      ["Para onde enviamos", "Apenas União Europeia, os 27 estados-membros."],
      ["Custo", "Taxa fixa de €4,90. Grátis em encomendas acima de €35. Sempre visível no checkout antes de pagares."],
      ["Quando", "As estimativas de expedição e entrega serão publicadas quando a logística estiver ativa."],
      ["Devoluções", "Direito de livre resolução de 14 dias (UE) em artigos elegíveis. Apenas produtos fechados com selo de higiene. Contacta hello@leones.co para iniciar uma devolução; fluxo self-service completo antes do lançamento."],
      ["Artigo danificado ou errado", "Envia uma foto até 7 dias após a entrega e resolvemos — substituição ou reembolso, tu escolhes."],
    ] as Array<[string, string]>,
  },
};

const CONTACT = {
  en: {
    title: "Say hi ✦",
    sub: "We read everything.",
    body: "Questions, ideas, or a drawing of the mascot? Email us — a real person answers.",
    note: "Parents: compliance and safety questions get priority. Include your order number if you have one.",
  },
  pt: {
    title: "Diz olá ✦",
    sub: "Lemos tudo.",
    body: "Dúvidas, ideias ou um desenho do mascote? Escreve-nos — responde uma pessoa a sério.",
    note: "Pais: questões de conformidade e segurança têm prioridade. Inclui o número da encomenda se tiveres um.",
  },
};

export function Privacy() {
  const { lang } = useI18n();
  const c = PRIVACY[lang];
  return <LegalPage title={c.title} sections={c.sections} />;
}

export function Terms() {
  const { lang } = useI18n();
  const c = TERMS[lang];
  return <LegalPage title={c.title} sections={c.sections} />;
}

export function ShippingReturns() {
  const { lang } = useI18n();
  const c = SHIPPING[lang];
  return <LegalPage title={c.title} sections={c.sections} />;
}

export function Contact() {
  const { lang } = useI18n();
  const c = CONTACT[lang];
  return (
    <ShopShell narrow title={c.title} subtitle={c.sub}>
      <Card className="text-center">
        <p className="text-4xl">💌</p>
        <p className="mt-4 font-semibold text-ink/70">{c.body}</p>
        <a
          href="mailto:hello@leones.co?subject=Ol%C3%A1%20LeoNes%20%E2%9C%A6"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 font-bold text-cloud shadow-lg transition hover:scale-105"
        >
          hello@leones.co
        </a>
        <p className="mt-5 text-xs font-bold text-ink/60">{c.note}</p>
      </Card>
    </ShopShell>
  );
}
