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

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="${baseStyle}max-width:600px;margin:0 auto;padding:24px;">
<div style="border-top:4px solid ${accentColor};padding-top:16px;margin-bottom:24px;">
  <h2 style="margin:0;color:${accentColor};">${title}</h2>
  <p style="margin:4px 0 0;color:#666;font-size:13px;">Skywaves Educare — Notification</p>
</div>
${body}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p style="color:#999;font-size:11px;">This is an automated notification from skywaveseducare.com</p>
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

  await transporter.sendMail({
    from: `"${env.GMAIL_APP_NAME ?? "Skywaves"}" <${env.ADMIN_EMAIL}>`,
    to: env.ADMIN_EMAIL,
    subject: `New ${label} from ${data.name} — Skywaves`,
    html: wrapHtml(`New ${label} Submission`, body),
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

  await transporter.sendMail({
    from: `"${env.GMAIL_APP_NAME ?? "Skywaves"}" <${env.ADMIN_EMAIL}>`,
    to: env.ADMIN_EMAIL,
    subject: `New Feedback Submission — Skywaves`,
    html: wrapHtml("New Feedback Submitted", body),
  });
}
