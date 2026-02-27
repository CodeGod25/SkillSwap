# SkillSwap - Quick Test Reference

## Quick Setup (5 Minutes)

### User A - Alice (Guitar Teacher)
```
Email: alice@skillswap.com
Password: password123
Location: 40.7128, -74.0060 (NYC)
Offers: Guitar Lessons (Expert, 8 years)
Needs: Plumbing
```

### User B - Bob (Plumber)
```
Email: bob@skillswap.com  
Password: password123
Location: 40.7580, -73.9855 (NYC - nearby)
Offers: Plumbing Services (Advanced, 5 years)
Needs: Guitar Lessons
```

## Quick Test Sequence

### 1. Create Both Users (5 min)
- Sign up Alice → Add skills → Save
- Logout → Sign up Bob → Add skills → Save

### 2. Test Discovery (2 min)
- As Bob: TownSquare → See Alice → View Profile

### 3. Test Trades (3 min)
- As Bob: Request Guitar Lessons (Credits, 2 hours)
- As Alice: View trades → Accept → Complete

### 4. Test Messaging (2 min)
- As Alice: Message Bob
- As Bob: Reply to Alice

### 5. Test Reviews (2 min)
- As Alice: Review completed trade with Bob (5 stars)
- As Bob: Check profile to see review

### 6. Test Verification (3 min)
- As Alice: Add skill → Get Verified → Submit proof
- Try AI Verify

### 7. Test File Upload (2 min)
- Add skill → Get Verified → Choose File → Upload

---

## Feature Quick Links

Once logged in:

| Feature | Location |
|---------|----------|
| Add Skills | Edit Profile → Skills I Offer → Add New Skill |
| Get Verified | Edit Profile → Find Skill → Get Verified button |
| View Profile | TownSquare/Community → View Profile |
| Request Trade | View Profile → Request/Exchange button |
| Accept Trades | Dashboard → Trades Overview |
| Send Message | View Profile → Send Message |
| Leave Review | My Trades → Completed → Leave Review |
| View Credits | Dashboard → Time Credits section |

---

## Test Data Shortcuts

### Quick Skills to Add
**For Testing Variety:**
- Guitar Lessons (Music)
- Plumbing Services (Home)
- Web Development (Tech)
- Yoga Classes (Fitness)
- Spanish Tutoring (Education)
- Photography (Creative)
- Dog Walking (Outdoor)

### Proof Examples
- **Certificate**: https://example.com/cert.pdf
- **Portfolio**: https://github.com/username
- **License**: https://example.com/license.pdf
- **Testimonial**: "John Doe: Excellent service!"

---

## Expected Credit Flow

| Action | Alice Credits | Bob Credits |
|--------|---------------|-------------|
| Start | 100 | 100 |
| Bob requests 2hr lesson | 100 | 80 (-20) |
| Alice accepts | 100 | 80 |
| Alice completes | 120 (+20) | 80 |

---

## Console Commands for Testing

Open browser console (F12) and check for:

```javascript
// Should see successful API calls
✅ POST /api/auth/signup - 201
✅ POST /api/auth/login - 200  
✅ GET /api/me - 200
✅ GET /api/users/nearby - 200
✅ POST /api/trades - 201
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Can't see other user | Check location is set for both users |
| Trade request fails | Check sufficient credits |
| AI Verify button missing | Skill must have proof first |
| File upload rejected | Check file type (JPG/PNG/GIF/PDF) and size (< 10MB) |
| Profile not loading | Check user ID in URL is correct |

---

## 20-Minute Full Test Script

**Time-boxed complete test:**

1. **0-5 min**: Create Alice, add profile, add skills
2. **5-7 min**: Submit verification with proof
3. **7-10 min**: Create Bob, add profile, add skills
4. **10-12 min**: Bob finds Alice in TownSquare, views profile
5. **12-14 min**: Bob requests trade (credits)
6. **14-15 min**: Alice accepts and completes trade
7. **15-16 min**: Test messaging between users
8. **16-17 min**: Both users leave reviews
9. **17-18 min**: Test AI verification
10. **18-19 min**: Test file upload
11. **19-20 min**: Check credits, ledger, ratings all updated

---

## Servers

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

Both running ✅

---

## Browser Tips

- Use 2 windows: Chrome (Alice) + Firefox (Bob)
- Or use Chrome + Chrome Incognito
- Keep Dev Tools open (F12) to catch errors
- Check Network tab for failed requests
