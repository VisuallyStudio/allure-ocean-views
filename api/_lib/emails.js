// Email templates for the contact form: one for the studio (admin), one for the visitor.
// Email-client safe: table layout, inline styles, no web fonts, no SVG, absolute image URLs.
// Files under api/_lib are not deployed as functions (leading underscore).
'use strict';

var C = {
  abyss: '#013A40',
  sage: '#5A7367',
  gold: '#BFBA9F',
  goldDeep: '#A6A28D',
  sand: '#efe8d8',
  paper: '#f6f1e6',
  white: '#ffffff',
  muted: '#6b7f78',
  line: '#e3dccb'
};
var SERIF = "Georgia, 'Times New Roman', serif";
var SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

var MODE_LABEL = {
  contact: 'Project enquiry',
  learn: 'New project (case study)',
  talk: 'New project (Make It Visually)',
  brochure: 'Brochure request'
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function nl2br(s) {
  return esc(s).replace(/\r?\n/g, '<br>');
}

function siteUrl(env) {
  var u = (env && env.SITE_URL) || 'https://allure-oceanviews.com';
  return u.replace(/\/+$/, '');
}

function lisbonTime(d) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Lisbon', dateStyle: 'medium', timeStyle: 'short'
    }).format(d) + ' (Lisbon)';
  } catch (e) {
    return d.toISOString();
  }
}

// one solid button that works in Outlook too (bulletproof enough without VML)
function button(href, label, bg, fg) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate">'
    + '<tr><td align="center" bgcolor="' + bg + '" style="border-radius:999px;background:' + bg + '">'
    + '<a href="' + esc(href) + '" target="_blank" style="display:inline-block;padding:14px 30px;font-family:' + SANS
    + ';font-size:12px;letter-spacing:3px;text-transform:uppercase;color:' + fg + ';text-decoration:none;border-radius:999px">'
    + esc(label) + '</a></td></tr></table>';
}

