# 🚀 SkillSwap - Quick Start Guide

## Files Created

### Backend (28 files)
```
backend/
├── package.json              # Dependencies & scripts
├── index.js                  # Express server
├── .env                      # Environment variables (with Railway DB)
├── .env.example              # Template for env vars
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── auth.js              # Signup/login endpoints
│   ├── users.js             # Profile & nearby search
│   ├── trades.js            # Trade management
│   └── ledger.js            # Transaction history
└── prisma/
    ├── schema.prisma        # Database models
    └── seed.js              # Demo data seeder
```

### Frontend (21 files)
```
frontend/
├── package.json             # Dependencies & scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── .env.local               # API URL configuration
├── .env.local.example       # Template
├── styles/
│   └── globals.css          # Global styles & Tailwind
├── lib/
│   └── api.js               # API client wrapper
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── _document.js         # HTML document
│   ├── index.jsx            # Landing page
│   ├── login.jsx            # Login page
│   ├── signup.jsx           # Registration page
│   ├── dashboard.jsx        # Main dashboard with map
│   └── profile.jsx          # Profile editor
└── components/stitch/       # Reusable UI components
    ├── TopNav.jsx
    ├── SidebarFilters.jsx
    ├── MapView.jsx
    ├── BottomProfileCard.jsx
    ├── DashboardHero.jsx
    ├── TimeCreditCard.jsx
    ├── SkillsCard.jsx
    ├── LedgerTable.jsx
    └── HeroMarketing.jsx
```

### Scripts & Config (6 files)
```
scripts/
├── fetch-stitch.js          # Fetch Stitch design export
└── convert-stitch-to-next.js # Convert to React components

Root:
├── README.md                # Comprehensive documentation
├── .gitignore               # Git ignore rules
├── package.json             # Root package for shortcuts
├── setup.bat                # Windows setup script
├── start-backend.bat        # Start backend shortcut
└── start-frontend.bat       # Start frontend shortcut
```

## 🎯 Launch Commands (Windows)

### Option 1: Automated Setup
Double-click `setup.bat` to install everything automatically.

### Option 2: Manual Setup

#### Terminal 1 - Backend Setup:
```cmd
cd E:\SkillSwap\backend
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

#### Terminal 2 - Frontend Setup:
```cmd
cd E:\SkillSwap\frontend
npm install
npm run dev
```

### Option 3: Use Shortcut Scripts
After running setup once, you can use:
- Double-click `start-backend.bat`
- Double-click `start-frontend.bat`

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/health

## 🔐 Demo Accounts

| Email                 | Password    | Balance | Skills              |
|-----------------------|-------------|---------|---------------------|
| alice@skillswap.com   | password123 | 0       | Python, Spanish     |
| bob@skillswap.com     | password123 | 2       | Plumbing, Carpentry |
| carol@skillswap.com   | password123 | 1       | Gardening, Dogs     |
| david@skillswap.com   | password123 | 3       | Piano, Guitar       |

## ⚠️ Important Notes

### Database Connection
The Railway DATABASE_URL uses `postgres.railway.internal` which only works **inside Railway's network**. 

For local development from Windows, you need to:

1. Go to your Railway dashboard
2. Find your PostgreSQL service
3. Copy the **"Public Network" connection string** (not Internal)
4. Update `backend/.env` with that URL

Example:
```env
# Replace this:
DATABASE_URL="postgresql://postgres:nBuVuXisstyHQAflhAJjregSMiiUFcIG@postgres.railway.internal:5432/railway"

# With something like this (your actual public host):
DATABASE_URL="postgresql://postgres:nBuVuXisstyHQAflhAJjregSMiiUFcIG@roundhouse.proxy.rlwy.net:12345/railway"
```

### Environment Variables Already Set
- ✅ `backend/.env` - Railway DB URL & JWT secret
- ✅ `frontend/.env.local` - API URL & Stitch key

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, React-Leaflet
- **Backend**: Node.js, Express, Prisma, JWT
- **Database**: PostgreSQL (Railway)
- **Map**: Leaflet + OpenStreetMap

## 🎨 UI Components Reference

All components are extracted from the provided HTML design files:

- **TopNav** (1.html, 2.html, 3.html, 4.html) - Navigation bar
- **SidebarFilters** (1.html) - Categories & search sidebar
- **MapView** (1.html) - Interactive Leaflet map
- **BottomProfileCard** (1.html) - Floating user selection card
- **DashboardHero** (2.html) - Welcome header
- **TimeCreditCard** (2.html) - Balance display card
- **SkillsCard** (2.html) - Skills offered/needed
- **LedgerTable** (2.html) - Transaction history
- **HeroMarketing** (3.html) - Landing page hero

## 📊 Database Models

### User
- Authentication: email, passwordHash
- Location: lat, lng, radiusKm
- Balance: time credits (allows -5 minimum)

### Skill
- Linked to User
- Type: "offer" or "need"

### Trade
- Links provider & requester
- Status: "pending", "completed", "cancelled"
- Atomic completion via Prisma transactions

### Ledger
- Transaction log (audit trail)
- Links to Trade for reference

## 🛠️ API Endpoints Summary

**Auth:**
- POST /api/signup
- POST /api/login

**Users:**
- GET /api/me (authenticated)
- PUT /api/me (authenticated)
- GET /api/users/nearby?lat=&lng=&radiusKm=

**Trades:**
- POST /api/trades (authenticated)
- GET /api/trades (authenticated)
- POST /api/trades/:id/complete (authenticated)
- DELETE /api/trades/:id (authenticated)

**Ledger:**
- GET /api/ledger (authenticated)
- GET /api/ledger/:userId

## 🎯 Next Steps After Launch

1. **Test the flow**:
   - Login as Alice
   - View dashboard & map
   - Click on nearby users
   - Request a trade

2. **Customize**:
   - Update colors in tailwind.config.js
   - Add more categories in SidebarFilters
   - Adjust map initial position

3. **Deploy**:
   - Backend → Railway/Heroku
   - Frontend → Vercel/Netlify
   - Update NEXT_PUBLIC_API_URL

## 📞 Support

- Check README.md for detailed docs
- See console logs for errors
- Use `npx prisma studio` to view database

---

**Ready to build community! 🤝**
