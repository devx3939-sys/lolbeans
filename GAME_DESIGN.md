# LOLBEANS - Complete Game Design Document

## 1. High-Level Game Concept

**LOLBEANS** is a browser-based, real-time multiplayer obstacle course party game inspired by Fall Guys and Gang Beasts. 2-12 players compete simultaneously in chaotic, physics-driven obstacle courses. Players control colorful "bean" characters through progressively more difficult levels, encountering hazards, other players, and environmental chaos. The tone is lighthearted, fast-paced, and designed for social, replayable fun.

### Core Vision
- **Fast-paced**: 2-4 minute matches
- **Chaotic**: Physics, collisions, and environmental hazards create unpredictable, funny moments
- **Accessible**: Simple controls (WASD/arrows + spacebar jump), playable on desktop and mobile browsers
- **Social**: Room-based lobbies, up to 12 players per match
- **Replayable**: Two distinct maps at launch, both with high replay value
- **Polished**: Bright, colorful aesthetics; satisfying feedback; readable design

### Art Direction
- **Style**: Low-poly, vibrant 3D with thick outlines (cel-shading inspired)
- **Tone**: Family-friendly, humorous, playful
- **Palette**: Bright primary colors + pastels; high contrast for readability
- **Characters**: Spherical "bean" avatars with simple customization (color, cosmetics)
- **Obstacles**: Clearly readable, exaggerated shapes; satisfying destruction/movement animations
- **UI**: Bold, rounded, clean—similar to Among Us / Fall Guys aesthetic

---

## 2. Core Gameplay Loop

### Match Flow
1. **Lobby Phase** (30-60 sec)
   - Players join a room via code or matchmaking
   - Ready-up system; host can start when ≥2 ready
   - 10-second countdown before level load

2. **Level Phase** (120-180 sec per level)
   - Players spawn into one of two maps
   - Obstacles, hazards, and other players create chaos
   - Real-time physics and collision feedback
   - Players race toward the finish or survive elimination rounds

3. **End Screen** (10-15 sec)
   - Results: top 3, who qualified, finish times
   - Ready for next match or return to lobby

### Win Conditions
- **Primary**: First to reach finish line within time limit wins
- **Secondary**: Most players qualify (finish line crossed) before time ends
- **Fallback**: Survival-based (last player standing, or most time in-level)

### Player Mechanics

**Movement**
- **Walk**: WASD or Arrow Keys (analog stick on gamepad)
- **Jump**: Spacebar or Gamepad Button (arc-based jump physics)
- **Dive/Slide**: Shift (brief dash forward, helpful for obstacles and dodging)
- **Momentum**: Intentionally "slippery" to create fun chaos; not realistic but playable

**Physics**
- **Gravity**: Standard (9.8 m/s²)
- **Jump Height**: ~3 meters (enough to clear obstacles)
- **Knockback**: Hazards and collisions push players back; exaggerated but fair
- **Respawn**: If player falls off-map, respawn at nearest checkpoint (loses time but stays in race)
- **Collision**: Player-to-player collision is bouncy; full physics (no phasing)

**Camera**
- **Perspective**: Isometric or 45° angle overview (easier for browser, better for readability)
- **Follow**: Smooth follow of player's bean with slight lead
- **FOV**: Adjusted to keep obstacles visible and readable

---

## 3. Multiplayer Architecture

### Real-Time Communication Strategy

**Why not Vercel alone?**
- Vercel is edge-deployed and stateless (perfect for frontend)
- Vercel functions are serverless (great for REST APIs, poor for persistent WebSocket state)
- True multiplayer games require low-latency, bidirectional, persistent connections

**Recommended Solution: Hybrid Architecture**

```
┌─────────────────┐        ┌──────────────────────┐
│  Browser Client │◄─────►│  Realtime Provider   │
│   (React)       │ WS/TCP │  (Supabase, Firebase,│
└─────────────────┘        │   or Colyseus)       │
        │                   └──────────────────────┘
        │                            │
        ▼                            ▼
┌─────────────────┐        ┌──────────────────────┐
│  Vercel Frontend│        │  Match State         │
│  (Static + API │        │  (Database/Cache)    │
│   routes)       │        └──────────────────────┘
└─────────────────┘
```

