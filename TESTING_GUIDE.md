# SkillSwap - Complete Testing Guide

## 🎯 Battle Test Plan: 2 Users Testing All Features

**Servers Running:**
- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:3000 ✅

---

## 📋 Test Scenario Overview

We'll create 2 users:
- **User A (Alice)**: Guitar Teacher, needs Plumbing
- **User B (Bob)**: Plumber, needs Guitar Lessons

---

## Step 1: Create User A (Alice)

### 1.1 Sign Up
1. Go to http://localhost:3000
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in:
   - **Name**: Alice Thompson
   - **Email**: alice@skillswap.com
   - **Password**: password123
4. Click **"Sign Up"**

### 1.2 Complete Profile
After signup, you'll be on the Edit Profile page:

1. **Set Location**:
   - Click "Use My Current Location" button
   - OR manually enter:
     - **Latitude**: 40.7128 (New York)
     - **Longitude**: -74.0060
   - **Search Radius**: 10 km

2. **Add Skills I Offer**:
   - In the "Add New Skill" section:
     - **Skill Name**: Guitar Lessons
     - **Level**: Expert
     - **Years**: 8
   - Click "Add Skill"

3. **Add Skills I Need**:
   - Type: Plumbing
   - Click "Add"

4. Click **"Save Changes"**
5. You'll be redirected to Dashboard

### 1.3 Verify Guitar Lessons Skill
1. Go to **Edit Profile** (from top nav)
2. Find "Guitar Lessons" skill card
3. Click **"Get Verified"** button
4. In the Proof Modal:
   - **Proof Type**: Select "Certificate"
   - **Proof Link**: https://example.com/certificate.pdf
   - **Proof Description**: "Berklee College of Music - Guitar Performance Certification"
   - **Upload File** (optional): Choose a PDF/image
   - Click **"Submit Verification Request"**
5. Status should change to "Pending"

### 1.4 Try AI Verification (Optional)
1. In Edit Profile, find the pending "Guitar Lessons" skill
2. Click **"AI Verify"** button (purple)
3. Confirm the AI analysis
4. AI will analyze and potentially auto-verify if confidence is high

---

## Step 2: Create User B (Bob)

### 2.1 Logout from Alice's Account
1. Click profile icon in top right
2. Click **"Logout"**

### 2.2 Sign Up as Bob
1. Go to http://localhost:3000/signup
2. Fill in:
   - **Name**: Bob Wilson
   - **Email**: bob@skillswap.com
   - **Password**: password123
3. Click **"Sign Up"**

### 2.3 Complete Bob's Profile
1. **Set Location** (nearby Alice):
   - **Latitude**: 40.7580
   - **Longitude**: -73.9855
   - **Search Radius**: 10 km

2. **Add Skills I Offer**:
   - **Skill Name**: Plumbing Services
   - **Level**: Advanced
   - **Years**: 5
   - Click "Add Skill"

3. **Add Skills I Need**:
   - Type: Guitar Lessons
   - Click "Add"

4. Click **"Save Changes"**

### 2.4 Verify Plumbing Skill
1. Go to Edit Profile
2. Click "Get Verified" on Plumbing Services
3. Fill in proof:
   - **Type**: License
   - **Link**: https://example.com/plumbing-license.pdf
   - **Description**: "NY State Professional Plumber License #12345"
4. Submit and optionally try AI Verify

---

## Step 3: Test Discovery Features

### 3.1 TownSquare (Bob's View)
1. Click **"TownSquare"** from Dashboard
2. You should see Alice in the providers list
3. **Verify you can see**:
   - ✅ Alice's name
   - ✅ Her rating (0.0 for new user)
   - ✅ Distance from you
   - ✅ "Guitar Lessons" skill with level badge
   - ✅ Verification badge if verified

