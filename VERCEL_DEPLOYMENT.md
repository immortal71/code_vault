# Vercel Deployment Guide for Code Snippet Manager

## ⚠️ Security Alert

**IMPORTANT:** Your Supabase API key was visible in the screenshots you shared. Please:
1. Go to Supabase Dashboard → Settings → API
2. Revoke the exposed `anon` key
3. Generate a new one
4. Never share API keys in screenshots or public channels

## 🚀 Deployment Steps

### 1. Set Up Supabase Database

1. **Get Connection String:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Click on "Connection Pooling" tab
   - Copy the "Connection string" (Transaction mode)
   - It looks like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`

2. **Create Database Schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the content from `supabase-setup.sql`
   - Click "Run" to execute the SQL commands

### 2. Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Value | How to Get It |
|----------|-------|--------------|
| `DATABASE_URL` | Your Supabase connection pooler URL | From Supabase → Database → Connection Pooling |
| `JWT_SECRET` | Random 32+ char string | Run: `openssl rand -base64 32` |
| `REFRESH_TOKEN_SECRET` | Random 32+ char string | Run: `openssl rand -base64 32` |
| `OPENAI_API_KEY` | Your OpenAI API key | From OpenAI dashboard |
| `ALLOWED_ORIGINS` | Your frontend domain(s) | e.g., `https://your-app.vercel.app` (comma-separated for multiple) |
| `NODE_ENV` | `production` | Literal value |

**Example DATABASE_URL format (MUST include `?sslmode=require`):**
```
postgresql://postgres.oeghyxvtlgphngccgloxq:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**⚠️ Important:** The DATABASE_URL **must** include `?sslmode=require` at the end for Supabase connections to work from Vercel.

### 3. Deploy to Vercel

The code is now ready for deployment. The imports have been fixed to work with Vercel's serverless environment.

1. **Via Vercel Dashboard:**
   - Go to your project
   - Click "Deployments" → "Redeploy"
   
2. **Via CLI:**
   ```bash
   vercel --prod
   ```

### 4. Verify Deployment

1. Visit your deployed URL: `https://[your-project].vercel.app`
2. Try to register a new account
3. Check if login works
4. Test creating a code snippet

## 🔍 Troubleshooting

### If registration still fails:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → [Latest] → Functions
   - Click on `/api/auth/register` to see detailed logs

2. **Verify Environment Variables:**
   - Make sure all 5 variables are set
   - DATABASE_URL should be the **connection pooler** URL (port 6543)
   - Secrets should be at least 32 characters

3. **Check Supabase Connection:**
   - In Supabase SQL Editor, run: `SELECT * FROM users LIMIT 1;`
   - Make sure the table exists

### Common Issues:

- **"Cannot find module"** → Redeploy after fixing imports (already done)
- **"ECONNREFUSED"** → Wrong DATABASE_URL (use pooler URL, not direct)
- **"Unauthorized"** → JWT secrets not set in Vercel
- **"Table does not exist"** → Run the SQL setup script in Supabase

## 📝 What Was Fixed

1. ✅ Added `.js` extensions to **all** relative imports (including server/services imports) for ES module compatibility
2. ✅ Switched database driver from `neon-http` to `postgres-js` for proper Supabase compatibility
3. ✅ Configured SSL requirement for Supabase connections in serverless environment
4. ✅ Created SQL schema setup file with pgcrypto extension and exact schema match
5. ✅ Added `ALLOWED_ORIGINS` environment variable requirement for CORS
6. ✅ Installed `postgres` package for PostgreSQL connection pooling
7. ✅ Fixed serverless function module resolution issues

## 🔐 Security Best Practices

- Never commit `.env` files
- Rotate exposed API keys immediately
- Use environment variables for all secrets
- Enable Row Level Security (RLS) in Supabase for production

---

After completing these steps, your app should work correctly on Vercel with Supabase!