### Recommended Stack: Supabase + Next.js
- **Frontend**: React + Babylon.js/Three.js for 3D
- **Backend**: Next.js API routes for lobby, room creation, stats
- **Realtime**: Supabase Realtime (PostgreSQL pub/sub) for player state sync
- **Database**: Supabase PostgreSQL for rooms, players, match history
- **Hosting**: Vercel (frontend) + Supabase (backend/realtime)

**Why this stack?**
- Supabase is Postgres + Realtime out of the box
- Vercel deploys Next.js seamlessly
- Both scale well for 12 concurrent players per room
- PostgreSQL gives flexibility for future accounts, cosmetics, leaderboards
- Cost-effective for indie dev

### Multiplayer Flow

**Room System**
```typescript
// Room model
{
  id: string (UUID)
  code: string (5 char, e.g., "AB12C")
  host: player_id
  players: Player[]
  status: "LOBBY" | "STARTING" | "IN_PROGRESS" | "ENDED"
  selectedLevel: 1 | 2
  createdAt: timestamp
  maxPlayers: 12
}

// Player in room
{
  id: string (UUID)
  name: string
  roomId: string
  color: string (hex)
  position: { x, y, z }
  velocity: { x, y, z }
  isReady: boolean
  status: "ACTIVE" | "FINISHED" | "ELIMINATED" | "SPECTATING"
  finishTime: number | null (milliseconds)
  connectedAt: timestamp
}
```

**State Sync Strategy**
1. **Client** sends input (movement, jump) every 50ms
2. **Server** (Supabase Realtime) broadcasts position updates every 100ms
3. **Client** interpolates between received positions for smooth movement
4. **Collision** computed on client; suspicious behavior flagged server-side
5. **Finish line crossing** validated server-side (authoritative)

**Lag/Desync Handling**
- Prediction: Client predicts own movement
- Correction: Server sends authoritative position every 500ms
- Rollback: If desync > 1 meter, snap to server position
- Retry: Auto-reconnect if WS drops; resume if < 30 sec disconnected
- Cheat prevention: Impossible to gain > 5m in 100ms; flagged as invalid

**Matchmaking**
- No ranked MM yet; simple "join room by code" flow
- Social: Share room code to friends
- Optional: Random fill if code not entered

---

## 4. Map 1: "CANDY GARDEN" (Beginner/Tutorial)

### Theme & Aesthetics
- A whimsical garden made of candy and food items
- Bright pastels: cotton candy pink, mint green, lemon yellow, sky blue
- Oversized candy canes, gummy bears, chocolate platforms, frosting obstacles
- Adorable, welcoming, somewhat childish
- Perfect for teaching core mechanics

### Layout & Flow

**Start Zone** (0-10s)
- Open circular arena, 20m diameter
- 12 spawn points arranged in a circle
- Clean, readable start (teaches nothing yet)
- 10-second pre-race countdown

**Section 1: Rolling Gumballs** (10-30s)
- 5 large, slow-rolling gumball obstacles (2m diameter)
- Roll left-to-right, then reverse
- Spacing: ~8m apart, staggered timing
- Players must weave through or jump over
- **Teaches**: Timing, reading patterns, jumping precision

**Section 2: Spinning Candy Canes** (30-50s)
- 3 candy cane obstacles, tall and spinning
- Gaps between them rotate on/off
- Players must dodge or use jump timing
- Alternative: walk around the edges (risky, takes time)
- **Teaches**: Pattern recognition, risk/reward assessment

**Section 3: Frosting Platforms** (50-75s)
- Series of 5 staggered, slightly bouncy platforms
- Made of frosting (slippery, bouncy movement)
- Forms a staircase upward
- Knockback from other players can cause funny pile-ups
- **Teaches**: Momentum control, dealing with other players

**Section 4: Chocolate Bridges** (75-100s)
- Multiple narrow chocolate plank bridges
- Bridges have randomized timing of moving/stationary
- Optional: jump shortcuts over the sides (saves time but risky)
- Player collisions on bridges cause both to stumble (great for chaos)
- **Teaches**: Risk assessment, dealing with multiplayer interference

