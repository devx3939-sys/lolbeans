# LOLBEANS - Project Architecture

## Overview

LOLBEANS is a browser-based multiplayer obstacle course game built with:

- **Frontend**: React 18 + TypeScript + Babylon.js + Vite
- **Backend**: Next.js API routes + Supabase PostgreSQL + Realtime
- **Deployment**: Vercel (frontend) + Supabase (backend/database)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              React + Babylon.js                         │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  GameScene   │  │  GameLoop    │  │  InputHandler│  │  │
│  │  │  (3D View)   │  │  (Updates)   │  │  (Controls)  │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ PlayerCtrl   │  │  RealtimeSync│  │ RoomManager │  │  │
│  │  │ (Movement)   │  │  (WebSocket) │  │  (API)      │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  │                                                          │  │
│  │  Zustand Store (Global State)                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          │ HTTP/WebSocket                     │
│                          ▼                                    │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Vercel (Frontend)│ │ Vercel (Backend)│ │ Supabase │
    │ React App      │ │ Next.js API  │ │ PostgreSQL   │
    │ Static Build   │ │ Routes       │ │ + Realtime   │
    └────────────────┘ └──────────────┘ └──────────────┘
```

---

## Data Flow

### 1. User Creates a Room

```
User clicks "Create Room"
         ↓
RoomManager.createRoom()
         ↓
POST /api/rooms/create
         ↓
Generate room code + create in DB
         ↓
Return room data to frontend
         ↓
Zustand store updates
         ↓
Redirect to lobby screen
```

### 2. User Joins a Room

```
User enters room code
         ↓
RoomManager.joinRoom()
         ↓
POST /api/rooms/join
         ↓
Validate room exists + not full
         ↓
Add player to database
         ↓
RealtimeSync subscribes to room channel
         ↓
Lobby screen shows all players
         ↓
Zustand updates with player list
```

### 3. Match Starts

```
All players ready
         ↓
Host clicks "Start Match"
         ↓
POST /api/rooms/{id}/start
         ↓
Update room status to IN_PROGRESS
         ↓
Realtime broadcast to all clients
         ↓
All clients transition to game screen
         ↓
GameLoop.startMatch()
         ↓
Create player controllers
         ↓
Begin 3D rendering
```

### 4. During Match

```
Every frame:
  1. InputHandler.update() → get keyboard/gamepad input
  2. PlayerController.update() → apply physics & movement
  3. Collision detection
  4. Send local state to server (every 100ms)
  
Every 100ms:
  RealtimeSync broadcasts position to other players
  
Every 50-100ms:
  Incoming player positions received
  Remote players interpolated to new position
  
Match timer counts down
  
Player finishes:
  RealtimeSync.finishMatch() → update DB
  Mark player as finished
  Continue rendering for others to see finish
```

### 5. Match Ends

```
Time expires OR enough players finished
         ↓
GameLoop.endMatch()
         ↓
Fetch final results from database
         ↓
Calculate ranks
         ↓
Transition to results screen
         ↓
Display leaderboard
```

---

## Component Architecture

### Frontend (`frontend/src/`)

```
src/
├── components/
│   ├── MainMenu.tsx           # Entry screen
│   ├── LobbyScreen.tsx        # Pre-match lobby
│   ├── GameScene.tsx          # Main 3D game (Babylon.js)
│   ├── ResultsScreen.tsx      # Post-match leaderboard
│   └── ui/                    # Reusable UI components
│
├── systems/
│   ├── BabylonSetup.ts        # Initialize 3D engine
│   ├── GameLoop.ts            # Main update loop
│   ├── InputHandler.ts        # Keyboard/gamepad input
│   └── PlayerController.ts    # Player physics & movement
│
├── multiplayer/
│   ├── RealtimeSync.ts        # Supabase WebSocket connection
│   └── RoomManager.ts         # API calls for rooms/players
│
├── levels/
│   ├── Level1.ts              # Candy Garden level
│   ├── Level2.ts              # Storm Factory level
│   └── LevelBase.ts           # Base class
│
├── store/
│   └── gameStore.ts           # Zustand global state
│
├── types/
│   └── index.ts               # TypeScript interfaces
│
├── utils/
│   ├── Vector3Utils.ts
│   ├── MathUtils.ts
│   └── Constants.ts
│
└── App.tsx                    # Root component
```

### Backend (`backend/`)

```
backend/
├── api/
│   └── pages/api/
│       └── rooms/
│           ├── create.ts      # POST /api/rooms/create
│           ├── join.ts        # POST /api/rooms/join
│           ├── [id]/
│           │   ├── leave.ts   # POST /api/rooms/{id}/leave
│           │   ├── start.ts   # POST /api/rooms/{id}/start
│           │   └── ready.ts   # POST /api/rooms/{id}/ready
│           └── [code]/
│               └── get.ts     # GET /api/rooms/code/{code}
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init_schema.sql
│   └── config.toml
│
└── functions/
    └── (Edge functions for validation if needed)
