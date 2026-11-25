// Contact form endpoint: POST /api/contact
// Sends the enquiry from the modal form by SMTP (nodemailer).
// Configuration comes from environment variables only; see .env.example and README.md.
'use strict';

var path = require('path');
var nodemailer = require('nodemailer');

// bundled with the function through "includeFiles" in vercel.json
var BROCHURE_PDF = path.join(process.cwd(), 'brochure', 'allure-ocean-views-brochure.pdf');

// Same subjects as COPY in index.html; chosen server-side so the client cannot set them.
var SUBJECTS = {
  contact: 'Project enquiry — a solution like Allure Ocean Views',
  learn: 'New project — via the Allure Ocean Views case study',
  talk: 'New project — via the Allure Ocean Views case study',
  brochure: 'Brochure request — Allure Ocean Views'
};

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v, max) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

// values that end up in mail headers must not carry line breaks
function oneLine(v) {
  return v.replace(/[\r\n]+/g, ' ').trim();
}

function confirmationText(name, mode) {
  var first = mode === 'brochure'
    ? 'Thank you for your interest in Allure Ocean Views. The brochure is attached to this email as a PDF.'
    : 'Thank you for your enquiry. We have received it and will reply shortly with references, scope and timings.\n\nIn the meantime, the Allure Ocean Views brochure is attached to this email as a PDF.';
  return 'Hello ' + name + ',\n\n' + first
    + '\n\nIf you have any questions, simply reply to this email.'
    + '\n\nBest regards,\nMake It Visually\nmail@makeitvisually.com\nhttps://makeitvisually.com\n';
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  var b = req.body;
  if (b && typeof b === 'object' && !Buffer.isBuffer(b)) return b;
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') {
    try { return JSON.parse(b) || {}; } catch (e) { return null; }
  }
  return {};
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  var body = readBody(req);
  if (!body || typeof body !== 'object') return send(res, 400, { ok: false, error: 'bad_request' });

  // honeypot: real visitors never fill this in; pretend success and send nothing
  if (typeof body.website === 'string' ? body.website.trim() : body.website) {
    return send(res, 200, { ok: true });
  }

  var mode = Object.prototype.hasOwnProperty.call(SUBJECTS, body.mode) ? body.mode : 'contact';
  var name = oneLine(str(body.name, 200));
  var email = oneLine(str(body.email, 254));
  var company = oneLine(str(body.company, 200));
  var message = str(body.message, 5000);

  var fields = [];
  if (!name) fields.push('name');
  if (!email || !EMAIL_RE.test(email)) fields.push('email');
  if (mode !== 'brochure' && !message) fields.push('message');
  if (fields.length) return send(res, 400, { ok: false, error: 'invalid', fields: fields });

  var env = process.env;
  var user = env.SMTP_USER;
  var pass = env.SMTP_PASS;
  if (!user || !pass) {
    console.error('[contact] SMTP_USER / SMTP_PASS not set');
    return send(res, 500, { ok: false, error: 'not_configured' });
  }
  var port = parseInt(env.SMTP_PORT, 10) || 465;

  var text = 'Name: ' + name + '\nEmail: ' + email
    + '\nCompany: ' + (company || '—')
    + (mode === 'brochure' ? '\n\nRequested: the Allure Ocean Views brochure' : '\n\nProject:\n' + message)
    + '\n\n— sent from the Allure Ocean Views showcase';

  var from = env.MAIL_FROM || user;
  var to = env.MAIL_TO || 'mail@makeitvisually.com';
  var transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass }
  });

  // 1. notification to the studio; this one decides success
  try {
    await transporter.sendMail({
      from: from,
      to: to,
      replyTo: { name: name, address: email },
      subject: SUBJECTS[mode],
      text: text
    });
  } catch (err) {
    console.error('[contact] send failed:', err && err.message ? err.message : err);
    return send(res, 502, { ok: false });
  }

  // 2. confirmation to the visitor with the brochure attached; a failure here is logged only
  if (String(env.SEND_BROCHURE || 'true').trim().toLowerCase() !== 'false') {
    try {
      await transporter.sendMail({
        from: from,
        to: { name: name, address: email },
        replyTo: to,
        subject: 'Your Allure Ocean Views brochure',
        text: confirmationText(name, mode),
        attachments: [{
          filename: 'allure-ocean-views-brochure.pdf',
          path: BROCHURE_PDF,
          contentType: 'application/pdf'
        }]
      });
    } catch (err) {
      console.error('[contact] visitor confirmation failed:', err && err.message ? err.message : err);
    }
  }

  return send(res, 200, { ok: true });
};
