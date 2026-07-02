# LeoNes Newsletters

First 5 issues, PT + EN, email-safe HTML (tables + inline styles).

Sending checklist (before the first real send):
1. Replace BASE_URL images with the live domain (currently https://leones.co).
2. Wire {{unsubscribe_url}} to your ESP's unsubscribe merge tag.
3. Double opt-in confirmation flow (GDPR) — the site already promises it.
4. Sender domain SPF/DKIM/DMARC.
5. Subscribers export: SELECT email, lang, interest FROM newsletter; (server/leones.db)
   - interest='plush' subscribers should also get plush-drop announcements.

Suggested cadence: 01 immediately on signup (welcome automation), then one per week.
