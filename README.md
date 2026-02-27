# SkillSwap — Time-Banking Community Platform

A complete hackathon-ready full-stack application where neighbors exchange skills without money using a time-credit system. Built with React/Next.js frontend and Express/Prisma backend connected to Railway PostgreSQL.

## 🎯 Features

- **Time Credit System**: 1 hour of help = 1 time credit
- **User Authentication**: JWT-based signup/login
- **Nearby Discovery**: Find users offering skills within your radius
- **Interactive Map**: Leaflet-based map with user markers
- **Trade Management**: Request trades, complete exchanges, track history
- **Ledger System**: Complete transaction history with balance tracking
- **Profile Management**: Edit skills offered/needed, location, and preferences
- **Responsive Design**: Tailwind CSS with dark mode support

## 🏗️ Project Structure

```
SkillSwap/
├── backend/                 # Express + Prisma API
│   ├── index.js            # Main server file
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Signup, login
│   │   ├── users.js        # Profile, nearby search
│   │   ├── trades.js       # Create, complete trades
│   │   └── ledger.js       # Transaction history
│   ├── prisma/
│   │   ├── schema.prisma   # Database models
│   │   └── seed.js         # Demo data seeder
│   └── .env                # Environment variables
├── frontend/                # Next.js React app
│   ├── pages/
│   │   ├── index.jsx       # Landing page
│   │   ├── login.jsx       # Login form
│   │   ├── signup.jsx      # Registration
│   │   ├── dashboard.jsx   # Main app dashboard
│   │   └── profile.jsx     # Edit profile
│   ├── components/stitch/  # UI components (from HTML exports)
│   │   ├── TopNav.jsx
│   │   ├── MapView.jsx
│   │   ├── SidebarFilters.jsx
│   │   ├── TimeCreditCard.jsx
│   │   └── ...
│   ├── lib/
│   │   └── api.js          # API client wrapper
│   └── .env.local          # Frontend environment vars
└── scripts/                 # Stitch integration (optional)
    ├── fetch-stitch.js
    └── convert-stitch-to-next.js
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Railway PostgreSQL database (or any PostgreSQL instance)

### 1. Backend Setup

```bash
cd E:\SkillSwap\backend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

Create `backend/.env` file:

```env
DATABASE_URL="postgresql://postgres:nBuVuXisstyHQAflhAJjregSMiiUFcIG@postgres.railway.internal:5432/railway"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
```

**⚠️ IMPORTANT**: If connecting from your local Windows machine, you may need to replace `postgres.railway.internal` with the **external Railway host** provided in your Railway dashboard (usually something like `roundhouse.proxy.rlwy.net`).

Example corrected URL:
```env
DATABASE_URL="postgresql://postgres:nBuVuXisstyHQAflhAJjregSMiiUFcIG@roundhouse.proxy.rlwy.net:12345/railway"
```

#### Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

This creates the database tables (User, Skill, Trade, Ledger).

#### Seed demo data

```bash
node prisma/seed.js
```

This creates 4 demo users:
- **alice@skillswap.com** / password123 (Python tutor, 0 credits)
- **bob@skillswap.com** / password123 (Plumber, 2 credits)
- **carol@skillswap.com** / password123 (Gardener, 1 credit)
- **david@skillswap.com** / password123 (Piano teacher, 3 credits)

#### Start backend server

```bash
node index.js
```

Backend will run on **http://localhost:5000**

### 2. Frontend Setup

Open a **new terminal** (keep backend running).

