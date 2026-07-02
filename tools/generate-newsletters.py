# -*- coding: utf-8 -*-
"""Generate the first 5 LeoNes newsletters as email-safe HTML (PT + EN)
into content-library/newsletters/. Images reference the live site paths —
swap BASE_URL when the domain is live."""
import io
from pathlib import Path

OUT = Path(__file__).parent.parent / "content-library" / "newsletters"
OUT.mkdir(parents=True, exist_ok=True)

BASE_URL = "https://leones.co"  # TODO: confirm final domain before sending

def shell(title, preheader, hero_img, body_html, cta_text, cta_url, lang):
    unsub = "Cancelar subscrição" if lang == "pt" else "Unsubscribe"
    footer_note = (
        "Recebes este email porque te juntaste às Cartinhas LeoNes (com o OK dos pais). "
        "Detalhes de produto e conformidade serão confirmados antes do lançamento público."
        if lang == "pt" else
        "You're receiving this because you joined LeoNes Little Letters (with a parent's OK). "
        "Product and compliance details will be confirmed before public launch."
    )
    return f"""<!DOCTYPE html>
<html lang="{ 'pt-PT' if lang=='pt' else 'en' }">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f3;">
<span style="display:none;max-height:0;overflow:hidden;">{preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f3;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;">
    <tr><td align="center" style="background:linear-gradient(180deg,#c9e4f5,#fbd3de);padding:28px 24px 8px;">
      <img src="{BASE_URL}/brand/leones-lockup.png" alt="LeoNes" width="180" style="display:block;border:0;">
    </td></tr>
    <tr><td align="center" style="background:linear-gradient(180deg,#fbd3de,#ffffff);padding:8px 24px 0;">
      <img src="{BASE_URL}{hero_img}" alt="" width="552" style="display:block;border:0;border-radius:18px;max-width:100%;">
    </td></tr>
    <tr><td style="padding:28px 32px 8px;font-family:Georgia,serif;color:#3a2e3d;">
      <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;">{title}</h1>
      {body_html}
    </td></tr>
    <tr><td align="center" style="padding:8px 32px 32px;">
      <a href="{BASE_URL}{cta_url}" style="display:inline-block;background:#3a2e3d;color:#f7f5f3;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:999px;">{cta_text}</a>
    </td></tr>
    <tr><td align="center" style="background:#f7f5f3;padding:20px 32px;font-family:Arial,sans-serif;font-size:11px;color:#8a8090;line-height:1.5;">
      {footer_note}<br>
      <span translate="no">LeoNes</span> Cosmética · European Union · hello@leones.co ·
      <a href="{{{{unsubscribe_url}}}}" style="color:#8a8090;">{unsub}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>"""

P = lambda t: f'<p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#5a5060;">{t}</p>'
B = lambda t: f'<p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#5a5060;">✦ {t}</p>'

