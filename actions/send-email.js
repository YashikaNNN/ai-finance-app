"use server";

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { renderAsync } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  // Check if we should use MailHog (local development) or Resend (production)
  const useMailhog = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "test_key";

  if (useMailhog) {
    try {
      // Set up nodemailer with MailHog
      const transport = nodemailer.createTransport({
        host: "127.0.0.1",
        port: 1025,
        secure: false,
        auth: {
          user: "", // No authentication needed for MailHog
          pass: ""
        }
      });

      // Render React email template to HTML
      const html = await renderAsync(react);

      // Send email via MailHog
      const info = await transport.sendMail({
        from: "Finance App <test@example.com>",
        to,
        subject,
        html
      });

      console.log("Email sent via MailHog:", info.messageId);
      return { success: true, data: info };
    } catch (error) {
      console.error("Failed to send email via MailHog:", error);
      return { success: false, error };
    }
  } else {
    // Use Resend in production
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const data = await resend.emails.send({
        from: "Finance App <onboarding@resend.dev>",
        to,
        subject,
        react,
      });

      return { success: true, data };
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return { success: false, error };
    }
  }
}