**Final Stretch: Cookie Slope** (100-120s)
- Final uphill slope made of giant cookies
- Slightly slippery, lots of handholds (visually)
- Confetti cannons along the side
- Finish gate at top with celebration effects

**Finish Line**
- Large, glowing goal gate
- Celebratory particles, sound, and screen shake
- Top 3 finishers shown on leaderboard
- Rest marked as "Qualified" or "Did not finish"

### Why This Map Works
- **Progressive difficulty**: Each section teaches a new mechanic
- **Replayable**: Timing variations keep it fresh
- **Multiplayer chaos**: Enough room for fun collisions without feeling unfair
- **Accessible**: Readable, predictable, forgiving
- **Modular**: Gumballs, spinning obstacles, platforms—all reusable in future maps

### Estimated Time to Complete: 90-120 seconds

---

## 5. Map 2: "STORM FACTORY" (Advanced/Challenge)

### Theme & Aesthetics
- An industrial, chaotic factory during a windstorm
- Dark purples, electric blues, neon orange, metallic grays
- Giant fans, conveyor belts, electrical hazards, metal platforms
- Dangerous, exhilarating, fast-paced
- Feeling: "This is a real test"

### Layout & Flow

**Start Zone** (0-10s)
- Narrow factory floor with visible machinery
- 12 spawn points on two parallel conveyor belts (slowly moving)
- Conveyor belts move in opposite directions (light chaos even at start)
- **Teaches**: Immediately that this level is different

**Section 1: Raging Fan Gauntlet** (10-35s)
- 4 massive rotating fans creating windstorms
- Wind pushes players in different directions per cycle
- Narrow walkway between fans; must time movement or get blown back
- Alternative: risky shortcut through the fan field (faster but high knockback chance)
- **Teaches**: Reading complex hazards, timing, big risk/reward

**Section 2: Conveyor Madness** (35-60s)
- 3 parallel conveyor belts moving at different speeds, some backward
- Players must cross all three to advance
- Falling off a belt means sliding backward; must recover
- Collision chains: one player falling can cause pile-up behind them
- **Teaches**: Momentum, recovery, multiplayer cascade effects

**Section 3: Electrical Platforms** (60-85s)
- 7 small platforms suspended by cables
- Platforms swing side-to-side and up-and-down
- Some platforms electrified, damage if stepped on
- Pattern: only safe platforms light up in sequence
- Failure: touching electric platform = knockback to earlier platform
- **Teaches**: Precision, quick timing, consequence of mistakes

**Section 4: Spinning Metal Maze** (85-110s)
- Central rotating metal maze structure (360° spin every 10 seconds)
- Players inside must stay moving to avoid walls grinding them
- Multiple paths through maze; all lead to exit but some shorter
- Collision with maze walls causes knockback and momentary stun
- **Teaches**: Navigation under pressure, risk/reward pathing

**Final Stretch: Collapsing Platform Run** (110-135s)
- Series of platforms that collapse after 3 seconds of standing on them
- Players must jump constantly or fall
- Wind effects make jumps slightly less predictable
- Platforms collapse in cascades (one falling destabilizes neighbors)
- Multiplayer element: landing on a collapsing platform with another player destabilizes it faster
- **Teaches**: Constant vigilance, multiplayer timing importance

**Finish Line**
- Platform at top that's literally a factory exit/emergency door
- Opens to outside, victorious feel
- Victory particles, achievement sound, screen shake

### Why This Map Works
- **Challenging**: Requires skill, timing, and adaptability
- **Chaotic**: More collision opportunities and physics interactions
- **Replayable**: Multiple hazards with timing variation = different challenges each run
- **Multiplayer storytelling**: Natural moments of funny collisions, comebacks, and failures
- **Modular**: Fans, conveyor belts, swinging platforms—all reusable components

### Estimated Time to Complete: 135-180 seconds

---

## 6. UI & User Flow

### Screens & Transitions

