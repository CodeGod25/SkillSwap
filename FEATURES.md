# New Features Guide

This document provides an overview of the three major features recently added to SkillSwap:

1. **User Review & Rating System**
2. **Skill Verification & Accreditation**
3. **AI-Powered Proofreading**

---

## 1. User Review & Rating System ⭐

### Overview
Users can leave 1-5 star ratings with optional comments after completing trades. Ratings are automatically aggregated to calculate each user's overall rating, which is displayed throughout the app.

### Features

#### Leaving Reviews
- **Location**: Trades page ([trades.jsx](frontend/pages/trades.jsx))
- **When**: After a trade is marked as complete
- **How**: 
  1. Complete a trade as either provider or requester
  2. Navigate to your Trades page
  3. Find the completed trade
  4. Click the yellow "Leave Review" button
  5. Select 1-5 stars and optionally add a comment (max 500 characters)
  6. Submit the review

#### Rating Protection
- Each user can only review each trade once (prevents spam)
- Only participants in a trade can review it
- Trade must be completed before review can be submitted
- All reviews are permanent

#### Viewing Reviews
- **User Reviews**: GET `/api/reviews/:userId` returns all reviews with statistics:
  - Total number of reviews
  - Average rating
  - Rating distribution (1-5 stars breakdown)
- **Review Status**: Check if you've already reviewed a trade via GET `/api/reviews/trade/:tradeId/check`
- **Pending Reviews**: GET `/api/reviews/pending` shows completed trades you haven't reviewed yet

#### Rating Display
- **Dashboard**: User's rating displayed in SkillsCard with verification badges
- **TownSquare**: Each provider card shows rating with star icon and total trades
- **Profile**: Rating visible in TopNav and profile pages

#### TownSquare Rating Filter
- **Location**: TownSquare page filter section
- **Options**: 
  - All Ratings (default)
  - 3.0+ stars
  - 3.5+ stars
  - 4.0+ stars
  - 4.5+ stars
  - 4.8+ stars (top performers)
- **Effect**: Filters provider list to only show users meeting the minimum rating threshold
- **New Users**: Users with no reviews show "⭐ New" instead of a rating

### API Endpoints

```
POST   /api/reviews                    - Submit a review
GET    /api/reviews/:userId            - Get user's reviews with stats
GET    /api/reviews/trade/:tradeId/check - Check if user reviewed trade
GET    /api/reviews/pending            - Get trades needing reviews
```

### Database Schema

```prisma
model Review {
  id          Int      @id @default(autoincrement())
  reviewerId  Int
  revieweeId  Int
  tradeId     Int
  rating      Int      // 1-5
  comment     String?
  createdAt   DateTime @default(now())
  
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee    User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])
  trade       Trade    @relation(fields: [tradeId], references: [id])
  
  @@unique([tradeId, reviewerId]) // One review per person per trade
  @@index([reviewerId])
  @@index([revieweeId])
  @@index([rating])
}
```

### Rating Calculation
- User.rating field is automatically recalculated when a new review is submitted
- Formula: Simple average of all ratings received
- Displayed with 1 decimal place (e.g., 4.7)

---

## 2. Skill Verification & Accreditation System ✅

### Overview
A two-tier verification system with **mandatory proof requirements** that validates user skills through automatic verification (based on experience) and peer verification (by high-rated community members). All skill verification requests must include proof of competency.

### Proof System

**Required for All Verifications:**
- Users **must** provide proof when requesting skill verification
- Proof can be:
  - **Proof Link**: URL to certificate, portfolio, LinkedIn, professional website
  - **Proof File Upload**: Direct file upload of certificates, diplomas, licenses (JPG, PNG, GIF, PDF - Max 10MB)
  - **Proof Description**: Detailed text description of credentials, experience, or references
- Proof Types:
  - 📜 Certificate / Certification
  - 💼 Portfolio / Work Samples
  - 💬 Testimonial / Reference
  - 🎓 Diploma / Degree
  - ✅ Professional License
  - 🎥 Video Demonstration
  - 📋 Other

