import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export async function GET() {
  try {
    // Test data
    const testData = {
      userName: "Test User",
      type: "monthly-report",
      data: {
        month: "April",
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
          "Housing is your largest expense. Consider reviewing if this aligns with your financial goals.",
          "Your savings rate is healthy at 30%. Great job maintaining financial discipline!",
          "Food and shopping make up a significant portion of discretionary spending. Tracking these could reveal savings opportunities."
        ]
      }
    };

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Special Test Email",
      react: EmailTemplate(testData),
    });

    return NextResponse.json({ 
      success: true, 
      message: "Special test email sent. Check MailHog at http://localhost:8025",
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