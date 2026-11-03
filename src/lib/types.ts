export type Section = 'batting' | 'pitching' | 'fielding';

export type StatValue = number | string | null;
export type StatBlock = Record<string, StatValue>;

export type SortDirection = 'asc' | 'desc';

export interface GlossaryEntry {
  abbr: string;
  definition: string;
}

export interface PitchingStats extends StatBlock {
  IPDecimal: number;
  IPOuts: number;
}

export type FieldingStats = StatBlock & {
  positions: Record<string, number>;
  positionCount: number;
  totalInnings: number;
};

export type TeamFieldingStats = FieldingStats & {
  positionTotals: Record<string, number>;
};

export interface Player {
  id: string;
  number: string;
  first: string;
  last: string;
  name: string;
  sourceLast: string;
  batting: StatBlock;
  pitching: PitchingStats | null;
  fielding: FieldingStats;
}

export interface TeamData {
  meta: {
    team: string;
    ageGroup: string;
    season: string;
    games: number;
    playerCount: number;
    sourceFile: string;
    generatedAt: string;
  };
  team: {
    batting: StatBlock;
    pitching: PitchingStats;
    fielding: TeamFieldingStats;
  };
  players: Player[];
  glossary: Record<Section, GlossaryEntry[]>;
  dataQuality: {
    discrepancies: Array<{
      stat: string;
      teamValue: StatValue;
      playerSum: number;
    }>;
    notes: string[];
  };
}
