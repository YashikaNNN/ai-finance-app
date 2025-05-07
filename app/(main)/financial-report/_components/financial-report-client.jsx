"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Progress } from "@/components/ui/progress";

export default function FinancialReportClient() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReportData() {
      try {
        // Fetch real transaction data for current month
        const response = await fetch('/api/reports/data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setReportData({
            stats: data.stats,
            insights: data.insights,
            month: data.month
          });
        } else {
          throw new Error(data.error || 'Failed to generate report');
        }
      } catch (error) {
        console.error("Error generating report:", error);
        // Fallback to sample data only if error occurs
        const stats = generateSampleStats();
        const insights = await generateFinancialInsights(stats, stats.month);
        
        setReportData({
          stats,
          insights,
          month: stats.month
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchReportData();
  }, []);

  // Generate sample stats (fallback only)
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

  // Generate insights using Gemini API
  async function generateFinancialInsights(stats, month) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
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

  // Function to calculate percentage of total for expense categories
  function calculatePercentage(amount, total) {
    return Math.round((amount / total) * 100);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Generating your financial report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Financial Report - {reportData.month}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Income</div>
                <div className="text-2xl font-bold">₹{reportData.stats.totalIncome}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-2xl font-bold">₹{reportData.stats.totalExpenses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Net Income</div>
                <div className="text-2xl font-bold">₹{reportData.stats.totalIncome - reportData.stats.totalExpenses}</div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <div>
            <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
            <div className="space-y-4">
              {Object.entries(reportData.stats.byCategory).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span>{category}</span>
                    <span className="font-medium">₹{amount} ({calculatePercentage(amount, reportData.stats.totalExpenses)}%)</span>
                  </div>
                  <Progress value={calculatePercentage(amount, reportData.stats.totalExpenses)} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <h3 className="text-lg font-medium mb-4">AI Financial Insights</h3>
            <div className="space-y-3">
              {reportData.insights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p>{insight}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 