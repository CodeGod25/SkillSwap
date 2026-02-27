# 🚀 SkillSwap - Deployment Guide

## Complete Guide: GitHub → Vercel Deployment

---

## Part 1: Prepare Your Project ✅

### ✅ Completed:
- [x] .gitignore updated with proper exclusions
- [x] Environment variables identified
- [x] Both servers tested and working

---

## Part 2: Push to GitHub

### Step 1: Initialize Git Repository

```powershell
cd d:\SkillSwap
git init
```

### Step 2: Create a GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right
3. Click **"New repository"**
4. Fill in:
   - **Repository name**: `skillswap` (or your preferred name)
   - **Description**: "Time banking platform for skill exchange"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have files)
5. Click **"Create repository"**

### Step 3: Link Local Repository to GitHub

After creating the repo, GitHub will show you commands. Use these:

```powershell
cd d:\SkillSwap
git add .
git commit -m "Initial commit: SkillSwap MVP ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skillswap.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### 📝 Important Files to Note:

**DO commit these:**
- ✅ Source code (all .js, .jsx files)
- ✅ package.json files
- ✅ README.md, FEATURES.md
- ✅ prisma/schema.prisma
- ✅ Public assets (images, demo video)

**DON'T commit these (already in .gitignore):**
- ❌ node_modules/
- ❌ .env files
- ❌ .next/ build folders
- ❌ backend/uploads/
- ❌ .vercel/

---

## Part 3: Deploy to Vercel

### Step 1: Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. From Vercel Dashboard, click **"Add New"** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"skillswap"** and click **"Import"**

### Step 3: Configure Your Project

Vercel will auto-detect Next.js for the frontend. You need to configure it:

#### **Configure Frontend:**

**Framework Preset**: Next.js
**Root Directory**: `frontend`
**Build Command**: `npm run build` (auto-detected)
**Output Directory**: `.next` (auto-detected)
**Install Command**: `npm install` (auto-detected)

#### **Environment Variables for Frontend:**

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_BASE=https://your-backend-url.vercel.app
```

*Note: You'll update this after deploying the backend*

### Step 4: Deploy Backend

After frontend is deployed:

1. From Vercel Dashboard, click **"Add New"** → **"Project"** again
2. Import the **same** GitHub repository
3. This time configure for backend:

**Framework Preset**: Other
**Root Directory**: `backend`
**Build Command**: Leave empty or `npm install`
**Install Command**: `npm install`

#### **Environment Variables for Backend:**

Add ALL these variables:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_key_here
NODE_VERSION=18
```

**Getting DATABASE_URL:**
You need a PostgreSQL database. Options:
- **Vercel Postgres** (recommended): Add from Vercel Storage tab
- **Supabase**: Free PostgreSQL hosting
- **Railway**: Free PostgreSQL hosting
- **Neon**: Free PostgreSQL hosting

### Step 5: Set Up Database on Vercel

**Option A: Vercel Postgres (Recommended)**

1. In your backend project on Vercel, go to **"Storage"** tab
2. Click **"Create Database"** → **"Postgres"**
3. Follow the wizard
4. Vercel will automatically add `DATABASE_URL` to your environment variables
5. In terminal, run migrations:

```powershell
cd d:\SkillSwap\backend
npx prisma migrate deploy
npx prisma db seed
```

**Option B: External Database (Supabase/Railway/Neon)**

1. Create account on your chosen provider
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add it to Vercel as `DATABASE_URL`
5. Run migrations as above

### Step 6: Update Frontend with Backend URL

1. Go to your **frontend** project on Vercel
2. Go to **"Settings"** → **"Environment Variables"**
3. Update `NEXT_PUBLIC_API_BASE`:
   ```
   NEXT_PUBLIC_API_BASE=https://your-backend-project.vercel.app
   ```
4. Click **"Save"**
5. Go to **"Deployments"** tab
6. Click the 3 dots on latest deployment → **"Redeploy"**

### Step 7: Configure CORS in Backend

Update `backend/index.js` CORS settings to allow your frontend domain:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend.vercel.app',
  'https://skillswap.vercel.app' // Your actual domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Commit and push this change, Vercel will auto-deploy.

---

## Part 4: Post-Deployment Setup

### 1. Test Your Live App

Visit your frontend URL (e.g., `https://skillswap.vercel.app`)

