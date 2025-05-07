import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export async function GET() {
  try {
    console.log("Starting simple email test...");
    
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

    console.log("Sending test email...");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "MailHog Test Email",
      react: EmailTemplate(testData),
    });

    console.log("Email send result:", result);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent. Check MailHog at http://localhost:8025",
      result
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
} 