```
┌──────────────────────────────────────────────────┐
│ MAIN MENU                                        │
├──────────────────────────────────────────────────┤
│  [Start Game]  [Join by Code]  [Settings]        │
│  [Stats]       [Exit]                            │
└──────────────────────────────────────────────────┘
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ ROOM CREATION    │  │ ROOM JOINING     │
├──────────────────┤  ├──────────────────┤
│ Pick Level:      │  │ Enter Code:      │
│ • Candy Garden   │  │ [________]       │
│ • Storm Factory  │  │ [Join]           │
│                  │  │                  │
│ [Create Room]    │  └──────────────────┘
└──────────────────┘        │
        │                   │
        └───────┬───────────┘
                ▼
        ┌──────────────────┐
        │ LOBBY            │
        ├──────────────────┤
        │ Players (4/12):  │
        │ • You (ready)    │
        │ • Alice (ready)  │
        │ • Bob (waiting)  │
        │ • Carol (ready)  │
        │                  │
        │ [Ready] [Leave]  │
        │                  │
        │ Starting in: 5s  │
        └──────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ LEVEL IN PROGRESS│  (Main gameplay)
        ├──────────────────┤
        │ [3D Game View]   │
        │                  │
        │ Top-left: Score  │
        │ Top-right: Time  │
        │ Minimap (opt.)   │
        └──────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ RESULTS SCREEN   │
        ├──────────────────┤
        │ LEADERBOARD:     │
        │ 1. Alice - 45.2s │
        │ 2. You - 48.1s   │
        │ 3. Carol - 52.3s │
        │ 4. Bob - DQ      │
        │                  │
        │ [Next] [Lobby]   │
        └──────────────────┘
```

### Key Screens

**Lobby**
- Player list with ready/waiting status
- Host-only button: "Start Match" (disabled until ≥2 ready)
- Countdown timer visible
- Team/chat optional for future (not v1)

**HUD During Match**
- Top-left: Player name + color indicator
- Top-right: Match timer (total time left)
- Bottom-center: Mini-map (optional; shows players + finish line)
- Subtle: Current checkpoint/section name (fades in/out)
- Effects: Jump feedback, collision feedback, knockback direction indicator

**Results Screen**
- Large leaderboard, top 3 highlighted
- Qualify/DNF status for others
- Finish time or reason (fell, time expired, eliminated)
- Two buttons: "Play Again" (returns to same lobby) or "Return to Main Menu"

---

## 7. Technical Stack Recommendation

### Frontend
- **Framework**: React 18 + TypeScript
- **3D Rendering**: Babylon.js (superior browser game engine, great mobile support)
- **Build Tool**: Vite (fast dev, excellent HMR)
- **State Management**: Zustand (simple, lightweight)
- **Networking**: Supabase JS SDK (WebSocket client built-in)

**Why Babylon.js?**
- Excellent collision detection (mandatory for party games)
- Great physics engine (Cannon.js integration)
- Mature, large community
- Works on mobile browsers
- Good documentation for game dev
- Asset pipeline tools

### Backend
- **Platform**: Vercel (frontend host) + Supabase (backend/realtime)
- **API Framework**: Next.js (API routes for REST endpoints)
- **Realtime**: Supabase Realtime (PostgreSQL pub/sub)
- **Database**: PostgreSQL (Supabase managed)

### Deployment & Hosting
- **Frontend**: Deployed on Vercel (automatic via GitHub)
- **Backend**: Supabase Free or Pro tier (depends on scale)
- **Database**: Supabase PostgreSQL
- **Auth** (future): Supabase Auth (magic links, email)

### Key Infrastructure
```
┌─────────────────────────────────────────────────┐
│ Vercel (Frontend)                               │
├─────────────────────────────────────────────────┤
│ React App + Next.js API routes                  │
│ • /api/rooms/create                             │
│ • /api/rooms/join                               │
│ • /api/stats                                    │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Supabase Auth    │    │ Supabase Realtime│
│ (JWT tokens)     │    │ (WebSocket)      │
└──────────────────┘    └──────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌──────────────────────┐
        │ Supabase PostgreSQL  │
        ├──────────────────────┤
        │ • rooms              │
        │ • players_in_room    │
        │ • match_history      │
        │ • player_stats       │
        └──────────────────────┘
```

---

## 8. Folder Structure