function shell(opts) {
  // opts: title, preheader, body (html), footer (html), bg
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">'
    + '<title>' + esc(opts.title) + '</title></head>'
    + '<body style="margin:0;padding:0;background:' + opts.bg + ';-webkit-text-size-adjust:100%">'
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(opts.preheader) + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + opts.bg + '" style="background:' + opts.bg + '">'
    + '<tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse">'
    + opts.body
    + '<tr><td style="padding:28px 8px 0;font-family:' + SANS + ';font-size:11px;line-height:18px;color:' + C.muted + ';text-align:center">'
    + opts.footer + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

function wordmark(color) {
  return '<div style="font-family:' + SERIF + ';font-size:26px;letter-spacing:9px;color:' + color + ';line-height:1">ALLURE</div>'
    + '<div style="font-family:' + SANS + ';font-size:10px;letter-spacing:6px;color:' + color + ';opacity:.8;margin-top:8px">OCEAN VIEWS</div>';
}

/* ---------------- visitor ---------------- */

function visitor(d, env) {
  var site = siteUrl(env);
  var bro = d.mode === 'brochure';
  var subject = bro ? 'Your Allure Ocean Views brochure' : 'We have received your enquiry — Make It Visually';
  var lead = bro
    ? 'Thank you for your interest in Allure Ocean Views. The brochure is attached to this email as a PDF, and the interactive version is one click away.'
    : 'Thank you for writing to us. We have received your enquiry and will come back to you shortly with references, scope and timings.';
  var second = bro
    ? 'Thirty-two pages on the island, the residences and the club, made by Make It Visually: renders, film, brand, brochure and website.'
    : 'In the meantime, the Allure Ocean Views brochure is attached as a PDF. It shows what we produce for a development before it is built: renders, film, brand, brochure and website.';

  var body = ''
    // header band
    + '<tr><td align="center" bgcolor="' + C.abyss + '" style="background:' + C.abyss + ';padding:40px 24px 34px">'
    + wordmark(C.gold) + '</td></tr>'
    // hero image
    + '<tr><td style="padding:0;line-height:0;font-size:0">'
    + '<img src="' + site + '/img/og.jpg" width="600" alt="Aerial render of the Allure island, its reef and the ring of ocean homes" '
    + 'style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>'
    // content
    + '<tr><td bgcolor="' + C.white + '" style="background:' + C.white + ';padding:44px 44px 40px">'
    + '<p style="margin:0 0 6px;font-family:' + SANS + ';font-size:11px;letter-spacing:4px;text-transform:uppercase;color:' + C.sage + '">'
    + (bro ? 'The brochure' : 'Enquiry received') + '</p>'
    + '<h1 style="margin:0 0 22px;font-family:' + SERIF + ';font-weight:400;font-size:30px;line-height:38px;color:' + C.abyss + '">'
    + 'Hello ' + esc(d.name) + ',</h1>'
    + '<p style="margin:0 0 16px;font-family:' + SANS + ';font-size:15px;line-height:25px;color:#33504b">' + esc(lead) + '</p>'
    + '<p style="margin:0 0 30px;font-family:' + SANS + ';font-size:15px;line-height:25px;color:#33504b">' + esc(second) + '</p>'
    + button(site + '/brochure/', 'Open the interactive brochure', C.abyss, C.paper)
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px">'
    + '<tr><td style="border-top:1px solid ' + C.line + ';padding-top:22px;font-family:' + SANS + ';font-size:13px;line-height:21px;color:' + C.muted + '">'
    + '<strong style="color:' + C.abyss + ';font-weight:600">Attached:</strong> allure-ocean-views-brochure.pdf<br>'
    + 'Questions? Simply reply to this email.</td></tr></table>'
    + '</td></tr>'
    // studio band
    + '<tr><td bgcolor="' + C.sand + '" style="background:' + C.sand + ';padding:30px 44px">'
    + '<p style="margin:0 0 6px;font-family:' + SERIF + ';font-size:19px;line-height:26px;color:' + C.abyss + '">Imagery, film, brand and web by Make It Visually</p>'
    + '<p style="margin:0 0 18px;font-family:' + SANS + ';font-size:13px;line-height:21px;color:#33504b">'
    + 'An architectural visualization and real estate branding studio in Portugal, working with developers and hospitality groups.</p>'
    + button('https://makeitvisually.com', 'Visit makeitvisually.com', C.gold, C.abyss)
    + '</td></tr>';

  var footer = 'Make It Visually · Portugal · '
    + '<a href="mailto:mail@makeitvisually.com" style="color:' + C.sage + ';text-decoration:none">mail@makeitvisually.com</a><br>'
    + 'Allure Ocean Views is a concept project created by Make It Visually as a case study. No property is for sale.<br>'
    + 'You received this email because you used the form at '
    + '<a href="' + site + '/" style="color:' + C.sage + ';text-decoration:none">' + esc(site.replace(/^https?:\/\//, '')) + '</a>.';

  var text = 'Hello ' + d.name + ',\n\n' + lead + '\n\n' + second
    + '\n\nInteractive brochure: ' + site + '/brochure/'
    + '\nAttached: allure-ocean-views-brochure.pdf'
    + '\n\nQuestions? Simply reply to this email.'
    + '\n\nBest regards,\nMake It Visually\nmail@makeitvisually.com\nhttps://makeitvisually.com'
    + '\n\n--\nAllure Ocean Views is a concept project created by Make It Visually as a case study. No property is for sale.\n';

  return {
    subject: subject,
    html: shell({ title: subject, preheader: bro ? 'The brochure is attached as a PDF.' : 'We will reply shortly. The brochure is attached.', body: body, footer: footer, bg: C.paper }),
    text: text
  };
}

/* ---------------- admin ---------------- */

function row(label, valueHtml) {
  return '<tr>'
    + '<td valign="top" style="padding:12px 0;border-bottom:1px solid ' + C.line + ';width:120px;font-family:' + SANS
    + ';font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + C.muted + '">' + esc(label) + '</td>'
    + '<td valign="top" style="padding:12px 0;border-bottom:1px solid ' + C.line + ';font-family:' + SANS
    + ';font-size:15px;line-height:22px;color:' + C.abyss + '">' + valueHtml + '</td></tr>';
}

function admin(d, subject, env) {
  var site = siteUrl(env);
  var when = lisbonTime(d.date || new Date());
  var label = MODE_LABEL[d.mode] || MODE_LABEL.contact;
  var bro = d.mode === 'brochure';
  var replySubject = 'Re: ' + subject;

  var body = ''
    + '<tr><td bgcolor="' + C.abyss + '" style="background:' + C.abyss + ';padding:26px 36px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td style="font-family:' + SERIF + ';font-size:18px;letter-spacing:6px;color:' + C.gold + '">ALLURE</td>'
    + '<td align="right" style="font-family:' + SANS + ';font-size:11px;letter-spacing:3px;text-transform:uppercase;color:' + C.gold + '">'
    + esc(label) + '</td></tr></table></td></tr>'
    + '<tr><td bgcolor="' + C.white + '" style="background:' + C.white + ';padding:34px 36px 36px">'
    + '<h1 style="margin:0 0 4px;font-family:' + SERIF + ';font-weight:400;font-size:26px;line-height:32px;color:' + C.abyss + '">'
    + esc(d.name) + (d.company ? ' <span style="color:' + C.sage + '">· ' + esc(d.company) + '</span>' : '') + '</h1>'
    + '<p style="margin:0 0 24px;font-family:' + SANS + ';font-size:13px;color:' + C.muted + '">' + esc(when) + '</p>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ' + C.line + '">'
    + row('Name', esc(d.name))
    + row('Email', '<a href="mailto:' + esc(d.email) + '" style="color:' + C.abyss + '">' + esc(d.email) + '</a>')
    + row('Company', d.company ? esc(d.company) : '<span style="color:' + C.muted + '">—</span>')
    + row('Request', esc(label))
    + '</table>'
    + (bro
      ? '<p style="margin:24px 0 0;font-family:' + SANS + ';font-size:14px;line-height:22px;color:#33504b">The visitor asked for the brochure.'
        + (d.brochureSent === false ? ' <strong>The automatic email with the PDF was not sent.</strong>' : ' The PDF was sent to them automatically.') + '</p>'
      : '<p style="margin:26px 0 8px;font-family:' + SANS + ';font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + C.muted + '">Project</p>'
        + '<div style="padding:18px 20px;background:' + C.paper + ';border-left:3px solid ' + C.gold + ';font-family:' + SANS
        + ';font-size:15px;line-height:24px;color:' + C.abyss + '">' + nl2br(d.message) + '</div>')
    + '<div style="height:28px;line-height:28px">&nbsp;</div>'
    + button('mailto:' + d.email + '?subject=' + encodeURIComponent(replySubject), 'Reply to ' + d.name.split(' ')[0], C.abyss, C.paper)
    + '</td></tr>';

  var footer = 'Sent from the form at <a href="' + site + '/" style="color:' + C.sage + ';text-decoration:none">'
    + esc(site.replace(/^https?:\/\//, '')) + '</a>. Reply to this email to answer ' + esc(d.name) + ' directly.';

  var text = label + '\n' + when + '\n\n'
    + 'Name: ' + d.name + '\nEmail: ' + d.email + '\nCompany: ' + (d.company || '—')
    + (bro ? '\n\nRequested: the Allure Ocean Views brochure' : '\n\nProject:\n' + d.message)
    + '\n\n— sent from ' + site + '/\n';

  return {
    subject: subject,
    html: shell({ title: subject, preheader: label + ' from ' + d.name + (d.company ? ', ' + d.company : ''), body: body, footer: footer, bg: '#eef0ed' }),
    text: text
  };
}

/* ---------------- Make It Visually ("talk" mode) ----------------
   The "Let's talk" form speaks as the studio, in its own identity
   (dark #1c1c1c panel, #ffb951 accent, Dinamit/Syne on the site; email-safe fallbacks here).
   No brochure is attached to these. */

var M = {
  black: '#0e0e0e',
  page: '#1c1c1c',
  card: '#232323',
  line: '#2e2e2e',
  ink: '#ffffff',
  soft: '#bdbdbd',
  muted: '#888888',
  gold: '#ffb951'
};
var MSANS = "'Syne', 'Helvetica Neue', Helvetica, Arial, sans-serif";

function mivButton(href, label) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate">'
    + '<tr><td align="center" bgcolor="' + M.gold + '" style="border-radius:999px;background:' + M.gold + '">'
    + '<a href="' + esc(href) + '" target="_blank" style="display:inline-block;padding:14px 28px;font-family:' + MSANS
    + ';font-size:14px;font-weight:600;line-height:18px;color:' + M.black + ';text-decoration:none;border-radius:999px">'
    + esc(label) + '</a></td></tr></table>';
}

function mivEyebrow(t) {
  return '<p style="margin:0 0 14px;font-family:' + MSANS + ';font-size:11px;font-weight:600;letter-spacing:2px;'
    + 'text-transform:uppercase;color:' + M.gold + '">' + esc(t) + '</p>';
}

function mivHeader(tag) {
  return '<tr><td style="padding:0 4px 24px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td style="font-family:' + MSANS + ';font-size:17px;font-weight:700;line-height:20px;color:' + M.ink + '">'
    + 'Make It Visually<span style="color:' + M.gold + '">.</span></td>'
    + '<td align="right" style="font-family:' + MSANS + ';font-size:11px;font-weight:600;letter-spacing:2px;'
    + 'text-transform:uppercase;color:' + M.muted + '">' + esc(tag) + '</td></tr></table></td></tr>';
}

function mivShell(opts) {
  // opts: title, tag, preheader, body (html), footer (html)
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
    + '<title>' + esc(opts.title) + '</title></head>'
    + '<body style="margin:0;padding:0;background:' + M.black + ';-webkit-text-size-adjust:100%">'
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(opts.preheader) + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + M.black + '" style="background:' + M.black + '">'
    + '<tr><td align="center" style="padding:36px 16px">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate">'
    + mivHeader(opts.tag)
    + '<tr><td bgcolor="' + M.page + '" style="background:' + M.page + ';border:1px solid #262626;border-radius:24px;padding:44px 40px 40px">'
    + opts.body + '</td></tr>'
    + '<tr><td style="padding:26px 8px 0;font-family:' + MSANS + ';font-size:11px;line-height:18px;color:' + M.muted + ';text-align:center">'
    + opts.footer + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

function mivLabel(t) {
  return '<p style="margin:0 0 10px;font-family:' + MSANS + ';font-size:11px;font-weight:600;letter-spacing:2px;'
    + 'text-transform:uppercase;color:' + M.muted + '">' + esc(t) + '</p>';
}

function mivQuote(message) {
  return '<div style="padding:18px 20px;background:' + M.card + ';border-left:3px solid ' + M.gold + ';border-radius:4px;'
    + 'font-family:' + MSANS + ';font-size:15px;line-height:24px;color:' + M.ink + '">' + nl2br(message) + '</div>';
}

function mivVisitor(d, env) {
  var site = siteUrl(env);
  var subject = 'We have your project — Make It Visually';
  var lead = 'Thank you for telling us about your project. We have received your message and will come back to you shortly with references, scope and timings.';
  var second = 'We make what a development needs before it is built: architectural visualization, CGI film, brand identity, brochures and websites.';

  var body = mivEyebrow('Message received')
    + '<h1 style="margin:0 0 20px;font-family:' + MSANS + ';font-weight:700;font-size:32px;line-height:38px;color:' + M.ink + '">'
    + 'Hello ' + esc(d.name) + '<span style="color:' + M.gold + '">,</span></h1>'
    + '<p style="margin:0 0 14px;font-family:' + MSANS + ';font-size:15px;line-height:24px;color:' + M.soft + '">' + esc(lead) + '</p>'
    + '<p style="margin:0 0 28px;font-family:' + MSANS + ';font-size:15px;line-height:24px;color:' + M.soft + '">' + esc(second) + '</p>'
    + mivLabel('Your project')
    + mivQuote(d.message)
    + '<div style="height:32px;line-height:32px">&nbsp;</div>'
    + mivButton('https://makeitvisually.com', 'Visit makeitvisually.com')
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px">'
    + '<tr><td style="border-top:1px solid ' + M.line + ';padding-top:22px;font-family:' + MSANS + ';font-size:13px;line-height:21px;color:' + M.muted + '">'
    + 'Questions in the meantime? Simply reply to this email.<br>'
    + '<span style="color:' + M.ink + ';font-weight:600">Make It Visually</span> · '
    + '<a href="mailto:mail@makeitvisually.com" style="color:' + M.ink + ';text-decoration:none">mail@makeitvisually.com</a></td></tr></table>';

  var footer = 'Make It Visually · Architectural visualization and real estate branding · Portugal<br>'
    + 'You received this email because you used the form at '
    + '<a href="' + site + '/" style="color:' + M.soft + ';text-decoration:none">' + esc(site.replace(/^https?:\/\//, '')) + '</a>.';

  var text = 'Hello ' + d.name + ',\n\n' + lead + '\n\n' + second
    + '\n\nYour project:\n' + d.message
    + '\n\nQuestions in the meantime? Simply reply to this email.'
    + '\n\nBest regards,\nMake It Visually\nmail@makeitvisually.com\nhttps://makeitvisually.com\n';

  return {
    subject: subject,
    html: mivShell({ title: subject, tag: 'New project', preheader: 'We will reply shortly with references, scope and timings.', body: body, footer: footer }),
    text: text
  };
}

function mivRow(label, valueHtml) {
  return '<tr>'
    + '<td valign="top" style="padding:12px 0;border-bottom:1px solid ' + M.line + ';width:110px;font-family:' + MSANS
    + ';font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:' + M.muted + '">' + esc(label) + '</td>'
    + '<td valign="top" style="padding:12px 0;border-bottom:1px solid ' + M.line + ';font-family:' + MSANS
    + ';font-size:15px;line-height:22px;color:' + M.ink + '">' + valueHtml + '</td></tr>';
}

function mivAdmin(d, subject, env) {
  var site = siteUrl(env);
  var host = esc(site.replace(/^https?:\/\//, ''));
  var when = lisbonTime(d.date || new Date());
  var replySubject = 'Re: ' + subject;

  var body = mivEyebrow("Let's talk · New project")
    + '<h1 style="margin:0 0 4px;font-family:' + MSANS + ';font-weight:700;font-size:28px;line-height:34px;color:' + M.ink + '">'
    + esc(d.name) + (d.company ? ' <span style="color:' + M.gold + '">· ' + esc(d.company) + '</span>' : '') + '</h1>'
    + '<p style="margin:0 0 26px;font-family:' + MSANS + ';font-size:13px;color:' + M.muted + '">' + esc(when) + '</p>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ' + M.line + '">'
    + mivRow('Name', esc(d.name))
    + mivRow('Email', '<a href="mailto:' + esc(d.email) + '" style="color:' + M.gold + ';text-decoration:none">' + esc(d.email) + '</a>')
    + mivRow('Company', d.company ? esc(d.company) : '<span style="color:' + M.muted + '">—</span>')
    + mivRow('Source', host + ' · Let&#39;s talk')
    + '</table>'
    + '<div style="height:28px;line-height:28px">&nbsp;</div>'
    + mivLabel('Project')
    + mivQuote(d.message)
    + '<div style="height:30px;line-height:30px">&nbsp;</div>'
    + mivButton('mailto:' + d.email + '?subject=' + encodeURIComponent(replySubject), 'Reply to ' + d.name.split(' ')[0]);

  var footer = 'Sent from the &quot;Let&#39;s talk&quot; form at <a href="' + site + '/" style="color:' + M.soft + ';text-decoration:none">'
    + host + '</a>. Reply to this email to answer ' + esc(d.name) + ' directly. No brochure was sent.';

  var text = "Let's talk — new project\n" + when + '\n\n'
    + 'Name: ' + d.name + '\nEmail: ' + d.email + '\nCompany: ' + (d.company || '—')
    + '\n\nProject:\n' + d.message
    + "\n\n— sent from the Let's talk form at " + site + '/ (no brochure sent)\n';

  return {
    subject: subject,
    html: mivShell({ title: subject, tag: 'Enquiry', preheader: 'New project from ' + d.name + (d.company ? ', ' + d.company : ''), body: body, footer: footer }),
    text: text
  };
}

/* ---------------- entry points ---------------- */

// modes that speak as Make It Visually and carry no brochure
var MIV_MODES = { talk: true };

function isMiv(mode) { return MIV_MODES[mode] === true; }

function visitorFor(d, env) { return isMiv(d.mode) ? mivVisitor(d, env) : visitor(d, env); }
function adminFor(d, subject, env) { return isMiv(d.mode) ? mivAdmin(d, subject, env) : admin(d, subject, env); }

module.exports = { visitor: visitorFor, admin: adminFor, isMiv: isMiv, MODE_LABEL: MODE_LABEL };