### 3.2 View Alice's Profile
1. Click **"View Profile"** on Alice's card
2. **Verify the profile page shows**:
   - ✅ Alice's name and avatar
   - ✅ Rating and trade count
   - ✅ Location distance
   - ✅ Skills Offered section with "Guitar Lessons"
   - ✅ Skills Needed section with "Plumbing"
   - ✅ "Send Message" button
   - ✅ Reviews section (empty for new user)

---

## Step 4: Test Trade Requests

### 4.1 Request Service with Credits (Bob → Alice)
From Alice's profile or TownSquare:

1. Click **"Request"** button on Guitar Lessons skill
2. In the modal:
   - **Type**: Should be "Credits"
   - **Hours**: 2
   - **Message**: "Hi Alice! I'd like to learn guitar basics. Available weekends?"
3. Click **"Send Trade Request"**
4. **Result**: 
   - ✅ Success message appears
   - ✅ Your balance decreases by 20 credits (10 per hour × 2)

### 4.2 Request Skill Exchange (Bob → Alice)
1. Go to Alice's profile
2. Click **"Exchange"** button on Guitar Lessons
3. In the modal:
   - **Type**: Should be "Exchange"
   - **Your Skill**: Select "Plumbing Services"
   - **Hours**: 1
   - **Message**: "How about a skill swap? I can fix your pipes!"
4. Click **"Send Trade Request"**

---

## Step 5: Test Trade Management (Alice's View)

### 5.1 Logout and Login as Alice
1. Logout from Bob's account
2. Login as alice@skillswap.com

### 5.2 View Pending Trades
1. Go to **Dashboard**
2. Check **"Trades Overview"** section
3. You should see:
   - ✅ 2 pending trade requests from Bob
   - ✅ One credit-based request
   - ✅ One exchange request

### 5.3 Accept Credit Trade
1. Click on **"My Trades"** or view trade details
2. Find Bob's credit request for Guitar Lessons
3. Click **"Accept"**
4. **Result**:
   - ✅ Trade status changes to "accepted"
   - ✅ Your balance increases by 20 credits

### 5.4 Complete the Trade
1. Go to trades page
2. Find the accepted trade
3. Click **"Mark as Complete"**
4. **Result**:
   - ✅ Trade status becomes "completed"
   - ✅ You can now review Bob

---

## Step 6: Test Messaging System

### 6.1 Send Message to Bob (Alice → Bob)
1. Go to **Dashboard** or **TownSquare**
2. Find Bob in the providers list or go to his profile
3. Click **"Send Message"**
4. Type: "Thanks for the trade request! When works best for you?"
5. Click Send

### 6.2 Read Message (Bob's View)
1. Logout and login as Bob
2. Click **"Messages"** in top nav
3. You should see:
   - ✅ Message from Alice
   - ✅ Unread indicator if not read
4. Click to open conversation
5. Reply: "Great! How about Saturday at 2pm?"

### 6.3 Continue Conversation (Alice's View)
1. Logout and login as Alice
2. Go to Messages
3. Check for Bob's reply
4. Continue the conversation

---

## Step 7: Test Review & Rating System

### 7.1 Review Bob (Alice's View)
After completing a trade with Bob:

1. Go to **"My Trades"**
2. Find the completed trade with Bob
3. Click **"Leave Review"** or review button
4. Fill in:
   - **Rating**: 5 stars ⭐⭐⭐⭐⭐
   - **Comment**: "Excellent communication! Very professional and on time."
5. Submit review
6. **Result**:
   - ✅ Review submitted successfully
   - ✅ Bob's rating updates

### 7.2 Review Alice (Bob's View)
1. Logout and login as Bob
2. Go to My Trades
3. Find completed trade with Alice
4. Click review button
5. Fill in:
   - **Rating**: 5 stars
   - **Comment**: "Great teacher! Very patient and explained everything clearly."
6. Submit
7. **Result**:
   - ✅ Alice's rating updates