**File Upload Features:**
- Secure file upload for proof documents
- Supported formats: JPG, PNG, GIF, PDF
- Maximum file size: 10MB
- Files stored securely on server
- Unique filenames prevent conflicts
- Auto-validation of file types and sizes

**Proof Storage:**
- All proof is securely saved in the database
- Linked to the specific skill being verified
- Can be reviewed by peer verifiers before approving verification

### Auto-Verification Rules

Users can request verification for their skills. The system automatically verifies skills **with proof** if:
- **Expert level** + **5+ years experience** + **Proof provided** → Auto-verified
- **Intermediate or Advanced level** + **2+ years experience** + **Proof provided** → Auto-verified

### Peer Verification

For skills that don't meet auto-verification criteria:
- Skill goes into "pending" status with proof attached
- High-rated users (4.5+ rating) can review the proof and verify the skill
- Admin users (userId === 1) can verify any skill
- Verifier can see:
  - Proof URL (if provided)
  - Proof description
  - Skill level and years of experience
  - User's trade history and rating

### Features

#### Requesting Verification
- **Location**: Profile page ([profile.jsx](frontend/pages/profile.jsx))
- **How**:
  1. Go to Profile page
  2. Find an offered skill in "Skills I Offer" section
  3. Set the skill level (Beginner/Intermediate/Advanced/Expert)
  4. Set years of experience
  5. Save profile changes
  6. Click the blue "Get Verified" button next to the skill
  7. **Proof Modal Opens** - Fill out required proof information:
     - Select proof type (Certificate, Portfolio, Testimonial, etc.)
     - Enter proof link (optional): URL to certificate, portfolio, LinkedIn
     - Enter proof description (required): Detailed explanation of your credentials
  8. Submit verification request
  9. System will either auto-verify (if criteria met) or mark as "pending" for peer review

**Note**: Proof is mandatory - you cannot request verification without providing either a proof link or description.

#### Verification Status Badges
- **Verified**: Blue badge with checkmark icon (✓)
- **Pending**: Yellow badge with clock icon (⏰)
- **Unverified**: No badge, "Get Verified" button available

#### Badge Locations
- **Profile Page**: Shows verification status for all offered skills
- **Dashboard**: SkillsCard displays verified badge next to skill level
- **TownSquare**: Provider cards show verified badge for each skill

#### Verifying Others' Skills
- **Eligibility**: Must have 4.5+ rating or be admin
- **How**: Call GET `/api/skills/verification-eligible` to see skills you can verify
- **Action**: POST `/api/skills/:skillId/verify` with optional note

### API Endpoints

```
POST   /api/skills/verify-request          - Request skill verification (requires proof)
       Body: { 
         skillId, 
         proofUrl (optional),
         proofType (optional),
         proofDescription (required if no proofUrl)
       }
       
POST   /api/skills/:skillId/verify         - Peer verify a skill (requires 4.5+ rating)
GET    /api/skills/verification-eligible   - Get skills you can verify
```

### Database Schema (Skill Model)

```prisma
model Skill {
  id                   Int     @id @default(autoincrement())
  userId               Int
  name                 String
  kind                 String  // 'offer' or 'need'
  isVerified           Boolean @default(false)
  level                String  @default("beginner") // beginner, intermediate, advanced, expert
  verifiedBy           String? // Who verified it (auto or username)
  yearsOfExp           Int     @default(0)
  
  // Proof System Fields
  proofUrl             String? // Link to certificate, portfolio, etc.
  proofType            String? // certificate, portfolio, testimonial, diploma, license, other
  proofDescription     String? @db.Text // Description of proof
  verificationStatus   String  @default("unverified") // unverified, pending, verified, rejected
  verificationNotes    String? @db.Text // Notes from verifier
  
  user                 User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([kind])
  @@index([verificationStatus])
}
```

**Verification Status Values:**
- `unverified`: Skill added but no verification requested
- `pending`: Verification requested with proof, awaiting peer review
- `verified`: Skill has been verified (auto or peer)
- `rejected`: Verification request was rejected (future feature)

