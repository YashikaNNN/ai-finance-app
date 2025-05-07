import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current month data
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthName = now.toLocaleString("default", { month: "long" });

    // Get transactions for current month
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    // Calculate stats
    const stats = {
      totalIncome: transactions
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount.toNumber(), 0),
      totalExpenses: transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount.toNumber(), 0),
      byCategory: transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
          return acc;
        }, {}),
    };

    // If no transactions found, use sample data
    if (!transactions.length) {
      stats.totalIncome = 5000;
      stats.totalExpenses = 3500;
      stats.byCategory = {
        "Housing": 1200,
        "Food": 600,
        "Transportation": 400,
        "Entertainment": 300,
        "Utilities": 250,
        "Shopping": 450,
        "Healthcare": 300,
      };
    }

    // Generate AI insights
    const insights = await generateFinancialInsights(stats, monthName);

    console.log("About to send report email to:", user.email);
    console.log("Email data:", {
      subject: `Your On-Demand Financial Report - ${monthName}`,
      userName: user.name,
      statsProvided: !!stats,
      insightsProvided: !!insights,
      useMailhog: !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "test_key"
    });

    // Send email
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: `Your On-Demand Financial Report - ${monthName}`,
        react: EmailTemplate({
          userName: user.name,
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
    } catch (emailError) {
      console.error("Exception during email sending:", emailError);
      throw emailError;
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