### 7.3 View Reviews on Profile
1. Go to Alice's profile (as Bob)
2. Scroll down to **Reviews section**
3. **Verify you can see**:
   - ✅ Average rating with stars
   - ✅ Total review count
   - ✅ Rating distribution bars
   - ✅ Individual review cards with comments
   - ✅ Reviewer name and date

---

## Step 8: Test Credit System

### 8.1 Check Starting Balance
- New users start with: **100 credits**
- After accepting a 2-hour trade: **+20 credits** (provider)
- After requesting a 2-hour trade: **-20 credits** (requester)

### 8.2 View Ledger History
1. Go to Dashboard
2. Check **Time Credits section**
3. You should see:
   - ✅ Current balance
   - ✅ Transaction history
   - ✅ "Earned for..." or "Spent for..." entries

### 8.3 Test Multiple Trades
Create several trades to see credit transfers:
- Bob requests Guitar Lessons (2 hours) → -20 credits
- Alice accepts → +20 credits
- Alice requests Plumbing (1 hour) → -10 credits
- Bob accepts → +10 credits

---

## Step 9: Test Community Features

### 9.1 Browse Community
1. Click **"Community"** from Dashboard
2. **Test filters**:
   - Search by skill name
   - Adjust distance radius
   - See nearby users

### 9.2 View Different Profiles
1. Click "View Profile" on various users
2. Verify each shows:
   - ✅ Unique user data
   - ✅ Their skills
   - ✅ Their reviews
   - ✅ Correct distance

---

## Step 10: Test File Upload (Proof Documents)

### 10.1 Add New Skill with File Upload
1. As Alice, go to Edit Profile
2. Add new skill: "Piano Lessons"
3. Save changes
4. Click "Get Verified" on Piano Lessons
5. In proof modal:
   - Select proof type: "Portfolio"
   - Add description
   - **Click "Choose File"**
   - Select an image or PDF (max 10MB)
   - File name appears with size
   - Submit

### 10.2 Verify File Upload
1. Check that:
   - ✅ File uploads successfully
   - ✅ Proof status changes to "pending"
   - ✅ File size validation works (try 11MB file - should reject)
   - ✅ File type validation works (try .exe or .txt - should reject)

---

## Step 11: Test AI Verification

### 11.1 Submit Proof for AI Analysis
1. Add a skill with detailed proof:
   - **Skill**: Web Development
   - **Level**: Expert
   - **Years**: 5
   - **Proof Type**: Portfolio
   - **Link**: https://github.com/myprofile
   - **Description**: "Full-stack developer with 5+ years experience. Built 50+ websites. University degree in Computer Science."

2. Submit verification request

3. Click **"AI Verify"** button

4. **Verify AI Response**:
   - ✅ Shows recommendation (VERIFY/PENDING/REJECT)
   - ✅ Shows confidence level (HIGH/MEDIUM/LOW)
   - ✅ Shows reasoning
   - ✅ Shows suggestions (if not verified)
   - ✅ Auto-verifies if HIGH confidence + VERIFY

---

## Step 12: Test Edge Cases

### 12.1 Empty States
1. Create a new user with no skills
2. Verify:
   - ✅ Dashboard shows empty state messages
   - ✅ Profile shows "No skills" message
   - ✅ TownSquare works with 0 skills

### 12.2 Location Without GPS
1. Edit profile without clicking "Detect Location"
2. Manually enter invalid coordinates
3. Verify error handling

### 12.3 Duplicate Reviews
1. Try to review the same trade twice
2. Verify:
   - ✅ Error message appears
   - ✅ Duplicate review is prevented

### 12.4 Trade with Insufficient Credits
As Bob (if balance is low):
1. Try to request a service that costs more than your balance
2. Verify:
   - ✅ Error message shows
   - ✅ Trade is not created

---

## 🎯 Complete Feature Checklist

Use this checklist to track your testing:

### Authentication & Profile
- [ ] Sign up new user
- [ ] Login existing user
- [ ] Logout
- [ ] Edit profile (name, location, radius)
- [ ] Detect location with GPS
- [ ] Add skills (offer)
- [ ] Add skills (need)
- [ ] Remove skills
- [ ] View own profile