### Auto-Verification Logic

```javascript
// Expert with significant experience
if (skill.level === 'expert' && skill.yearsOfExp >= 5) {
  return 'Auto-verified: Expert (5+ years)';
}

// Intermediate/Advanced with solid experience
if ((skill.level === 'intermediate' || skill.level === 'advanced') && skill.yearsOfExp >= 2) {
  return 'Auto-verified: Experienced';
}

// Otherwise, needs peer verification
return 'Pending verification';
```

### Benefits
- **Trust Signal**: Verified skills are more credible in TownSquare
- **Quality Control**: Prevents skill inflation
- **Community Validation**: Peer review ensures accuracy
- **Automatic for Experts**: No manual review needed for experienced users

---

## 3. AI-Powered Proofreading ✨

### Overview
AI-powered text improvement using GPT-3.5-turbo to enhance grammar, clarity, tone, and style in review comments, skill descriptions, and trade messages.

### Features

#### AI Improvement Button
- **Appearance**: Purple-pink gradient button with sparkle icon
- **Label**: "✨ AI Improve"
- **Location**: Currently in ReviewModal, can be added anywhere text input exists

#### Context-Aware Suggestions
The AI adapts its suggestions based on context:
- **Review Context**: Makes comments constructive, respectful, and specific
- **Skill Context**: Professional descriptions highlighting expertise
- **Trade Context**: Clear and polite trade request messages
- **General Context**: Grammar, clarity, and tone improvements

#### Suggestion Modal
When you click "AI Improve":
1. Text is sent to AI for analysis
2. Modal shows:
   - Original text (red background)
   - Improved text (green background)
   - Specific suggestions by type (grammar, clarity, tone, style)
   - Daily usage counter
3. Choose to:
   - "Use Improved Text" - Replaces your text with AI version
   - "Keep Original" - Dismisses suggestions

#### Rate Limiting
- **Limit**: 10 AI improvements per user per day
- **Reset**: Every 24 hours
- **Display**: Remaining count shown in suggestion modal
- **Response**: 429 error with friendly message when limit exceeded

#### AI Not Configured Mode
If OpenAI API key is not set in backend .env:
- Button still works but returns mock suggestions
- Shows info message: "AI proofreading is not configured"
- No actual AI calls made

### API Endpoints

```
POST   /api/ai/proofread    - Proofread text (context: review/skill/trade/general)
GET    /api/ai/usage        - Get daily usage statistics
```

### Usage in Code

```jsx
import AIProofreadButton from '../components/stitch/AIProofreadButton';

// In your component:
<AIProofreadButton
  text={yourTextVariable}
  context="review"  // or 'skill', 'trade', 'general'
  onApprove={(improvedText) => setYourTextVariable(improvedText)}
/>
```

### Integration Points

Currently integrated in:
- **ReviewModal**: Comment field for reviews

Can be added to:
- Trade request messages
- Skill descriptions
- User bio/about sections
- Message composer
- Any text input where quality matters

### Configuration

To enable AI proofreading, add to `backend/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Without this key, the feature works but shows placeholder suggestions.

### Cost Considerations
- Uses GPT-3.5-turbo (cost-effective model)
- Max 500 tokens per request
- Rate limited to 10 requests per user per day
- Estimated cost: ~$0.001 per request

### Error Handling
- **Rate Limit (429)**: Shows friendly message about daily limit
- **Quota Exceeded (503)**: Server-side quota exceeded, try later
- **API Error (500)**: Generic error, retry
- **Invalid Input (400)**: Text too long (>2000 chars) or empty

---

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Add OpenAI API key to `.env` (optional):
   ```
   OPENAI_API_KEY=sk-...
   ```

3. Run database migration (if not already done):
   ```bash
   node add-review-table.js
   npx prisma generate
   ```

4. Start backend:
   ```bash
   node index.js
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

### Testing the Features

#### Test Review System
1. Create a trade between two users
2. Mark the trade as complete
3. Go to Trades page
4. Click "Leave Review" on the completed trade
5. Select rating and add comment
6. Submit review
7. Verify user's rating updated in TownSquare
8. Test the rating filter in TownSquare

