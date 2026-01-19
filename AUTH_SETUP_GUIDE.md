# Xirevoa Authentication Setup Guide

## 🔐 Complete Authentication System Implemented

Your Xirevoa website now has a full authentication system with:
- ✅ Google OAuth Login
- ✅ Email/Password Registration
- ✅ Email Verification
- ✅ Profile Picture Integration
- ✅ XPoints System (20 free XPoints on signup)
- ✅ Session Management

## 📋 Required Setup Steps

### 1. Database Setup

Run the SQL file to create user tables:

```bash
mysql -u xire_img -p xire_img < database-users.sql
```

Or manually execute the SQL in your MySQL client from `database-users.sql`

### 2. Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create/Select Project**: Create a new project or use existing
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Enable it
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Xirevoa AI"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (your production URL)
5. **Copy Credentials**: You'll get **Client ID** and **Client Secret**

### 3. Gmail SMTP Setup (For Email Verification)

1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification" first

2. **Create App Password**:
   - After 2FA is enabled, go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Xirevoa SMTP"
   - Click "Generate"
   - You'll get a **16-character App Password** (save it)

### 4. Update Environment Variables

Update `.env.local` with your credentials:

```env
# NextAuth Secret (Generate one using command below)
NEXTAUTH_SECRET=run-this-command-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Email SMTP (App Password from step 3)
SMTP_PASSWORD=your-16-char-app-password-here
```

### 5. Generate NextAuth Secret

Run this command in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

## 🚀 How It Works

### For Users:

**Google Login:**
- Click "Continue with Google"
- Username auto-created from email (e.g., john.doe@gmail.com → john.doe)
- Profile picture from Google
- Instant access (no verification needed)

**Email/Password:**
- Fill signup form (username, email, password)
- Receives verification email at contact@xirevoa.com
- Must verify email before login
- Default user icon (unless they add profile picture later)

### User Experience Flow:

1. **New User**: Clicks profile icon → "Login" button → Choose Google or Email signup
2. **Google Users**: Instant login, username from email, Google profile picture
3. **Email Users**: Signup → Verify email → Login
4. **Logged In**: Shows profile picture, XPoints balance, Settings/Sign Out menu

## 📧 Email Templates

Beautiful branded emails are sent for:
- **Account Verification**: Welcome email with verification link
- **Password Reset**: Secure reset link (you can implement forgot-password page later)

## 🎨 UI Features

- Sidebar menu (replaced header buttons)
- User dropdown menu with profile info
- Dynamic XPoints display
- Session-aware header (shows Login if not logged in)
- Profile pictures (Google or default icon)

## 🔧 Testing Locally

1. Update .env.local with all credentials
2. Run development server:
   ```bash
   npm run dev
   ```
3. Visit http://localhost:3000
4. Click profile icon → Login/Signup
5. Test both Google and Email flows

## ⚠️ Important Notes

- **NEVER use regular Gmail password** - must use App Password
- **Google OAuth redirect URIs** must match exactly (including http/https)
- **Email verification links** expire after 24 hours
- **Default XPoints**: All new users get 20 XPoints

## 🔐 Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT session tokens
- Email verification required for manual signup
- Secure password reset tokens
- SQL injection protected (parameterized queries)

## 📝 Next Steps (Optional)

You can now implement:
- Forgot Password page
- Profile settings page
- XPoints deduction on AI generation
- Purchase more XPoints system
- User dashboard

---

**Need help?** Check the code comments in:
- `lib/auth.ts` - NextAuth configuration
- `lib/email.ts` - Email sending functions
- `app/api/auth/signup/route.ts` - Signup API
- `app/components/Header.tsx` - Auth UI integration