```bash
cd E:\SkillSwap\frontend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Start development server

```bash
npm run dev
```

Frontend will run on **http://localhost:3000**

## 📱 Using the Application

### 1. Access the app

Open http://localhost:3000 in your browser.

### 2. Login

Click **Login** and use one of the demo accounts:
- Email: `alice@skillswap.com`
- Password: `password123`

### 3. Explore features

- **Dashboard**: View your balance, skills, and nearby users on the map
- **Map Markers**: Click on nearby users to see their profiles and request trades
- **Profile**: Edit your skills (offered/needed) and location
- **Ledger**: View your transaction history

### 4. Complete a trade

1. Go to Dashboard
2. Click a marker on the map showing a nearby user
3. Click "Request" on the popup card
4. Trade request is created (pending)
5. To complete: use Postman/curl to call `POST /api/trades/:id/complete` (or add completion UI)

## 🔧 API Endpoints

### Authentication

- `POST /api/signup` - Register new user
  - Body: `{ name, email, password, lat?, lng? }`
  - Returns: `{ token, user }`

- `POST /api/login` - Authenticate user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Users

- `GET /api/me` - Get current user profile (requires auth)
- `PUT /api/me` - Update profile (requires auth)
  - Body: `{ name?, lat?, lng?, radiusKm?, skills? }`
- `GET /api/users/nearby?lat=&lng=&radiusKm=` - Find nearby users

### Trades

- `POST /api/trades` - Create trade request (requires auth)
  - Body: `{ providerId, requesterId, skill, hours }`
- `GET /api/trades` - Get all trades for current user (requires auth)
- `POST /api/trades/:id/complete` - Complete trade (requires auth)
  - Creates ledger entries and updates balances atomically
- `DELETE /api/trades/:id` - Cancel pending trade (requires auth)

### Ledger

- `GET /api/ledger` - Get ledger for current user (requires auth)
- `GET /api/ledger/:userId` - Get ledger for specific user

## 🎨 Stitch Integration (Optional)

The project includes fallback components, but you can fetch the latest Stitch design:

### Fetch Stitch export

```bash
set STITCH_API_KEY=AQ.Ab8RN6KcnZ9DcwJBjglqKSadgWKfpUeDvuVZozrAYdoDmEKTmg
node scripts/fetch-stitch.js
```

### Convert to Next.js components

```bash
node scripts/convert-stitch-to-next.js
```

Generated components will be placed in `frontend/components/stitch/` (without overwriting existing files).

## 🧪 Database Schema

### User
- id, name, email (unique), passwordHash
- lat, lng (location coordinates)
- radiusKm (search radius, default 5)
- balance (time credits, default 0)

### Skill
- id, userId, name, kind ("offer" | "need")

### Trade
- id, providerId, requesterId, skill, hours
- status ("pending" | "completed" | "cancelled")
- createdAt, completedAt

### Ledger
- id, userId, change (credit delta), reason
- tradeId (reference), createdAt

## 💡 Development Notes

### Trade Completion Logic

The `POST /api/trades/:id/complete` endpoint uses Prisma transactions to ensure atomicity:

1. Lock and verify trade status is "pending"
2. Check requester balance (allows negative up to -5)
3. Create ledger entries for both provider (+) and requester (-)
4. Update user balances
5. Mark trade as completed

### Nearby User Search

Uses simple bounding box calculation (no PostGIS required for MVP):
- Converts radiusKm to lat/lng deltas
- Filters users within bounding box
- Calculates actual distance using Haversine formula
- Returns sorted by distance

### Security Considerations

- JWT tokens stored in localStorage (use httpOnly cookies in production)
- Passwords hashed with bcrypt
- All secrets loaded from environment variables (never hardcoded)
- CORS enabled for development (restrict in production)

## 🐛 Troubleshooting

### Database connection fails

1. Check that DATABASE_URL in `backend/.env` uses the **external Railway host**
2. Verify Railway database is running: https://railway.app
3. Test connection: `npx prisma studio`

### Map not displaying

1. Ensure user has lat/lng set in profile
2. Check browser console for errors
3. Verify react-leaflet is installed

### API requests fail

1. Check backend is running on port 5000
2. Verify NEXT_PUBLIC_API_URL in `frontend/.env.local`
3. Check browser console Network tab for CORS errors

## 📦 Production Deployment

### Backend (Railway/Heroku/etc)

1. Push code to Git repository
2. Set environment variables in platform dashboard:
   - `DATABASE_URL` (Railway provides this automatically)
   - `JWT_SECRET` (generate a strong secret)
3. Run build command: `npm install && npx prisma migrate deploy`
4. Start command: `node index.js`

### Frontend (Vercel/Netlify)

1. Connect Git repository
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL` (your backend URL)
3. Build command: `npm run build`
4. Deploy

## 📄 License

MIT License - Built for educational and community purposes.

## 🙌 Demo Credentials

| Email                   | Password    | Balance | Skills Offered              |
|-------------------------|-------------|---------|----------------------------|
| alice@skillswap.com     | password123 | 0       | Python, Spanish Tutoring   |
| bob@skillswap.com       | password123 | 2       | Plumbing, Carpentry        |
| carol@skillswap.com     | password123 | 1       | Gardening, Dog Walking     |
| david@skillswap.com     | password123 | 3       | Piano, Guitar Lessons      |

---

**Built with ❤️ for community time-banking**
