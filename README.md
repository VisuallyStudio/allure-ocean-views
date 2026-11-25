# Allure Ocean Views

Static site. Case study by Make It Visually: renders, film, brand, brochure and website.

No build step: Vercel serves the folder as it is (`index.html`, `img/`, `video/`, `fonts/`).
Site version: V5.8 (24 Nov 2026).

## Contact form (SMTP)

The enquiry form posts to `/api/contact` (`api/contact.js`, a Vercel Node function using nodemailer). Each valid submission sends:

1. a notification to `MAIL_TO` (reply-to is the visitor), and
2. a confirmation to the visitor with `brochure/allure-ocean-views-brochure.pdf` attached (reply-to is `MAIL_TO`), unless `SEND_BROCHURE=false`.

If the notification fails, the form falls back to opening the visitor's email app (mailto). A failed visitor confirmation is only logged. The PDF is bundled into the function by `functions.includeFiles` in `vercel.json`.

Set these in Vercel > Project > Settings > Environment Variables (see `.env.example`):

| Variable | Default | Notes |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `465` | TLS is used when the port is 465 |
| `SMTP_USER` | (required) | Account that logs in to SMTP |
| `SMTP_PASS` | (required) | Google App Password for that account |
| `MAIL_FROM` | `SMTP_USER` | Can be `Name <address>` |
| `MAIL_TO` | `mail@makeitvisually.com` | Where enquiries arrive |
| `SEND_BROCHURE` | `true` | `false` disables the visitor email |

Without `SMTP_USER` / `SMTP_PASS` the function answers 500 `not_configured` and the form falls back to mailto.

Currently the sender is visually.studio@gmail.com. To send from mail@makeitvisually.com instead, create a Google Workspace App Password for that account, set `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` to it in Vercel, and redeploy. No code change is needed.