```
lolbeans/
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   ├── models/          # Babylon.js models (FBX/GLTF)
│   │   │   │   ├── bean-character.glb
│   │   │   │   ├── level1-obstacles.glb
│   │   │   │   └── level2-obstacles.glb
│   │   │   ├── sounds/
│   │   │   │   ├── jump.wav
│   │   │   │   ├── collision.wav
│   │   │   │   ├── finish.wav
│   │   │   │   └── ui-click.wav
│   │   │   └── textures/
│   │   │       ├── candy-garden/
│   │   │       └── storm-factory/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── MainMenu.tsx
│   │   │   ├── LobbyScreen.tsx
│   │   │   ├── GameScene.tsx       # Main 3D scene
│   │   │   ├── HUD.tsx              # In-game UI overlay
│   │   │   ├── ResultsScreen.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── PlayerList.tsx
│   │   │       └── Leaderboard.tsx
│   │   ├── systems/
│   │   │   ├── BabylonSetup.ts      # Initialize Babylon engine
│   │   │   ├── GameLoop.ts          # Main game loop
│   │   │   ├── InputHandler.ts      # WASD, gamepad input
│   │   │   ├── PhysicsEngine.ts     # Movement, collision
│   │   │   └── LevelLoader.ts       # Load levels dynamically
│   │   ├── multiplayer/
│   │   │   ├── RealtimeSync.ts      # Supabase connection
│   │   │   ├── RoomManager.ts       # Room create/join
│   │   │   ├── PlayerState.ts       # Local player state
│   │   │   └── Interpolation.ts     # Smooth remote players
│   │   ├── levels/
│   │   │   ├── Level1.ts            # Candy Garden
│   │   │   ├── Level2.ts            # Storm Factory
│   │   │   └── LevelBase.ts         # Base class
│   │   ├── store/
│   │   │   ├── gameStore.ts         # Zustand store
│   │   │   └── roomStore.ts
│   │   ├── types/
│   │   │   ├── index.ts             # TypeScript types
│   │   │   └── entities.ts
│   │   ├── utils/
│   │   │   ├── Vector3Utils.ts
│   │   │   ├── MathUtils.ts
│   │   │   └── Constants.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.local                   # Supabase keys
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql  # Create tables
│   │   │   └── 002_add_realtime.sql # Enable realtime
│   │   └── config.toml
│   ├── api/
│   │   ├── pages/api/
│   │   │   ├── rooms/
│   │   │   │   ├── create.ts
│   │   │   │   ├── join.ts
│   │   │   │   ├── [id]/leave.ts
│   │   │   │   └── [code]/get.ts
│   │   │   ├── stats.ts
│   │   │   └── health.ts
│   │   ├── next.config.js
│   │   └── package.json
│   └── functions/
│       └── (edge functions for validation, if needed)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── API_REFERENCE.md
│   └── LEVEL_DESIGN_GUIDE.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # Auto-deploy on push
│
└── README.md
```

---

## 9. Core Code Scaffolding

See separate code files for full implementation. Key modules:

### Game Loop (Pseudocode)
```typescript
class GameEngine {
  private scene: BABYLON.Scene;
  private players: Map<string, PlayerController>;
  private levelManager: LevelManager;
  private isRunning: boolean = false;

  constructor() {
    this.scene = this.initBabylonScene();
    this.players = new Map();
    this.levelManager = new LevelManager(this.scene);
  }

  public startMatch(levelId: 1 | 2, playerIds: string[]): void {
    this.levelManager.loadLevel(levelId);
    playerIds.forEach(id => this.createPlayer(id));
    this.isRunning = true;
  }

  public update(deltaTime: number): void {
    // 1. Process input
    this.inputHandler.update();

    // 2. Update player physics
    this.players.forEach(player => player.update(deltaTime));

    // 3. Collision detection
    this.detectCollisions();

    // 4. Update hazards
    this.levelManager.updateHazards(deltaTime);

    // 5. Check win condition
    this.checkMatchEnd();

    // 6. Sync state (network)
    this.realtimeSync.broadcastState(this.getGameState());
  }

  private detectCollisions(): void {
    // Player-to-hazard collisions
    this.players.forEach(player => {
      this.levelManager.hazards.forEach(hazard => {
        if (this.isColliding(player, hazard)) {
          this.onHazardCollision(player, hazard);
        }
      });
    });

    // Player-to-player collisions
    const playerArray = Array.from(this.players.values());
    for (let i = 0; i < playerArray.length; i++) {
      for (let j = i + 1; j < playerArray.length; j++) {
        if (this.isColliding(playerArray[i], playerArray[j])) {
          this.onPlayerCollision(playerArray[i], playerArray[j]);
        }
      }
    }

    // Finish line detection
    this.players.forEach(player => {
      if (this.levelManager.isFinishLine(player.position)) {
        this.onPlayerFinish(player);
      }
    });
  }

  private checkMatchEnd(): void {
    const finishedCount = Array.from(this.players.values())
      .filter(p => p.hasFinished).length;
    const timeRemaining = this.matchTimer.remaining;

    if (finishedCount >= this.players.size * 0.5 || timeRemaining <= 0) {
      this.endMatch();
    }
  }
}
```