```

---

## State Management (Zustand)

The app uses a single Zustand store to manage:

```typescript
{
  // UI Navigation
  ui: { currentScreen, loading, error, notification }
  
  // Room/Lobby State
  currentRoom: Room
  
  // Local Player
  localPlayer: LocalPlayer
  
  // Active Match State
  gameState: GameState
  
  // Network Status
  isConnected: boolean
  latency: number
  
  // Player Settings
  playerName: string
  playerColor: string
  soundEnabled: boolean
}
```

Advantages:
- Simple, single source of truth
- Easy to debug (Zustand devtools)
- No boilerplate (compared to Redux)
- Built-in subscriptions
- TypeScript support

---

## Real-Time Synchronization

### Connection Flow

```
1. Client connects: RealtimeSync.connect(roomId, playerId)
2. Supabase Channel created: supabase.channel(`room:{roomId}`)
3. Subscribe to player_positions table
4. Listen for INSERT/UPDATE events
5. On event: update remote player position
6. Interpolate position smoothly for visual effect
```

### State Sync Strategy

**Authoritative Server**
- Finish line crossing validated on server
- Player positions NOT validated (client trusted for playability)
- Server resolves conflicts (last-write-wins)

**Client Prediction**
- Local player position calculated on client immediately
- Reduces perceived latency
- Server "corrects" if drift > 1 meter

**Update Frequency**
- Client sends input: 50ms (InputHandler.update)
- Client sends state: 100ms (RealtimeSync.broadcast)
- Server broadcasts: 100ms (Realtime pubsub)
- Total latency: ~150-200ms typical

### Desync Handling

```typescript
if (distanceToServer > 1.0) {
  // Snap to server position if drifted too far
  localPlayer.position = serverPosition;
} else {
  // Smooth interpolation if close
  localPlayer.position = lerp(current, target, speed * dt);
}
```

---

## Database Schema

### Tables

**rooms**
- id (UUID)
- code (5-char unique code)
- host_id (player UUID)
- level_id (1 or 2)
- status (LOBBY, STARTING, IN_PROGRESS, ENDED)
- max_players (default 12)
- created_at, expires_at

**players_in_room**
- id (UUID)
- player_id (UUID)
- room_id (FK → rooms)
- name (VARCHAR)
- color (HEX)
- is_ready (BOOLEAN)
- status (ACTIVE, FINISHED, etc.)
- finish_time (FLOAT)
- joined_at

**player_positions** (Realtime)
- id (UUID)
- player_id (UUID)
- room_id (FK)
- x, y, z (position)
- vx, vy, vz (velocity)
- updated_at

**match_results**
- id (UUID)
- room_id (FK)
- player_id (UUID)
- player_name
- rank
- finish_time
- qualified (BOOLEAN)
- created_at

---

## Physics Engine

### Using Babylon.js Built-in Physics

Currently uses simplified physics:

```typescript
// Per frame update:
1. Apply input force: velocity += direction * speed * dt
2. Apply gravity: velocity.y -= 9.8 * dt
3. Update position: position += velocity * dt
4. Check collision (raycast for ground)
5. Reset velocity if colliding

