import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string, username: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"Xirevoa AI" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Xirevoa Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #111; border: 2px solid #333; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #000; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .content h2 { color: #EAB308; margin-top: 0; }
            .content p { color: #aaa; line-height: 1.6; margin: 16px 0; }
            .button { display: inline-block; background: #EAB308; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #CA8A04; }
            .footer { background: #0a0a0a; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333; }
            .code { background: #1a1a1a; border: 1px solid #333; padding: 12px; border-radius: 8px; font-family: monospace; color: #EAB308; text-align: center; font-size: 18px; letter-spacing: 2px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Xirevoa AI</h1>
            </div>
            <div class="content">
              <h2>Hello ${username}! 👋</h2>
              <p>Thank you for joining Xirevoa AI - where we transform your reality with AI-powered image generation.</p>
              <p>Please verify your email address to activate your account and start creating amazing AI transformations.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #888; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #EAB308; word-break: break-all;">${verificationUrl}</span>
              </p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                <strong style="color: #fff;">Your welcome bonus: 250 coins 🪙</strong><br>
                Start creating immediately after verification!
              </p>
            </div>
            <div class="footer">
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with Xirevoa, please ignore this email.</p>
              <p>&copy; 2026 Xirevoa AI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string, username: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Xirevoa AI" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset Your Xirevoa Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #111; border: 2px solid #333; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #000; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .content h2 { color: #EAB308; margin-top: 0; }
            .content p { color: #aaa; line-height: 1.6; margin: 16px 0; }
            .button { display: inline-block; background: #EAB308; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #0a0a0a; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>We received a request to reset your password for your Xirevoa AI account.</p>
              <p>Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p style="font-size: 14px; color: #888; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #EAB308; word-break: break-all;">${resetUrl}</span>
              </p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #ff4444;">
                <strong>⚠️ Security Note:</strong><br>
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            <div class="footer">
              <p>This password reset link will expire in 1 hour.</p>
              <p>&copy; 2026 Xirevoa AI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