### Player Controller
```typescript
class PlayerController {
  public id: string;
  public mesh: BABYLON.Mesh;
  public position: Vector3;
  public velocity: Vector3 = Vector3.Zero();
  public isJumping: boolean = false;
  public hasFinished: boolean = false;

  constructor(id: string, startPos: Vector3, scene: BABYLON.Scene) {
    this.id = id;
    this.position = startPos;
    this.mesh = this.createPlayerMesh(scene);
  }

  public update(deltaTime: number): void {
    // Get current input
    const input = InputHandler.getMovementInput();

    // Apply movement
    this.applyMovement(input, deltaTime);

    // Apply gravity
    this.velocity.y -= 9.8 * deltaTime;

    // Update position
    this.position.addInPlace(this.velocity.scale(deltaTime));

    // Clamp to level bounds
    this.clampToBounds();

    // Update mesh
    this.mesh.position = this.position;
  }

  private applyMovement(input: InputVector, deltaTime: number): void {
    const moveSpeed = 8; // m/s
    const acceleration = 15; // m/s²

    // Forward/backward
    this.velocity.x += input.moveY * moveSpeed * deltaTime;
    this.velocity.z += input.moveX * moveSpeed * deltaTime;

    // Apply friction
    this.velocity.x *= 0.95;
    this.velocity.z *= 0.95;

    // Jump
    if (input.jump && this.isGrounded()) {
      this.velocity.y = 12; // m/s (gives ~7m height)
      this.isJumping = true;
    }

    if (this.velocity.y < 0) {
      this.isJumping = false;
    }
  }

  public receiveDamage(direction: Vector3, force: number = 5): void {
    this.velocity.addInPlace(direction.scale(force));
  }

  private clampToBounds(): void {
    const LEVEL_BOUNDS = 100;
    if (Math.abs(this.position.x) > LEVEL_BOUNDS ||
        Math.abs(this.position.z) > LEVEL_BOUNDS) {
      this.respawn();
    }
  }

  private respawn(): void {
    this.position = this.checkpointPosition;
    this.velocity = Vector3.Zero();
  }
}
```

### Realtime Sync (Supabase)
```typescript
class RealtimeSync {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel;
  private roomId: string;

  public connect(roomId: string, onStateUpdate: (state: GameState) => void): void {
    this.roomId = roomId;

    this.channel = this.supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_positions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onStateUpdate(payload.new as GameState);
        }
      )
      .subscribe();
  }

  public broadcastPlayerState(player: PlayerState): void {
    this.supabase
      .from("player_positions")
      .upsert({
        player_id: player.id,
        room_id: this.roomId,
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        vx: player.velocity.x,
        vy: player.velocity.y,
        vz: player.velocity.z,
        updated_at: new Date(),
      })
      .then();
  }

  public disconnect(): void {
    this.supabase.removeChannel(this.channel);
  }
}
```

---

## 10. Deployment Strategy

### Prerequisites
- GitHub account
- Vercel account (free tier OK)
- Supabase account (free tier OK for launch)

### Step 1: Set Up Supabase Backend

