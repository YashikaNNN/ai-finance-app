import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database to get their email
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        email: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json({ 
        error: "User email not found. Please ensure your account has an email address." 
      }, { status: 404 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log("Sending test email to authenticated user:", user.email);
    const result = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to: user.email,
      subject: "Simple Resend Test",
      html: "<p>This is a simple test email from your finance app using Resend.</p>",
    });
    
    console.log("Email result:", result);
    
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${user.email}`,
      result
    });
  } catch (error) {
    console.error("Error sending email with Resend:", error);
    return NextResponse.json({
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 