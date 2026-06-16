import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/**
 * Create a new room
 * POST /api/rooms/create
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostId, hostName, playerColor, levelId } = req.body;

  if (!hostId || !hostName || !levelId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Generate room code (5 alphanumeric characters)
    const code = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    // Create room
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        host_id: hostId,
        level_id: levelId,
        status: 'LOBBY',
        max_players: 12,
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add host as player
    const { error: playerError } = await supabase
      .from('players_in_room')
      .insert({
        player_id: hostId,
        room_id: roomData.id,
        name: hostName,
        color: playerColor,
        is_ready: false,
      });

    if (playerError) throw playerError;

    return res.status(201).json({
      id: roomData.id,
      code: roomData.code,
      hostId: roomData.host_id,
      levelId: roomData.level_id,
      status: 'LOBBY',
      players: [
        {
          id: hostId,
          name: hostName,
          color: playerColor,
          isReady: false,
          status: 'ACTIVE',
        },
      ],
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}