```bash
# Create Supabase project at https://supabase.com
# Create tables with migrations:

-- tables.sql
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  code varchar(5) unique not null,
  host_id uuid not null,
  level_id int not null,
  status varchar(20) default 'LOBBY',
  max_players int default 12,
  created_at timestamp default now(),
  expires_at timestamp
);

create table public.players_in_room (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null,
  room_id uuid references public.rooms(id),
  name varchar(50) not null,
  color varchar(7) not null,
  is_ready boolean default false,
  status varchar(20) default 'ACTIVE',
  finish_time float,
  joined_at timestamp default now()
);

create table public.player_positions (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null,
  room_id uuid references public.rooms(id),
  x float, y float, z float,
  vx float, vy float, vz float,
  updated_at timestamp default now()
);

-- Enable Realtime
alter publication supabase_realtime add table player_positions;

create table public.match_results (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.rooms(id),
  player_id uuid not null,
  rank int,
  finish_time float,
  qualified boolean,
  created_at timestamp default now()
);
```

### Step 2: Deploy Frontend on Vercel

```bash
# Clone or push your repo to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOU/lolbeans.git
git push -u origin main

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Connect GitHub repo
# 3. Set environment variables:
#    VITE_SUPABASE_URL=https://YOUR.supabase.co
#    VITE_SUPABASE_KEY=YOUR_ANON_KEY
# 4. Deploy!
```

### Step 3: Environment Variables

**Frontend (.env.local)**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxx
VITE_API_URL=https://lolbeans.vercel.app/api
```

**Vercel (Env Vars)**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxxxxxx
```

### Step 4: CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 11. Expansion Roadmap

### Phase 2 (Next Sprint)
- [ ] 2 more maps (6 total)
- [ ] Player account system (cosmetics unlocks)
- [ ] Custom character colors and skins
- [ ] Leaderboard (weekly/monthly rankings)
- [ ] Sound effects and music
- [ ] Particle effects system

### Phase 3
- [ ] Campaign mode (single-player progression)
- [ ] Competitive ranked mode
- [ ] Team modes (2v2, 3v3)
- [ ] Custom private games (friends only)
- [ ] Spectator mode
- [ ] Emotes and communication wheel

### Phase 4+
- [ ] Mobile app (React Native)
- [ ] Cosmetics shop (cosmetic items, no P2W)
- [ ] Battle pass seasonal content
- [ ] Guilds / clan system
- [ ] Streaming integration (Twitch)
- [ ] Global tournaments

---

## 12. Success Metrics & Launch Checklist

### Launch Checklist
- [ ] 2 maps fully playable
- [ ] Up to 12 players can join a room
- [ ] Multiplayer sync working (< 200ms latency)
- [ ] Basic customization (player color)
- [ ] Main menu, lobby, results screens polished
- [ ] Mobile-responsive UI
- [ ] Deployed on Vercel + Supabase
- [ ] Public URL working
- [ ] No major bugs or crashes in testing

### Success Metrics
- **Users**: 50-100 concurrent players first week
- **Match quality**: < 0.5% desync complaints
- **Performance**: 60 FPS on mid-range browsers
- **Retention**: 20%+ daily active users (week 2)
- **Community**: Active Discord/forums for feedback

---

## 13. Key Assumptions & Risks

### Assumptions
- Browser games can support 2-4 minute matches with 12 players on free tier infrastructure
- Babylon.js is capable enough for production party game
- Supabase Realtime will handle the synchronization load
- Players have stable internet (good for browser games)

### Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Realtime latency > 500ms | Medium | Add server-side reconciliation, upgrade Supabase tier |
| Player desync issues | Medium | Implement client-side prediction + server authority |
| Browser performance issues | Medium | Profile early, reduce effect density, LOD system |
| Cold start delays | Low | Use edge deployment, pre-load assets |
| Insufficient player base | Medium | Aggressive marketing, invite friends, social features |

---

## Conclusion

LOLBEANS is a achievable, fun, browser-based party game that launches with 2 carefully designed maps, solid multiplayer architecture, and a polished feel. The scope is controlled (no massive feature list), but the foundation is built to grow. By leveraging Vercel + Supabase, the game is deployable on a budget, scalable, and fun.

**Estimated Dev Time (solo)**: 6-8 weeks for MVP
**Estimated Dev Time (team of 2-3)**: 3-4 weeks

Next step: Generate full starter code.
