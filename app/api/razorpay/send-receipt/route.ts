import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName, xpAdded, amount, paymentId, newBalance } = await req.json();

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { color: #6b7280; }
          .detail-value { font-weight: bold; color: #111827; }
          .xp-badge { background: #FCD34D; color: #92400E; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <div class="success-badge">✓ Payment Confirmed</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Plan</span>
                <span class="detail-value">${planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid</span>
                <span class="detail-value">₹${amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">XP Points Added</span>
                <span class="detail-value"><span class="xp-badge">${xpAdded} XP</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Balance</span>
                <span class="detail-value"><span class="xp-badge">${newBalance} XP</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment ID</span>
                <span class="detail-value" style="font-size: 12px;">${paymentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <p style="margin-top: 20px;">Your XP Points have been instantly added to your account. Start creating amazing AI images now!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://xirevoa.com" style="background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Start Creating</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated receipt from Xirevoa.com</p>
            <p>If you have any questions, contact us at contact@xirevoa.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Xirevoa" <${process.env.EMAIL_FROM}>`,
      to: session.user.email,
      subject: `Payment Successful - ${xpAdded} XP Points Added! 🎉`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
