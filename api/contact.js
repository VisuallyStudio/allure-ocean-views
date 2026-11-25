// Contact form endpoint: POST /api/contact
// Sends the enquiry from the modal form by SMTP (nodemailer).
// Configuration comes from environment variables only; see .env.example and README.md.
'use strict';

var path = require('path');
var nodemailer = require('nodemailer');
var emails = require('./_lib/emails');

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

  var data = { mode: mode, name: name, email: email, company: company, message: message, date: new Date() };

  var from = env.MAIL_FROM || user;
  var to = env.MAIL_TO || 'mail@makeitvisually.com';
  var transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass }
  });

  // 1. notification to the studio; this one decides success
  var adminMail = emails.admin(data, SUBJECTS[mode], env);
  try {
    await transporter.sendMail({
      from: from,
      to: to,
      replyTo: { name: name, address: email },
      subject: adminMail.subject,
      text: adminMail.text,
      html: adminMail.html
    });
  } catch (err) {
    console.error('[contact] send failed:', err && err.message ? err.message : err);
    return send(res, 502, { ok: false });
  }

  // 2. confirmation to the visitor; a failure here is logged only.
  // "Let's talk" (Make It Visually) gets the studio's own email with no attachment;
  // the other modes get the Allure email with the brochure PDF, unless SEND_BROCHURE=false.
  var miv = emails.isMiv(mode);
  if (miv || String(env.SEND_BROCHURE || 'true').trim().toLowerCase() !== 'false') {
    var visitorMail = emails.visitor(data, env);
    // the sender's display name matches the brand in the email: a "Make It Visually" email
    // sent as "Allure Ocean Views" reads as a mismatch to spam filters
    var fromAddr = (String(from).match(/<([^>]+)>/) || [null, String(from)])[1].trim();
    var mail = {
      from: miv ? { name: 'Make It Visually', address: fromAddr } : from,
      to: { name: name, address: email },
      replyTo: to,
      subject: visitorMail.subject,
      text: visitorMail.text,
      html: visitorMail.html
    };
    if (!miv) {
      mail.attachments = [{
        filename: 'allure-ocean-views-brochure.pdf',
        path: BROCHURE_PDF,
        contentType: 'application/pdf'
      }];
    }
    try {
      await transporter.sendMail(mail);
    } catch (err) {
      console.error('[contact] visitor confirmation failed:', err && err.message ? err.message : err);
    }
  }

  return send(res, 200, { ok: true });
};