NEWSLETTERS = [
    # 01 — Welcome
    {
        "id": "01-welcome",
        "pt": {
            "title": "Bem-vinda às Cartinhas ✦",
            "pre": "O Boop escreveu-te (com ajuda).",
            "hero": "/mascots/group.webp",
            "body": P("Olá! Esta é a primeira cartinha da <strong>LeoNes</strong> — e prometemos desde já: nada de spam, nada aborrecido, e nunca truques.")
                  + P("A LeoNes é um pequeno mundo cor-de-rosa: um gloss que é uma estrela, três peluches que vivem à volta dele (um deles não consegue mesmo largá-lo), histórias, jogos e drops colecionáveis.")
                  + P("Nas próximas cartinhas vais conhecer tudo. Por agora, só uma coisa: o teu rosa existe. A sério.")
                  + P("— o Boop (ditado; o Boop não sabe escrever)"),
            "cta": "Espreitar o mundo LeoNes", "cta_url": "/world",
        },
        "en": {
            "title": "Welcome to Little Letters ✦",
            "pre": "Boop wrote you a letter (with help).",
            "hero": "/mascots/group.webp",
            "body": P("Hi! This is the very first <strong>LeoNes</strong> letter — and we promise up front: no spam, nothing boring, never tricks.")
                  + P("LeoNes is a small pink world: a gloss that's a star, three plushies who live around it (one of them truly cannot let it go), stories, games and collectible drops.")
                  + P("Over the next letters you'll meet everything. For now, just one thing: your pink exists. Really.")
                  + P("— Boop (dictated; Boop can't write)"),
            "cta": "Peek into the LeoNes world", "cta_url": "/world",
        },
    },
    # 02 — The Drop
    {
        "id": "02-the-drop",
        "pt": {
            "title": "Dez peças. Um drop. ✦",
            "pre": "A Gloss Collection 01, explicada pelo Boop.",
            "hero": "/brand/family.webp",
            "body": P("A <strong>Gloss Collection 01</strong> são dez pecinhas, cada uma com o seu momento de magia:")
                  + B("<strong>pH Gloss</strong> — sai transparente, desenhado para florescer num rosa que parece teu")
                  + B("<strong>Jelly Lip Mask</strong> — sim, abana (não confies nela)")
                  + B("<strong>Glitter Gloss</strong> — um globo de neve para os lábios")
                  + P("E mais sete para descobrires. Nota honesta dos pais para os pais: ingredientes e conformidade serão confirmados antes de qualquer venda pública — está tudo escrito no site, sem letras pequeninas escondidas.")
                  + P("Coleciona as tuas favoritas. Ou as dez. O Boop não julga. (Julga um bocadinho.)"),
            "cta": "Ver o Drop", "cta_url": "/#drop",
        },
        "en": {
            "title": "Ten pieces. One drop. ✦",
            "pre": "Gloss Collection 01, explained by Boop.",
            "hero": "/brand/family.webp",
            "body": P("<strong>Gloss Collection 01</strong> is ten little pieces, each with its own moment of magic:")
                  + B("<strong>pH Gloss</strong> — goes on clear, designed to bloom into a pink that feels like yours")
                  + B("<strong>Jelly Lip Mask</strong> — yes, it wobbles (do not trust it)")
                  + B("<strong>Glitter Gloss</strong> — a snow globe for your lips")
                  + P("Plus seven more to discover. Honest note for parents: ingredients and compliance will be confirmed before any public sale — it's all written on the site, no hidden fine print.")
                  + P("Collect your favorites. Or all ten. Boop doesn't judge. (Boop judges a little.)"),
            "cta": "See the Drop", "cta_url": "/#drop",
        },
    },
    # 03 — Meet the plushies
    {
        "id": "03-meet-the-plushies",
        "pt": {
            "title": "Boop, Cloudie e Jelly ✦",
            "pre": "Um é dramático, uma dorme, uma brilha.",
            "hero": "/mascots/group.webp",
            "body": P("Está na hora das apresentações oficiais:")
                  + B("<strong>Boop</strong> — persegue o gloss desde sempre. Dramático, rápido, obcecado, engraçado. Nunca o apanha. Nunca desiste.")
                  + B("<strong>Cloudie</strong> — energia de tampa-nuvem. Já adormeceu a meio desta frase.")
                  + B("<strong>Jelly</strong> — guardiã do mood brilhante. Caótica no bom sentido. Na maior parte do tempo.")
                  + P("São personagens fictícias do universo LeoNes — e sim, versões em peluche a sério são um drop planeado. Há uma lista de espera no site para quem quiser ser a primeira.")
                  + P("PS: no site podes dar boops no Boop. Ele adora. Conta-os todos."),
            "cta": "Conhecer o mundo plushie", "cta_url": "/#plushies",
        },
        "en": {
            "title": "Boop, Cloudie and Jelly ✦",
            "pre": "One's dramatic, one sleeps, one sparkles.",
            "hero": "/mascots/group.webp",
            "body": P("Time for official introductions:")
                  + B("<strong>Boop</strong> — has been chasing the gloss forever. Dramatic, fast, obsessed, funny. Never catches it. Never gives up.")
                  + B("<strong>Cloudie</strong> — cloud-cap energy. Fell asleep halfway through this sentence.")
                  + B("<strong>Jelly</strong> — keeper of the sparkle mood. Chaotic in the good way. Mostly.")
                  + P("They're fictional characters from the LeoNes universe — and yes, real plush versions are a planned drop. There's a waitlist on the site for whoever wants to be first.")
                  + P("PS: on the site you can boop the Boop. He loves it. He counts every one."),
            "cta": "Meet the plushie world", "cta_url": "/#plushies",
        },
    },
    # 04 — Bloop Book Club
    {
        "id": "04-bloop-book-club",
        "pt": {
            "title": "Lê 1 livro. Desbloqueia 1 surpresa. ✦",
            "pre": "O Bloop Book Club abriu.",
            "hero": "/bookclub/chase-1.webp",
            "body": P("Novidade grande: o <strong>Bloop Book Club</strong>. ('Bloop' é o som que o Boop faz quando adormece em cima de um livro. Acontece muito.)")
                  + P("Cinco histórias curtas e ilustradas do Boop, cada uma com um mini-quiz no fim. Lês, respondes, um adulto confirma — e desbloqueias um crachá, um certificado de leitura para imprimir, e a surpresa que estiver ativa.")
                  + P("Pergunta sincera: leste mesmo? O Boop é capaz de perguntar aos teus pais 😄")
                  + P("Sem promessas falsas: quando não há surpresa ativa, dizemo-lo com todas as letras. O crachá e o certificado são sempre teus."),
            "cta": "Abrir o Book Club", "cta_url": "/bloop-books",
        },
        "en": {
            "title": "Read 1 book. Unlock 1 surprise. ✦",
            "pre": "The Bloop Book Club is open.",
            "hero": "/bookclub/chase-1.webp",
            "body": P("Big news: the <strong>Bloop Book Club</strong>. ('Bloop' is the sound Boop makes when it falls asleep on a book. It happens a lot.)")
                  + P("Five short illustrated Boop stories, each with a tiny quiz at the end. You read, you answer, a parent confirms — and you unlock a badge, a printable reading certificate, and whatever surprise is active.")
                  + P("Sincere question: did you really read it? Boop may ask your parents 😄")
                  + P("No fake promises: when no surprise is active, we say so in plain words. The badge and certificate are always yours."),
            "cta": "Open the Book Club", "cta_url": "/bloop-books",
        },
    },
    # 05 — Behind the scenes / honesty
    {
        "id": "05-behind-the-scenes",
        "pt": {
            "title": "Os bastidores (a parte honesta) ✦",
            "pre": "O que já existe, o que ainda falta.",
            "hero": "/brand/unboxing.webp",
            "body": P("Cartinha diferente: hoje é sobre o que se passa nos bastidores da LeoNes.")
                  + B("<strong>Já existe:</strong> o mundo, os peluches, as histórias, a loja a funcionar, e uma equipa obcecada com embalagens fofas.")
                  + B("<strong>Ainda falta (e dizemo-lo sem vergonha):</strong> confirmar fórmulas e ingredientes com o fabricante, a papelada de conformidade da UE, e a data do primeiro envio real.")
                  + P("Porquê contar isto? Porque vais confiar em nós com coisas que vão na tua pele — e confiança começa antes da primeira venda, não depois.")
                  + P("Enquanto isso: o Boop continua a perseguir o gloss. Alguém devia dizer-lhe que ele mora cá em casa."),
            "cta": "Ver as novidades", "cta_url": "/",
        },
        "en": {
            "title": "Behind the scenes (the honest part) ✦",
            "pre": "What exists, what's still missing.",
            "hero": "/brand/unboxing.webp",
            "body": P("A different kind of letter: today is about what's happening behind LeoNes.")
                  + B("<strong>Already real:</strong> the world, the plushies, the stories, a working shop, and a team obsessed with cute packaging.")
                  + B("<strong>Still missing (and we say it without shame):</strong> confirming formulas and ingredients with the manufacturer, EU compliance paperwork, and the date of the first real shipment.")
                  + P("Why tell you this? Because you'll be trusting us with things that go on your skin — and trust starts before the first sale, not after.")
                  + P("Meanwhile: Boop is still chasing the gloss. Someone should tell him it lives at his house."),
            "cta": "See what's new", "cta_url": "/",
        },
    },
]

for n in NEWSLETTERS:
    for lang in ("pt", "en"):
        d = n[lang]
        html = shell(d["title"], d["pre"], d["hero"], d["body"], d["cta"], d["cta_url"], lang)
        f = OUT / f"{n['id']}.{lang}.html"
        io.open(f, "w", encoding="utf-8").write(html)
        print(f.name)

readme = """# LeoNes Newsletters

First 5 issues, PT + EN, email-safe HTML (tables + inline styles).

Sending checklist (before the first real send):
1. Replace BASE_URL images with the live domain (currently https://leones.co).
2. Wire {{unsubscribe_url}} to your ESP's unsubscribe merge tag.
3. Double opt-in confirmation flow (GDPR) — the site already promises it.
4. Sender domain SPF/DKIM/DMARC.
5. Subscribers export: SELECT email, lang, interest FROM newsletter; (server/leones.db)
   - interest='plush' subscribers should also get plush-drop announcements.

Suggested cadence: 01 immediately on signup (welcome automation), then one per week.
"""
io.open(OUT / "README.md", "w", encoding="utf-8").write(readme)
print("README.md")
