import type { Player } from './types';

export const TABS = [
  { key: 'overview', label: 'Overview', path: '/overview' },
  { key: 'batting', label: 'Batting', path: '/batting' },
  { key: 'pitching', label: 'Pitching', path: '/pitching' },
  { key: 'fielding', label: 'Fielding', path: '/fielding' },
  { key: 'players', label: 'Players', path: '/players' },
  { key: 'glossary', label: 'Glossary', path: '/glossary' },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

export type PlayerSelectContext = {
  onSelectPlayer: (player: Player) => void;
};
