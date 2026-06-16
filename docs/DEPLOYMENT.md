# LOLBEANS - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Git
- GitHub account
- Vercel account (free)
- Supabase account (free)

---

## Step 1: Supabase Backend Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Create organization (if first time)
4. Fill in project details:
   - **Name**: lolbeans
   - **Database password**: (save securely)
   - **Region**: Choose closest to your users
5. Wait for project to initialize (5-10 min)

### 1.2 Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `backend/supabase/migrations/001_init_schema.sql`
4. Paste into the query editor
5. Click **Run**
6. Confirm all tables created

### 1.3 Get Connection Keys

1. Go to **Settings** → **API**
2. Copy these values and save them:
   - **Project URL** (your Supabase URL)
   - **anon public** key
   - **service_role** key (keep secret!)

### 1.4 Enable Realtime

1. Go to **Database** → **Publications**
2. Under **supabase_realtime**, ensure these tables are enabled:
   - `player_positions`
   - `rooms`
   - `players_in_room`

---

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend

```bash
# In project root
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

### 2.2 Update Environment Variables

Edit `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://lolbeans.vercel.app/api
```

Replace `your-project` with your Supabase project name and fill in the anon key.

### 2.3 Test Locally

```bash
npm run dev
# Open http://localhost:3000
```

### 2.4 Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial LOLBEANS commit"

# Create repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lolbeans.git
git push -u origin main
```

### 2.5 Deploy to Vercel

1. Go to https://vercel.com
2. Click **New Project**
3. Select **Import from GitHub**
4. Choose your `lolbeans` repository
5. Configure project:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon key
7. Click **Deploy**
8. Wait for deployment to complete (2-3 min)
9. Copy your Vercel URL (e.g., `https://lolbeans.vercel.app`)

---

## Step 3: Backend API Setup (Next.js on Vercel)

### 3.1 Backend Code Already Included

The backend API routes are already in the `backend/api/pages/api/` directory. These will be deployed with the Next.js functions.

### 3.2 Add Backend to Vercel

Option A: Single Repo (Recommended)

1. Move backend files to root or use Vercel monorepo:
   ```bash
   # Your current structure already supports this
   ```

2. Update `vercel.json` in root if needed:
   ```json
   {
     "buildCommand": "npm install && cd frontend && npm run build",
     "outputDirectory": "frontend/dist"
   }
   ```

Option B: Separate Repo

1. Create new GitHub repo for backend
2. Deploy to separate Vercel project
3. Update frontend API URL to point to backend

### 3.3 Environment Variables for Backend

In Vercel project settings, add:
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_KEY`: Your service_role key (keep private!)

---

## Step 4: Testing Multiplayer Locally

### 4.1 Local Backend (Optional)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# This gives you a local database and API
```

### 4.2 Test with Multiple Clients

1. Open http://localhost:3000 in browser tab 1
2. Create a room with player name "Player 1"
3. Copy the room code (e.g., "AB12C")
4. Open http://localhost:3000 in browser tab 2 (incognito)
5. Enter room code with player name "Player 2"
6. Both should see each other in lobby
7. Click "Ready Up" on both
8. Match should start

---

## Step 5: Production Deployment

### 5.1 Environment Check

Verify all environment variables are set in Vercel dashboard:

```
Frontend (.env):
- VITE_SUPABASE_URL ✓
- VITE_SUPABASE_ANON_KEY ✓
- VITE_API_URL ✓

Backend:
- SUPABASE_URL ✓
- SUPABASE_KEY ✓
```

### 5.2 Redeploy

```bash
git add .
git commit -m "Production ready"
git push origin main
```

Vercel automatically redeploys on push.

### 5.3 Verify Deployment

1. Visit https://lolbeans.vercel.app
2. Test room creation
3. Test joining from incognito tab
4. Check browser console for errors

---

## Scaling & Monitoring

### 5.4 Monitor Realtime Usage

In Supabase dashboard:
- **Home** → See current connections
- **Logs** → Real-time request logs
- **Performance** → Database metrics

### 5.5 Upgrade Supabase Plan If Needed

- **Free tier**: Good for ~100 CCU (concurrent users)
- **Pro tier** ($25/mo): Up to 500 CCU
- **Enterprise**: Custom limits

Signs you need to upgrade:
- Realtime latency > 200ms
- Frequent "connection reset" errors
- Database query timeouts

### 5.6 Scale Vercel Functions

- Default: Unlimited serverless functions
- Upgrade to Pro for advanced analytics

---

## Troubleshooting

### Issue: "Cannot connect to Supabase"

**Check:**
1. Verify Supabase URL is correct
2. Verify anon key is correct (not service role key)
3. Check if Supabase project is still running (check dashboard)

### Issue: "Room creation fails"

**Check:**
1. Database migration ran successfully
2. API environment variables set
3. Browser console for detailed error

### Issue: "High latency / desync"

**Check:**
1. Supabase region is close to users
2. Database connection pool (Supabase Pro)
3. Network conditions (try wired connection)

### Issue: "Rooms disappear after 1 hour"

**Fix:**
In `backend/supabase/migrations/001_init_schema.sql`, the rooms have a 1-hour TTL. Extend it:

```sql
-- Update expires_at interval
expires_at timestamp DEFAULT now() + interval '24 hours'
```

Then re-run migration or update manually in SQL Editor.

---

## Advanced: Custom Domain

### 6.1 Add Custom Domain to Vercel

1. Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `lolbeans.com`)
3. Follow DNS instructions
4. Wait for propagation (5-30 min)

### 6.2 SSL Certificate

Vercel auto-provisions SSL. No action needed.

---

## Rollback / Version Control

### 7.1 Rollback to Previous Deployment

1. In Vercel → **Deployments**
2. Find previous deployment
3. Click **Promote to Production**

### 7.2 Tag Releases

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## CI/CD Pipeline

GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`.

### 8.1 Auto-Deploy on Push

Every push to `main` branch triggers:
1. Lint checks
2. Build test
3. Automatic Vercel deployment

### 8.2 Manual Deploy

If CI/CD fails, deploy manually:

```bash
vercel --prod
```

(requires Vercel CLI installed)

---

## Security Checklist

- [ ] Supabase service_role key is **NOT** in code (only in backend env vars)
- [ ] Anon key IS public (used in frontend)
- [ ] Database has row-level security (RLS) enabled (Supabase default)
- [ ] API routes validate input
- [ ] CORS configured if needed
- [ ] Rate limiting enabled on Supabase

---

## Success Metrics

After deployment, test:

✓ Room creation from any browser
✓ Room join with code
✓ Multiplayer sync (< 200ms)
✓ No console errors
✓ Mobile responsiveness
✓ Account sign-up (if implemented)

---

## Next Steps

1. **Customize game content**
   - Update level designs
   - Add more obstacles
   - Create custom models

2. **Add more maps**
   - Duplicate Level1.ts to Level3.ts
   - Modify obstacle layout
   - Test multiplayer

3. **Monitor production**
   - Set up error tracking (Sentry)
   - Add analytics (PostHog)
   - User feedback system

4. **Monetization** (optional)
   - Add cosmetics shop
   - Implement battle pass
   - Premium cosmetics

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database migration ran
- [ ] GitHub repo created and pushed
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Frontend deployed successfully
- [ ] Backend API routes working
- [ ] Realtime sync tested
- [ ] Custom domain added (optional)
- [ ] Monitoring set up (optional)

**Estimated time: 30-45 minutes**

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Babylon.js Docs**: https://doc.babylonjs.com
- **Discord/Community**: (Add your community link)

---

For questions or issues, create an issue on GitHub or contact support.
