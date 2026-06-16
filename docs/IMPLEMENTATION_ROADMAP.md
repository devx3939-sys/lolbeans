# LOLBEANS - Implementation Roadmap

## Getting Started

### Week 1: Core Systems
- [x] Project setup (Vite + React + TypeScript)
- [x] Babylon.js initialization
- [x] Basic player controller (movement, jumping)
- [x] Input handling (keyboard + gamepad)
- [x] Zustand store setup
- [ ] Supabase integration
- [ ] First level prototype

### Week 2: Multiplayer
- [ ] Room creation API
- [ ] Room joining API
- [ ] Realtime player sync
- [ ] Lobby UI implementation
- [ ] Match start flow

### Week 3: Levels
- [ ] Level 1: Candy Garden (full implementation)
- [ ] Level 2: Storm Factory (full implementation)
- [ ] Obstacle types (moving, rotating, platforms)
- [ ] Finish line logic

### Week 4: Polish
- [ ] UI screens (main menu, results)
- [ ] Sound effects
- [ ] Particle effects
- [ ] Performance optimization
- [ ] Mobile testing

### Week 5: Deployment
- [ ] Vercel setup
- [ ] Supabase production config
- [ ] Custom domain
- [ ] Public testing

---

## Development Checklist

### Frontend Components
- [ ] MainMenu screen
  - [ ] Name input
  - [ ] Color picker
  - [ ] Settings panel
  - [ ] Navigation buttons
  
- [ ] LobbyScreen
  - [ ] Player list
  - [ ] Ready-up button
  - [ ] Chat (optional)
  - [ ] Countdown timer
  
- [ ] GameScene
  - [ ] 3D canvas
  - [ ] HUD overlay
  - [ ] Score/timer display
  - [ ] Controls hint
  
- [ ] ResultsScreen
  - [ ] Leaderboard
  - [ ] Stats (time, rank, etc.)
  - [ ] Next/Main menu buttons

### Game Systems
- [ ] BabylonSetup
  - [ ] Engine creation
  - [ ] Scene setup
  - [ ] Camera configuration
  - [ ] Lighting setup
  
- [ ] GameLoop
  - [ ] Update loop
  - [ ] Physics integration
  - [ ] Collision detection
  - [ ] State sync
  
- [ ] PlayerController
  - [ ] Movement physics
  - [ ] Jump mechanics
  - [ ] Ground detection
  - [ ] Bounds checking
  
- [ ] InputHandler
  - [ ] Keyboard support
  - [ ] Gamepad support
  - [ ] Mobile touch (optional)
  - [ ] Input buffering

### Multiplayer
- [ ] RoomManager
  - [ ] Create room
  - [ ] Join room
  - [ ] Leave room
  - [ ] Get room by code
  
- [ ] RealtimeSync
  - [ ] Connect to channel
  - [ ] Subscribe to updates
  - [ ] Broadcast state
  - [ ] Handle disconnections
  
- [ ] Server API Routes
  - [ ] POST /api/rooms/create
  - [ ] POST /api/rooms/join
  - [ ] POST /api/rooms/{id}/leave
  - [ ] POST /api/rooms/{id}/start
  - [ ] POST /api/rooms/{id}/ready
  - [ ] GET /api/rooms/{id}

### Database
- [ ] Supabase project setup
- [ ] Tables created
  - [ ] rooms
  - [ ] players_in_room
  - [ ] player_positions
  - [ ] match_results
- [ ] Indexes created
- [ ] Realtime enabled
- [ ] RLS policies (optional for v1)

### Levels
- [ ] Level 1: Candy Garden
  - [ ] Spawn area
  - [ ] Rolling gumballs
  - [ ] Spinning candy canes
  - [ ] Frosting platforms
  - [ ] Chocolate bridges
  - [ ] Cookie slope
  - [ ] Finish gate
  
- [ ] Level 2: Storm Factory
  - [ ] Spawn area (conveyor)
  - [ ] Fan gauntlet
  - [ ] Conveyor madness
  - [ ] Electrical platforms
  - [ ] Spinning maze
  - [ ] Collapsing platforms
  - [ ] Finish door

### Polish
- [ ] UI/UX
  - [ ] Color scheme consistent
  - [ ] Buttons responsive
  - [ ] Loading states
  - [ ] Error messages
  - [ ] Mobile responsive
  
- [ ] Audio (optional for v1)
  - [ ] Jump sound
  - [ ] Land sound
  - [ ] Collision sound
  - [ ] Finish sound
  - [ ] Background music
  
- [ ] Visuals
  - [ ] Particle effects (optional)
  - [ ] Screen shake on collision
  - [ ] Victory animation
  - [ ] Lighting tweaks

### Testing
- [ ] Unit tests (core systems)
- [ ] Integration tests (multiplayer)
- [ ] E2E tests (full game flow)
- [ ] Performance profiling
- [ ] Mobile testing
- [ ] Network lag testing
- [ ] Disconnect recovery

### Documentation
- [ ] Code comments
- [ ] API documentation
- [ ] Level design guide
- [ ] Contributing guide
- [ ] Video tutorials

---

## Estimated Timeline

- **MVP (2 maps)**: 4-5 weeks (solo dev)
- **Polished + Deployment**: 5-6 weeks
- **Post-launch updates**: Ongoing

---

## Performance Targets

- **FPS**: 60 (maintain)
- **Frame time**: < 16ms
- **Memory**: < 200MB
- **Network**: < 200ms latency
- **Load time**: < 3 seconds

---

## Known Limitations (MVP)

- No accounts (just session-based)
- No persistent cosmetics
- No chat
- No spectator mode
- No replay system
- Limited customization

---

## Success Criteria (Launch)

✅ Can create/join rooms online
✅ 2-12 players can play together
✅ Both maps playable
✅ < 200ms average latency
✅ No major bugs or crashes
✅ Mobile responsive
✅ Publicly deployable URL

---

## Post-Launch Priorities

1. Gather player feedback
2. Monitor performance metrics
3. Add sound effects (high impact, low effort)
4. Add more maps (high impact, medium effort)
5. Implement cosmetics shop (medium impact, high effort)

---

## Resources

- **Babylon.js Docs**: https://doc.babylonjs.com
- **React Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Zustand**: https://github.com/pmndrs/zustand

---

## Contributors

- Lead Developer: [You]
- 3D Artist: [Needed]
- Audio Designer: [Needed]
- Community Manager: [Needed]

---

Last Updated: [Date]
Next Review: [Date]
