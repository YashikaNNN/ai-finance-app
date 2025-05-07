# Full Stack AI Fianace Platform with Next JS, Supabase, Tailwind, Prisma, Inngest, ArcJet, Shadcn UI Tutorial 🔥🔥
## https://youtu.be/egS6fnZAdzk

<img width="1470" alt="Screenshot 2024-12-10 at 9 45 45 AM" src="https://github.com/user-attachments/assets/1bc50b85-b421-4122-8ba4-ae68b2b61432">

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```

## Email Configuration

The application sends financial reports via email using Resend. For this functionality to work properly, the following environment variables must be configured:

- `RESEND_API_KEY`: Your Resend API key for sending emails in production
- `GEMINI_API_KEY`: Google Gemini API key for generating financial insights

### Local Development:

For local development, emails are sent to MailHog, a test SMTP server. Start MailHog with Docker:

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Then view emails at http://localhost:8025

### Production:

For production deployment on Vercel, set the following environment variables:

1. Log in to your Vercel dashboard
2. Go to your project settings
3. Navigate to the "Environment Variables" section
4. Add the following variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `GEMINI_API_KEY`: Your Google Gemini API key
   
Note: Make sure your Clerk user profiles have valid email addresses as the system retrieves user emails directly from Clerk.
