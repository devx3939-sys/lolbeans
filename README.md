# LOLBEANS

**A chaotic, fun, multiplayer browser-based obstacle course party game inspired by Fall Guys.**

Play online with friends, navigate obstacle courses, and compete to be the last player standing. Built with React, Babylon.js, and Supabase. Deployed on Vercel.

## 🎮 Features

- **2-12 Player Multiplayer**: Join rooms by code, compete in real-time
- **2 Unique Maps**: Candy Garden (beginner) and Storm Factory (advanced)
- **Physics-Based Gameplay**: Colorful, chaotic, and fun
- **Browser-Based**: Play anywhere, no downloads
- **Real-Time Synchronization**: Smooth multiplayer with < 200ms latency
- **Mobile Friendly**: Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Local Development

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/lolbeans.git
cd lolbeans

# Install frontend dependencies
cd frontend
npm install

# Create .env.local (see DEPLOYMENT.md)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
# Open http://localhost:3000
```

### Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step Vercel + Supabase setup.

**TL;DR**: ~30 minutes to have a playable online game running.

## 🎨 Game Overview

### Gameplay

1. **Create or join a room** with a 5-character code
2. **Ready up** with other players (2-12)
3. **Race through obstacles** for 2-3 minutes
4. **First to finish** wins!

### Maps

**Candy Garden** (Beginner)
- Colorful candy-themed obstacles
- Clear patterns, good for learning
- Mix of challenges: timing, cooperation, risk/reward

**Storm Factory** (Advanced)
- Industrial, chaotic theme
- Tighter timing, more multiplayer interference
- High-score potential for skilled players

## 🏗️ Project Structure

```
lolbeans/
├── frontend/                 # React + Babylon.js frontend
│   ├── src/
│   │   ├── components/       # UI screens
│   │   ├── systems/          # Game engine
│   │   ├── multiplayer/      # Networking
│   │   ├── levels/           # Game maps
│   │   ├── store/            # State management (Zustand)
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
├── backend/                  # Next.js API + Supabase
│   ├── api/
│   │   └── pages/api/        # API endpoints
│   └── supabase/
│       └── migrations/       # Database setup
│
├── docs/
│   ├── DEPLOYMENT.md         # Detailed deployment guide
│   ├── ARCHITECTURE.md       # Technical architecture
│   └── GAME_DESIGN.md        # Full game design doc
│
└── GAME_DESIGN.md            # Comprehensive game concept
```

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Rendering** | Babylon.js | Best 3D engine for browsers |
| **UI** | React 18 + TypeScript | Component-based, type-safe |
| **State** | Zustand | Lightweight, easy |
| **Frontend Build** | Vite | Fast dev experience |
| **Backend** | Next.js + Vercel | Serverless functions |
| **Realtime** | Supabase Realtime | WebSocket pub/sub |
| **Database** | PostgreSQL | Persistent state |
| **Hosting** | Vercel + Supabase | Developer-friendly |

## 🎮 Controls

| Action | Key |
|--------|-----|
| Move | WASD / Arrow Keys |
| Jump | Space |
| Dash | Shift |
| Gamepad | Left stick + A/B buttons |

## 🌐 Online Multiplayer

The game uses a hybrid architecture:

```
Browser (Frontend) ←→ Vercel API ←→ Supabase (Realtime + Database)
```

**No WebSocket server required!** Supabase Realtime handles:
- Player position synchronization
- Room updates
- Match state broadcast

**Why Supabase?**
- Built-in PostgreSQL + Realtime
- Free tier supports 200 concurrent connections
- Easy scaling
- No separate backend infrastructure needed

## 📊 Performance

- **Target FPS**: 60 (16ms per frame)
- **Network Latency**: ~150-200ms (playable)
- **Max Players/Room**: 12
- **Max Concurrent Players**: 1000+ (free tier Supabase)

## 🚢 Deployment

### Production URL

Once deployed: `https://lolbeans.vercel.app`

### Deployment Steps

1. Set up Supabase backend (5 min)
2. Push to GitHub (1 min)
3. Deploy via Vercel (2 min)
4. Done! ✅

**Total**: ~30 minutes from zero to production

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📈 Roadmap

### Phase 1 (MVP - This)
- [x] 2 maps (Candy Garden, Storm Factory)
- [x] Up to 12 players per room
- [x] Room codes + join system
- [x] Real-time multiplayer
- [x] Deployed on Vercel + Supabase

### Phase 2 (Next Sprint)
- [ ] 2 more maps (6 total)
- [ ] Player customization (colors, skins)
- [ ] Sound effects + music
- [ ] Weekly leaderboard
- [ ] Emotes/chat

### Phase 3 (Growth)
- [ ] Account system + persistence
- [ ] Cosmetics shop
- [ ] Ranked mode
- [ ] Team modes
- [ ] Spectator mode

### Phase 4+ (Expansion)
- [ ] Mobile app (React Native)
- [ ] Cosmetics revenue
- [ ] Battle pass system
- [ ] Global tournaments
- [ ] Streaming integration

## 🎯 Next Steps

### For Players
1. Visit [DEPLOYMENT.md](docs/DEPLOYMENT.md)
2. Deploy to Vercel + Supabase (30 min)
3. Share room code with friends
4. Play!

### For Developers

#### Add a New Map
1. Create `frontend/src/levels/Level3.ts`
2. Define obstacles, spawn points, finish line
3. Register in level selector
4. Test multiplayer

#### Customize Game Feel
- Tweak movement speed in `PlayerController.ts`
- Adjust jump height physics
- Modify obstacle placement in level files

#### Add Features
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for code structure
- See [GAME_DESIGN.md](GAME_DESIGN.md) for feature ideas

## 🔍 Troubleshooting

### "Cannot connect to room"
- Check Supabase URL in `.env.local`
- Verify anon key is correct
- Check browser console for errors

### "High latency / desync"
- Check network connection
- Supabase may need tier upgrade (see DEPLOYMENT.md)
- Try wired connection for testing

### "Rooms don't appear after 1 hour"
- Rooms auto-expire. Modify TTL in database migration (DEPLOYMENT.md)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) full troubleshooting section.

## 📚 Documentation

- **[GAME_DESIGN.md](GAME_DESIGN.md)** - Complete game design document with level details
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture & code design
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Step-by-step deployment guide

## 🤝 Contributing

Contributions welcome! 

- Fork the repo
- Create a feature branch
- Submit pull request

Areas we need help:
- 3D assets (models, textures)
- Level design
- Sound/music
- UI design
- Performance optimization

## 📄 License

MIT License - Feel free to use, modify, and deploy!

## 🎉 Credits

Inspired by:
- Fall Guys
- Gang Beasts
- Lolbeans
- Crowd Play games

Built with:
- React, Babylon.js, Supabase, Vercel

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: (add your email)
- **Discord**: (add your Discord server)

---

**Status**: Beta - Actively developed

**Latest Release**: v1.0.0

**Next Update**: Coming soon

---

## 🚀 Let's Go!

Ready to play?

1. **Deploy**: Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md)
2. **Play**: Invite friends with room code
3. **Feedback**: Report issues or request features
4. **Contribute**: Help make it better!

**Have fun! 🫘**
