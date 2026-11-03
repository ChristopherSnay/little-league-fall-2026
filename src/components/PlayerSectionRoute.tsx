import { useOutletContext } from 'react-router-dom';
import { Batting } from '../sections/Batting';
import { Fielding } from '../sections/Fielding';
import { Pitching } from '../sections/Pitching';
import { Players } from '../sections/Players';
import type { PlayerSelectContext } from '../lib/navigation';

export type PlayerSection = 'batting' | 'pitching' | 'fielding' | 'players';

export function PlayerSectionRoute({ section }: { section: PlayerSection }) {
  const { onSelectPlayer } = useOutletContext<PlayerSelectContext>();

  switch (section) {
    case 'batting':
      return <Batting onSelectPlayer={onSelectPlayer} />;
    case 'pitching':
      return <Pitching onSelectPlayer={onSelectPlayer} />;
    case 'fielding':
      return <Fielding onSelectPlayer={onSelectPlayer} />;
    case 'players':
      return <Players onSelectPlayer={onSelectPlayer} />;
  }
}
