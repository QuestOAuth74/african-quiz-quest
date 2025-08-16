export interface WheelGameChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: string;
  game_config: any;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface LobbyPlayer {
  user_id: string;
  display_name: string;
  player_status: string;
  last_seen: string;
  is_online: boolean;
}