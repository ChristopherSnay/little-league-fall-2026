import rawData from './team.json';
import type { Player, TeamData } from '../lib/types';

export const TEAM = rawData as unknown as TeamData;
export const PLAYERS = TEAM.players;
export const PITCHERS = PLAYERS.filter(
  (player): player is Player & { pitching: NonNullable<Player['pitching']> } =>
    player.pitching !== null,
);
