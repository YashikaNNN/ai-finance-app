import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth, currentUser } from "@clerk/nextjs/server";

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
    
    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log("Sending test email directly to:", email);
    const result = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to: email,
      subject: "Direct Email Test",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent directly to your Clerk email address.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>User ID: ${user.id}</p>
        <p>Name: ${user.firstName} ${user.lastName}</p>
      `,
    });
    
    console.log("Email result:", result);
    
    return NextResponse.json({
      success: true,
      message: `Test email sent directly to ${email}`,
      result
    });
  } catch (error) {
    console.error("Error sending direct email:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 