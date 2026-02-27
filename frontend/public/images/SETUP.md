## 🖼️ Hero Image Setup Instructions

I've updated the landing page to display your community image! Here's how to add it:

### Step 1: Save the Image
1. **Right-click** on the image you shared (the people socializing outdoors)
2. **Save it as**: `hero-community.jpg`
3. Place it in: `D:\SkillSwap\frontend\public\images\hero-community.jpg`

### Step 2: What's Already Done ✅
- ✅ Created `/public/images/` folder structure
- ✅ Updated `HeroMarketing.jsx` to use Next.js Image component
- ✅ Added proper image sizing and optimization
- ✅ Added gradient overlay for better text readability
- ✅ Image displays with rounded corners and white border (matching Stitch design)
- ✅ Responsive sizing for all screen sizes

### Features Added:
- **Next.js Image optimization** - Automatic lazy loading and optimization
- **Gradient overlay** - Ensures the floating notification card is readable
- **Priority loading** - Hero image loads first for better UX
- **Responsive** - Looks great on mobile and desktop
- **Matches Stitch design** - Same styling as your original design

### If Image Doesn't Appear:
If you see a broken image icon after saving:
1. Make sure the file is named exactly: `hero-community.jpg`
2. Confirm it's in: `frontend/public/images/`
3. Restart the frontend dev server: `Ctrl+C` then `npm run dev`
4. Hard refresh your browser: `Ctrl+Shift+R`

### Alternative: Use a Stock Image
If you'd like to use a different image temporarily, you can download a free stock photo of people socializing from:
- Unsplash.com
- Pexels.com

Just save it as `hero-community.jpg` in the images folder!
