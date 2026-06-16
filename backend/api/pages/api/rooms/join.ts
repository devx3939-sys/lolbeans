import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/**
 * Join an existing room by code
 * POST /api/rooms/join
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, playerId, playerName, playerColor } = req.body;

  if (!code || !playerId || !playerName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Find room by code
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (roomError || !roomData) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room is full
    const { count, error: countError } = await supabase
      .from('players_in_room')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id);

    if (count! >= roomData.max_players) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Add player to room
    const { error: playerError } = await supabase
      .from('players_in_room')
      .insert({
        player_id: playerId,
        room_id: roomData.id,
        name: playerName,
        color: playerColor,
        is_ready: false,
      });

    if (playerError) throw playerError;

    // Get all players in room
    const { data: playersData, error: playersError } = await supabase
      .from('players_in_room')
      .select('*')
      .eq('room_id', roomData.id);

    if (playersError) throw playersError;

    return res.status(200).json({
      id: roomData.id,
      code: roomData.code,
      hostId: roomData.host_id,
      levelId: roomData.level_id,
      status: roomData.status,
      players: playersData?.map((p: any) => ({
        id: p.player_id,
        name: p.name,
        color: p.color,
        isReady: p.is_ready,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error('Room join error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
}
