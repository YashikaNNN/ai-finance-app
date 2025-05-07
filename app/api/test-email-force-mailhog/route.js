import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderAsync } from "@react-email/render";
import EmailTemplate from "@/emails/template";

export async function GET() {
  try {
    console.log("Starting forced MailHog test...");
    
    // Test data
    const testData = {
      userName: "Test User",
      type: "monthly-report",
      data: {
        month: "Test Month",
        stats: {
          totalIncome: 5000,
          totalExpenses: 3500,
          byCategory: {
            "Housing": 1200,
            "Food": 600,
            "Transportation": 400,
            "Entertainment": 300,
            "Utilities": 250,
            "Shopping": 450,
            "Healthcare": 300,
          }
        },
        insights: [
          "This is a test insight 1",
          "This is a test insight 2",
          "This is a test insight 3"
        ]
      }
    };

    // Set up nodemailer with MailHog - bypass the normal function
    const transport = nodemailer.createTransport({
      host: "127.0.0.1",
      port: 1025,
      secure: false,
      auth: {
        user: "", // No authentication needed for MailHog
        pass: ""
      },
      debug: true // Add debug output
    });

    // Render React email template to HTML
    const emailComponent = EmailTemplate(testData);
    console.log("Email component created");
    const html = await renderAsync(emailComponent);
    console.log("Email rendered to HTML");

    // Send email via MailHog
    console.log("Attempting to send email directly to MailHog...");
    const info = await transport.sendMail({
      from: "Testing <test@example.com>",
      to: "recipient@example.com",
      subject: "Direct MailHog Test",
      html
    });

    console.log("Email sent via MailHog:", info.messageId);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent directly to MailHog. Check at http://localhost:8025",
      result: info
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error",
      stack: error.stack
    }, { status: 500 });
  }
} 