### Skill Verification
- [ ] Submit verification request with proof
- [ ] Submit proof with file upload
- [ ] Use AI verification
- [ ] Auto-verification for eligible skills
- [ ] View verification status (unverified, pending, verified)
- [ ] See verification badges on profile

### Discovery & Search
- [ ] Browse TownSquare
- [ ] Filter by skills
- [ ] Filter by distance
- [ ] Filter by rating
- [ ] View provider profiles
- [ ] See distance from current location

### Trades
- [ ] Request service with credits
- [ ] Request skill exchange
- [ ] View pending trades
- [ ] Accept/Reject trades
- [ ] Mark trade as complete
- [ ] View trade history

### Credits & Ledger
- [ ] View current balance
- [ ] Credits deducted when requesting
- [ ] Credits added when providing
- [ ] View transaction history
- [ ] Ledger shows all transactions

### Messaging
- [ ] Send message to user
- [ ] Receive messages
- [ ] Read/unread indicators
- [ ] Reply to messages
- [ ] Message threading

### Reviews & Ratings
- [ ] Leave review after completed trade
- [ ] Rate 1-5 stars
- [ ] Add written comment
- [ ] View reviews on profile
- [ ] See average rating
- [ ] See rating distribution
- [ ] User rating updates automatically

### Community
- [ ] Browse community members
- [ ] Search by name/skill
- [ ] Adjust distance radius
- [ ] View member profiles
- [ ] Contact members

### File Upload
- [ ] Upload proof documents
- [ ] File type validation (JPG, PNG, GIF, PDF only)
- [ ] File size validation (10MB max)
- [ ] View uploaded file name

### UI/UX
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications
- [ ] Empty states
- [ ] Navigation works

---

## 🐛 Issues to Watch For

While testing, check for these common issues:

1. **Location Issues**:
   - GPS permission denied
   - Invalid coordinates
   - Distance calculation accuracy

2. **Credit Calculations**:
   - Negative balances
   - Incorrect credit transfers
   - Missing ledger entries

3. **Trade Status**:
   - Trades stuck in pending
   - Can't mark as complete
   - Status not updating

4. **Reviews**:
   - Duplicate reviews
   - Rating not updating
   - Missing reviews

5. **Messaging**:
   - Messages not sending
   - Notifications not working
   - Message order

6. **Verification**:
   - Proof modal not opening
   - File upload failures
   - AI verification errors

---

## 💡 Testing Tips

1. **Open Two Browser Windows**: Use Chrome for Alice and Firefox/Edge for Bob (or use Incognito mode)

2. **Keep Both Users Logged In**: Easier to switch between accounts

3. **Check Console Logs**: Open Developer Tools (F12) to see any errors

4. **Take Screenshots**: Document any bugs you find

5. **Test Systematically**: Go through each feature one by one

6. **Test Edge Cases**: Try invalid inputs, empty fields, etc.

7. **Clear Cache**: If something seems broken, try clearing browser cache

---

## 🎉 Success Criteria

The app is working correctly if:
- ✅ Both users can sign up and create profiles
- ✅ They can find each other based on location
- ✅ They can view each other's profiles with all details
- ✅ Trades can be created, accepted, and completed
- ✅ Credits transfer correctly
- ✅ Messages send and receive properly
- ✅ Reviews appear on profiles
- ✅ Ratings update automatically
- ✅ Skills can be verified with proof
- ✅ AI verification analyzes proof
- ✅ File uploads work for proof documents
- ✅ All UI elements render correctly
- ✅ No console errors during normal use

---

## 📝 Ready to Start?

Follow the steps above in order. Start with Step 1 (Create Alice) and work your way through!

**Current Status:**
- Backend: ✅ Running on http://localhost:5000
- Frontend: ✅ Running on http://localhost:3000

**Happy Testing! 🚀**
