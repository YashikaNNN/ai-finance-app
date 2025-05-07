import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
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

export async function GET() {
  try {
    // Sample financial data
    const sampleStats = {
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
    };

    const month = "April";
    const insights = await generateFinancialInsights(sampleStats, month);

    return NextResponse.json({ 
      success: true, 
      insights,
      stats: sampleStats,
      month
    });
  } catch (error) {
    console.error("Error in test-insights route:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 