# SkillSwap — Time-Banking Community Platform

SkillSwap is Hyper-Local Time-Banking Economy Platform where users can trade credits and/or exchange skills with the help of "Time Credits" (1hr = 1c). Built with React/Next.js frontend and Express/Prisma backend connected to Railway PostgreSQL.

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

### Prerequisites

- Node.js 18+ installed
- Railway PostgreSQL database (or any PostgreSQL instance)

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