Test:
- ✅ Sign up new user
- ✅ Add skills
- ✅ View TownSquare
- ✅ Send trade request
- ✅ Check if credits work
- ✅ Send messages
- ✅ Leave reviews

### 2. Set Up Custom Domain (Optional)

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Vercel project settings, go to **"Domains"**
3. Click **"Add"**
4. Enter your domain
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-48 hours)

### 3. Configure Environment for Production

Make sure you have:
- Strong JWT_SECRET (use: `openssl rand -base64 32`)
- Valid OpenAI API key (if using AI features)
- Database with enough capacity
- Proper CORS settings

### 4. Monitor Your App

Vercel provides:
- **Analytics**: Track page views and performance
- **Logs**: Debug errors in real-time
- **Speed Insights**: Monitor app performance

Access these from your Vercel dashboard.

---

## Part 5: Continuous Deployment

### How It Works:

Once set up, Vercel automatically:
1. Watches your GitHub repository
2. When you push code → Vercel builds and deploys
3. Preview deployments for pull requests
4. Production deployment for `main` branch

### Making Updates:

```powershell
cd d:\SkillSwap

# Make your changes
# ...

# Commit and push
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! 🎉
```

---

## Troubleshooting

### Issue: Build Fails on Vercel

**Frontend build fails:**
- Check if all dependencies are in `package.json`
- Verify Node version compatibility
- Check build logs for specific errors

**Backend build fails:**
- Verify DATABASE_URL is correct
- Check if all environment variables are set
- Ensure Prisma schema is committed

### Issue: Database Connection Fails

- Verify DATABASE_URL format: `postgresql://user:password@host:port/database?schema=public`
- Check if database allows external connections
- Run `npx prisma generate` before deploying
- Run `npx prisma migrate deploy` to apply migrations

### Issue: API Calls Fail

- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_BASE` is correct in frontend
- Check network tab in browser dev tools
- View Vercel function logs for errors

### Issue: Environment Variables Not Working

- Environment variables must be set in Vercel dashboard
- Frontend env vars must start with `NEXT_PUBLIC_`
- Redeploy after changing environment variables
- Check spelling and formatting

---

## Quick Checklist

### Before Deployment:
- [ ] .gitignore properly configured
- [ ] No .env files in git
- [ ] All features tested locally
- [ ] Database schema finalized
- [ ] CORS properly configured

### GitHub:
- [ ] Repository created
- [ ] Code pushed to main branch
- [ ] Repository connected to Vercel

### Vercel Frontend:
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] Environment variables added
- [ ] Successful deployment
- [ ] App accessible via URL

### Vercel Backend:
- [ ] Project imported
- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] Database connected
- [ ] Migrations run
- [ ] Successful deployment

### Final Testing:
- [ ] Sign up works
- [ ] Login works
- [ ] Skills can be added
- [ ] Trades can be created
- [ ] Credits transfer correctly
- [ ] Messages send
- [ ] Reviews appear
- [ ] All features functional

---

## Costs & Limits

### Vercel Free Tier:
- ✅ Unlimited personal projects
- ✅ 100 GB bandwidth/month
- ✅ Serverless function execution
- ✅ Automatic HTTPS
- ✅ Custom domains
- ❌ No commercial use
- ❌ 10-second function timeout

### Database Options:
- **Vercel Postgres**: Free tier available
- **Supabase**: 500MB free
- **Railway**: $5/month after trial
- **Neon**: 10GB free

---

## Need Help?

### Vercel Documentation:
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/nextjs
- https://vercel.com/docs/storage/vercel-postgres

### Common Issues:
- https://vercel.com/docs/troubleshooting

### Community:
- Vercel Discord: https://vercel.com/discord
- GitHub Discussions: On your repo

---

## 🎉 You're Done!

Your SkillSwap app is now live and accessible to the world!

**Next Steps:**
1. Share your app with friends
2. Gather feedback
3. Iterate and improve
4. Scale as needed

**Your Live URLs:**
- Frontend: `https://skillswap.vercel.app`
- Backend: `https://skillswap-api.vercel.app`

Happy deploying! 🚀