// Collision Detection
- Player-to-player: Sphere collision
- Player-to-hazard: Mesh intersection
- Finish line: Trigger zone detection
```

### Why Not Full Physics Engine?

- Babylon.js has built-in physics (Cannon.js)
- For party game, predictable > realistic
- Simpler = less network sync needed
- Faster frame rate = better experience

---

## Level System

### Level Structure

```typescript
interface LevelConfig {
  id: 1 | 2
  name: "Candy Garden" | "Storm Factory"
  spawnPoints: Vector3[]      // Where players start
  checkpoints: Checkpoint[]   // Progress markers
  hazards: Hazard[]           // Obstacles
  finishLinePos: Vector3      // Goal position
  timeLimit: 180000           // 3 minutes
  bounds: { min, max }        // Level boundaries
}
```

### Adding a New Level

1. Create `frontend/src/levels/Level3.ts`
2. Extend `LevelBase.ts`
3. Define obstacles and hazards
4. Register in level selector
5. Test multiplayer sync

---

## Security Considerations

### Input Validation

```typescript
// All API inputs validated:
- playerId: must be UUID
- playerName: max 50 chars, alphanumeric
- roomCode: exactly 5 chars
- levelId: must be 1 or 2
```

### Cheating Prevention

```typescript
// Server-side checks:
- Finish time < 10 seconds? → Suspicious, flag
- Player moved > 50m in 100ms? → Teleport detected, reject
- Same player in two rooms? → Session conflict, disconnect
- Multiple rapid room creations? → Rate limit
```

### Data Protection

- Supabase handles database encryption
- JWT tokens managed by Supabase Auth
- service_role key kept in backend env vars only
- Anon key scoped to read/write specific tables

---

## Performance Optimization

### Rendering

- **LOD System**: Reduce detail distance for far away players
- **Frustum Culling**: Don't render off-screen objects
- **Babylon.js Optimization**: Use InstancedMesh for repeated obstacles
- **Target 60 FPS**: 16ms per frame budget

### Networking

- **Delta compression**: Only send changed values
- **Interpolation**: Smooth between received states
- **Prediction**: Assume motion continues linearly
- **Batch updates**: Send multiple players in one message

### Memory

- **Object pooling**: Reuse player meshes
- **Dispose unused**: Clean up ended matches
- **Lazy load**: Load level assets on demand

---

## Debugging

### Console Logging

```typescript
// Enable debug mode
localStorage.setItem('DEBUG_LOLBEANS', 'true');

// Logs printed:
- Position updates
- Network events
- Collision detection
- State changes
```

### Browser DevTools

1. **Babylon.js Inspector**
   - Press Ctrl+Shift+I in game
   - Inspect scene, meshes, animations

2. **React DevTools**
   - Chrome extension
   - Inspect component hierarchy
   - Zustand state viewer

3. **Network Tab**
   - Monitor WebSocket traffic
   - Check API response times

---

## Monitoring

### Metrics to Track

```
Performance:
- FPS (target: 60)
- Frame time (target: < 16ms)
- Network latency (target: < 200ms)

User Experience:
- Match completion rate
- Average match time
- Player drop-off rate
- Error frequency

Infrastructure:
- Supabase connection count
- Database query time
- API response time
- Realtime pubsub messages/sec
```

### Error Tracking

Add Sentry for production error monitoring:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## Next Steps for Expansion

### Architecture-Ready For:

1. **User Accounts**
   - Add authentication table
   - Store cosmetics unlocks
   - Track player stats/leaderboard

2. **Cosmetics Shop**
   - Skins, emotes, colors
   - Currency system (soft/hard)
   - Inventory management

3. **Game Modes**
   - Team matches
   - Survival elimination
   - Custom map editor

4. **Chat/Social**
   - In-game messaging
   - Friend system
   - Party lobbies

5. **Analytics**
   - Track play patterns
   - Identify balance issues
   - Player feedback system

All can be added without major architecture changes.

---

## Deployment Architecture

```
Developer → Git Push → GitHub
                          ↓
                   GitHub Actions CI
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
         Vercel Frontend      Supabase Backend
         (React App)          (Database + Realtime)
              ↓                       ↓
    lolbeans.vercel.app    xxx.supabase.co
              ↓                       ↓
         CloudFlare DNS ←────────────┘
              ↓
    lolbeans.com (custom domain)
```

---

## Summary

**Key Design Principles:**

1. **Simplicity**: Easy to understand, build, deploy
2. **Scalability**: Ready to grow with more players/content
3. **Playability**: Fun > realistic physics
4. **Maintainability**: Clean code, clear separation
5. **Cost-effective**: Free tier supports MVP launch

**Tech Stack Justification:**

| Choice | Why |
|--------|-----|
| React | Component-based UI, large ecosystem |
| Babylon.js | Best 3D engine for browsers |
| Zustand | Lightweight state management |
| Supabase | PostgreSQL + Realtime out of box |
| Vercel | Best DX for frontend + serverless |
| TypeScript | Catch errors early, better DX |

This architecture supports launching on a budget, scaling as needed, and adding features without major refactors.
