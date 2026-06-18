import nodemailer from "nodemailer";
import { env } from "../env";

function getTransporter() {
  if (!env.ADMIN_EMAIL || !env.GMAIL_APP_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.ADMIN_EMAIL, pass: env.GMAIL_APP_PASS },
  });
}

const baseStyle = `font-family:Arial,sans-serif;color:#222;`;
const accentColor = `#eaa320`;
const PHYSICAL_ADDRESS = `Skywaves Educare, Sangrur, Punjab, India`;
const MAILER_HEADERS = {
  "X-Mailer": "Skywaves-Mailer/1.0",
  "List-Unsubscribe": "<mailto:skywaveseducare@gmail.com?subject=unsubscribe>",
};

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="${baseStyle}max-width:600px;margin:0 auto;padding:24px;">
<div style="border-top:4px solid ${accentColor};padding-top:16px;margin-bottom:24px;">
  <h2 style="margin:0;color:${accentColor};">${title}</h2>
  <p style="margin:4px 0 0;color:#666;font-size:13px;">Skywaves Educare — Notification</p>
</div>
${body}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p style="color:#999;font-size:11px;">This is an automated notification from skywaveseducare.com<br>${PHYSICAL_ADDRESS}</p>
</body></html>`;
}

function row(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;color:#555;font-weight:600;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#222;">${value}</td></tr>`;
}

export async function sendEnquiryEmail(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  course?: string | null;
  message?: string | null;
  source: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const label = data.source === "contact" ? "Contact" : "Enquiry";
  const body = `<p>A new <strong>${label}</strong> form was submitted.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
${row("Name", data.name)}
${row("Email", data.email)}
${row("Phone", data.phone)}
${row("Course", data.course)}
${row("Message", data.message)}
</table>`;

  const text = `New ${label} from ${data.name}\nEmail: ${data.email ?? "-"}\nPhone: ${data.phone ?? "-"}\nCourse: ${data.course ?? "-"}\nMessage: ${data.message ?? "-"}`;
  await transporter.sendMail({
    from: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    replyTo: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    to: env.ADMIN_EMAIL,
    subject: `New ${label} from ${data.name}`,
    text,
    html: wrapHtml(`New ${label} Submission`, body),
    headers: MAILER_HEADERS,
  });
}

export async function sendUserConfirmationEmail(to: string, name: string) {
  const transporter = getTransporter();
  if (!transporter || !to) return;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#151b23 0%,#1e2a38 70%,#0f2744 100%);padding:40px 48px 32px;">
    <p style="margin:0 0 4px;color:#eaa320;font-size:22px;font-weight:900;letter-spacing:-0.5px;">✦ Skywaves Educare</p>
    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Shaping Futures Through Education</p>
  </td></tr>
  <!-- Gold bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#eaa320 0%,#f5c842 50%,#eaa320 100%);"></td></tr>
  <!-- Body -->
  <tr><td style="padding:44px 48px 32px;">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#151b23;line-height:1.2;">We've got your message, ${name}!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#5a6475;line-height:1.75;">
      Thank you for reaching out to Skywaves Educare. Our education team has received your enquiry and will be in touch with you within <strong style="color:#151b23;">24–48 hours</strong> to guide you through your next step.
    </p>
    <!-- What to expect -->
    <div style="background:#fafbfc;border-radius:12px;padding:28px;margin-bottom:28px;">
      <p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;">What Happens Next</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td width="44" valign="top" style="padding-bottom:16px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#fff8e8;border:2px solid #eaa320;text-align:center;line-height:32px;font-size:15px;font-weight:900;color:#eaa320;">1</div>
        </td><td valign="top" style="padding-bottom:16px;padding-left:4px;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#151b23;">Review &amp; Match</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.55;">Our counsellors review your enquiry and identify the ideal programme for your goals.</p>
        </td></tr>
        <tr><td width="44" valign="top" style="padding-bottom:16px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#fff8e8;border:2px solid #eaa320;text-align:center;line-height:32px;font-size:15px;font-weight:900;color:#eaa320;">2</div>
        </td><td valign="top" style="padding-bottom:16px;padding-left:4px;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#151b23;">Personal Consultation</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.55;">We'll reach out with programme details, fees, and schedule information tailored for you.</p>
        </td></tr>
        <tr><td width="44" valign="top">
          <div style="width:36px;height:36px;border-radius:50%;background:#fff8e8;border:2px solid #eaa320;text-align:center;line-height:32px;font-size:15px;font-weight:900;color:#eaa320;">3</div>
        </td><td valign="top" style="padding-left:4px;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#151b23;">Begin Your Journey</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.55;">Enroll, learn, and unlock new career opportunities with our expert instructors.</p>
        </td></tr>
      </table>
    </div>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">
      While you wait, explore our full range of programmes — from English communication and Computer Applications to Fashion Design and Clinical Hypnotherapy.
    </p>
    <!-- CTA -->
    <a href="https://skywaveseducare.com/courses" style="display:inline-block;background:#eaa320;color:#151b23;font-weight:800;font-size:14px;padding:15px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">Explore Our Courses →</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#151b23;padding:24px 48px;">
    <p style="margin:0 0 4px;color:#eaa320;font-size:13px;font-weight:700;">Skywaves Educare</p>
    <p style="margin:0;color:rgba(255,255,255,0.38);font-size:11px;line-height:1.7;">
      This is an automated confirmation. Please do not reply to this email.<br/>© Skywaves Educare. All rights reserved.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;

  const text = `Dear ${name},\n\nThank you for contacting Skywaves Educare. We have received your enquiry and will get back to you within 24-48 hours.\n\nVisit us at: https://skywaveseducare.com\n\n${PHYSICAL_ADDRESS}`;
  await transporter.sendMail({
    from: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    replyTo: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    to,
    subject: `Your enquiry has been received — Skywaves Educare`,
    text,
    html,
    headers: MAILER_HEADERS,
  });
}

export async function sendFeedbackEmail(data: {
  name: string;
  profession?: string | null;
  review: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const body = `<p>A new feedback review was submitted and is waiting for your approval.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
${row("Name", data.name)}
${row("Profession", data.profession)}
</table>
<div style="margin-top:16px;padding:16px;background:#fafafa;border-left:4px solid ${accentColor};border-radius:4px;">
  <p style="margin:0;font-style:italic;color:#444;">"${data.review}"</p>
</div>`;

  const text = `New Feedback from ${data.name} (${data.profession ?? ""})\n\n"${data.review}"`;
  await transporter.sendMail({
    from: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    replyTo: `"Skywaves Educare" <${env.ADMIN_EMAIL}>`,
    to: env.ADMIN_EMAIL,
    subject: `New Review Submitted — Skywaves Educare`,
    text,
    html: wrapHtml("New Feedback Submitted", body),
    headers: MAILER_HEADERS,
  });
}
