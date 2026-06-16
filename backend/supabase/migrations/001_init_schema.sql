-- Initialize database schema for Lolbeans
-- Run this migration on Supabase

-- Rooms table
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(5) UNIQUE NOT NULL,
  host_id uuid NOT NULL,
  level_id int NOT NULL CHECK (level_id IN (1, 2)),
  status varchar(20) DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'STARTING', 'IN_PROGRESS', 'ENDED')),
  max_players int DEFAULT 12,
  created_at timestamp DEFAULT now(),
  expires_at timestamp DEFAULT now() + interval '1 hour'
);

-- Players in room table
CREATE TABLE public.players_in_room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name varchar(50) NOT NULL,
  color varchar(7) NOT NULL,
  is_ready boolean DEFAULT false,
  status varchar(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FINISHED', 'ELIMINATED', 'SPECTATING', 'DISCONNECTED')),
  finish_time float,
  joined_at timestamp DEFAULT now()
);

-- Player positions (for real-time sync)
CREATE TABLE public.player_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  x float,
  y float,
  z float,
  vx float,
  vy float,
  vz float,
  updated_at timestamp DEFAULT now()
);

-- Match results/history
CREATE TABLE public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  player_name varchar(50),
  rank int,
  finish_time float,
  qualified boolean,
  level_id int,
  created_at timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_players_in_room_room_id ON public.players_in_room(room_id);
CREATE INDEX idx_players_in_room_player_id ON public.players_in_room(player_id);
CREATE INDEX idx_player_positions_room_id ON public.player_positions(room_id);
CREATE INDEX idx_match_results_room_id ON public.match_results(room_id);

-- Enable Realtime for player_positions table
ALTER PUBLICATION supabase_realtime ADD TABLE player_positions;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players_in_room;
