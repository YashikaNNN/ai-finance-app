import { NextResponse } from "next/server";
import { Resend } from "resend";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateFinancialInsights(month) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Sample data since we don't have actual data
    const sampleData = {
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

    const prompt = `
      Analyze this financial data and provide 3 concise, actionable insights.
      Focus on spending patterns and practical advice.
      Keep it friendly and conversational.

      Financial Data for ${month}:
      - Total Income: ₹${sampleData.totalIncome}
      - Total Expenses: ₹${sampleData.totalExpenses}
      - Net Income: ₹${sampleData.totalIncome - sampleData.totalExpenses}
      - Expense Categories: ${Object.entries(sampleData.byCategory)
        .map(([category, amount]) => `${category}: ₹${amount}`)
        .join(", ")}

      Format the response as a JSON array of strings, like this:
      ["insight 1", "insight 2", "insight 3"]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return {
      insights: JSON.parse(cleanedText),
      stats: sampleData,
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      insights: [
        "Your highest expense category this month might need attention.",
        "Consider setting up a budget for better financial management.",
        "Track your recurring expenses to identify potential savings.",
      ],
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
      }
    };
  }
}

export async function GET() {
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
    
    // Get current month
    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    
    // Generate AI insights with sample data
    const { insights, stats } = await generateFinancialInsights(monthName);
    
    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log("Sending financial report to:", email);
    const result = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to: email,
      subject: `Your Financial Report - ${monthName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Monthly Financial Report</h1>
          <p>Hello ${user.firstName},</p>
          <p>Here's your financial summary for ${monthName}:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold;">Total Income:</span> ₹${stats.totalIncome}
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold;">Total Expenses:</span> ₹${stats.totalExpenses}
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold;">Net Income:</span> ₹${stats.totalIncome - stats.totalExpenses}
            </div>
          </div>
          
          <h2 style="color: #333;">Expenses by Category</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${Object.entries(stats.byCategory)
              .map(([category, amount]) => 
                `<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>${category}</span>
                  <span>₹${amount}</span>
                </div>`
              )
              .join('')}
          </div>
          
          <h2 style="color: #333;">AI Financial Insights</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <ul>
              ${insights.map(insight => `<li style="margin-bottom: 10px;">${insight}</li>`).join('')}
            </ul>
          </div>
          
          <p style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            Thank you for using our Finance Platform
          </p>
        </div>
      `,
    });
    
    console.log("Email result:", result);
    
    return NextResponse.json({
      success: true,
      message: `Financial report sent to ${email}`,
      result
    });
  } catch (error) {
    console.error("Error sending financial report:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 