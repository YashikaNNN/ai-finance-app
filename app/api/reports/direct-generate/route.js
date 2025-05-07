import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to generate insights using Gemini API
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

// Generate a sample dataset for the report
function generateSampleStats() {
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  
  return {
    totalIncome: 5800,
    totalExpenses: 3700,
    byCategory: {
      "Housing": 1400,
      "Food": 650,
      "Transportation": 450,
      "Entertainment": 320,
      "Utilities": 280,
      "Shopping": 400,
      "Healthcare": 200,
    },
    month: currentMonth
  };
}

export async function POST() {
  try {
    // Get current user directly from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get email directly from Clerk user object
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ 
        error: "No email address found for your account" 
      }, { status: 400 });
    }
    
    console.log("User found with email:", email);
    
    // Generate sample stats for the demo
    const stats = generateSampleStats();
    const monthName = stats.month;
    
    // Generate AI insights
    const insights = await generateFinancialInsights(stats, monthName);
    
    console.log("About to send report email to:", email);
    
    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: `Your On-Demand Financial Report - ${monthName}`,
      react: EmailTemplate({
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User",
        type: "monthly-report",
        data: {
          stats,
          month: monthName,
          insights,
        },
      }),
    });
    
    console.log("Email sending result:", emailResult);
    
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }

    return NextResponse.json({
      success: true,
      message: "Report generated and sent to your email",
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate report" 
    }, { status: 500 });
  }
} 