#### Test Skill Verification
1. Go to Profile page
2. Add a new skill (e.g., "Python Programming")
3. Set level to "Expert" and years to "6"
4. Save profile
5. Click "Get Verified" button
6. Should see "Auto-verified: Expert (5+ years)" message
7. Verify blue checkmark appears on skill everywhere

#### Test AI Proofreading
1. Go to Trades page
2. Click "Leave Review" on a completed trade
3. Type some text with typos: "this was grate! realy helpfull"
4. Click the purple "✨ AI Improve" button
5. Review suggestions modal appears
6. Click "Use Improved Text"
7. Text is replaced with improved version
8. Submit review with improved text

---

## Files Created/Modified

### Backend Files
- `backend/routes/reviews.js` - Review API endpoints
- `backend/routes/skillVerification.js` - Skill verification endpoints with proof validation
- `backend/routes/ai.js` - AI proofreading endpoints
- `backend/routes/upload.js` - File upload endpoints for proof documents
- `backend/prisma/schema.prisma` - Added Review model and proof system fields to Skill model
- `backend/add-review-table.js` - Migration script for Review table
- `backend/add-proof-fields.js` - Migration script for proof system (5 new fields)
- `backend/index.js` - Registered new routes and static file serving
- `backend/package.json` - Added openai and multer dependencies

### Frontend Files
- `frontend/components/stitch/ReviewModal.jsx` - Review submission UI
- `frontend/components/stitch/ProofModal.jsx` - Proof submission UI with file upload
- `frontend/components/stitch/AIProofreadButton.jsx` - Reusable AI button
- `frontend/components/stitch/SkillsCard.jsx` - Updated with verification badges
- `frontend/pages/profile.jsx` - Added verification UI, removed "Offer a New Skill" section
- `frontend/pages/trades.jsx` - Added review integration
- `frontend/pages/townsquare.jsx` - Added rating filter and display
- `frontend/lib/api.js` - Added API methods for all features

---

## Architecture Notes

### Review System
- Uses Prisma ORM for database operations
- Implements unique constraint: one review per user per trade
- Automatic rating recalculation on new review
- Indexed on reviewerId, revieweeId, and rating for fast queries

### Skill Verification
- Two-tier system: auto-verify + peer-verify
- Auto-verify prevents manual work for experienced users
- Peer-verify requires high community standing (4.5+ rating)
- Prevents gaming the system
- Mandatory proof system ensures credibility

### Proof System Benefits
- **Trust Building**: Users must provide evidence of claimed skills
- **Flexible Evidence**: Accepts URLs (certificates, portfolios, LinkedIn) or text descriptions
- **Audit Trail**: All proof stored permanently with verification decisions
- **Fraud Prevention**: Prevents false skill claims without blocking legitimate users
- **Quality Assurance**: Auto-verification still fast but requires proof first
- **Transparent Process**: Users see exactly what proof is needed before submitting

### AI Proofreading
- Context-aware prompts for different use cases
- Rate limiting prevents abuse and controls costs
- Graceful degradation when API key not configured
- Reusable component for easy integration

---

## Future Enhancements

### Potential Improvements
1. **Review System**
   - Add review photos/evidence
   - Review reply feature
   - Report inappropriate reviews
   - Review helpfulness voting

2. **Skill Verification**
   - LinkedIn skill verification integration
   - Skill endorsements (similar to LinkedIn)
   - Verification expiration (require re-verification after time)
   - Peer verifier dashboard for reviewing pending verifications
   - Proof attachment uploads (images, PDFs)

3. **AI Proofreading**
   - Support more languages
   - Custom tone selection (formal/casual/friendly)
   - Writing style templates
   - Integration in more text inputs
   - AI-powered skill matching suggestions

---

## Support

For issues or questions:
1. Check console logs in browser DevTools
2. Check backend terminal for error messages
3. Verify database connection is working
4. Ensure OpenAI API key is valid (if using AI features)
5. Check rate limits haven't been exceeded

