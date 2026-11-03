import type { Player, TeamData } from './types';
import {
  formatDecimal,
  formatInnings,
  formatPct,
  formatRate,
  getTeamSummary,
  POSITIONS,
  toNumber,
} from './stats';

export type InsightTone = 'primary' | 'secondary' | 'success' | 'warning' | 'info';

export interface Insight {
  title: string;
  value: string;
  detail: string;
  tone: InsightTone;
}

function playerByLast(data: TeamData, last: string): Player {
  const player = data.players.find((candidate) => candidate.last === last);
  if (!player) throw new Error(`Could not find player ${last}`);
  return player;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function buildInsights(data: TeamData): Insight[] {
  const summary = getTeamSummary(data);
  const adams = playerByLast(data, 'Adams');
  const jahn = playerByLast(data, 'Jahn');
  const zeroHitPlayers = data.players.filter((player) => toNumber(player.batting.H) === 0);
  const zeroHitRuns = zeroHitPlayers.reduce(
    (total, player) => total + toNumber(player.batting.R),
    0,
  );
  const zeroHitWalks = zeroHitPlayers.reduce(
    (total, player) => total + toNumber(player.batting.BB),
    0,
  );
  const zeroHitHbp = zeroHitPlayers.reduce(
    (total, player) => total + toNumber(player.batting.HBP),
    0,
  );
  const allTen = data.players.filter(
    (player) => player.fielding.positionCount === POSITIONS.length,
  );
  const teamHomeRuns = toNumber(data.team.batting.HR);
  const teamExtraBaseHits = toNumber(data.team.batting.XBH);

  return [
    {
      title: 'Walk-first offense',
      value: `${summary.bb} BB`,
      detail: `${formatPct(summary.bbRate)} of plate appearances, with ${summary.h} hits and a ${formatRate(summary.obp)} team OBP.`,
      tone: 'info',
    },
    {
      title: 'Zero-hit on-base trio',
      value: `${zeroHitRuns} R`,
      detail: `${joinNames(zeroHitPlayers.map((player) => player.last))}: 0 H, ${zeroHitWalks} BB, ${zeroHitHbp} HBP.`,
      tone: 'secondary',
    },
    {
      title: 'Two-way ace',
      value: `${formatRate(adams.batting.OPS)} OPS`,
      detail: `Adams: ${formatIntValue(adams.batting.R)} R at the plate; ${formatInnings(adams.pitching?.IP)} IP, ${formatIntValue(adams.pitching?.SO)} SO, ${formatRate(adams.pitching?.BAA)} BAA on the mound.`,
      tone: 'primary',
    },
    {
      title: 'Zero hits allowed',
      value: `${formatIntValue(jahn.pitching?.H)} H`,
      detail: `Jahn: ${formatInnings(jahn.pitching?.IP)} IP, ${formatIntValue(jahn.pitching?.BB)} BB, ${formatIntValue(jahn.pitching?.SO)} SO, ${formatDecimal(jahn.pitching?.ERA)} ERA.`,
      tone: 'warning',
    },
    {
      title: 'Everywhere men',
      value: `${allTen.length} players`,
      detail: `${joinNames(allTen.map((player) => player.last))} each appeared at all ten fielding positions.`,
      tone: 'success',
    },
    {
      title: 'Only homer',
      value: `${teamHomeRuns} HR`,
      detail: `Colby Jahn supplied it; the team finished with ${teamExtraBaseHits} extra-base hits.`,
      tone: 'secondary',
    },
    {
      title: 'Balls in play were rare',
      value: `${summary.ballsInPlay}`,
      detail: `${formatPct(summary.bbHbpSoRate)} of opponent plate appearances ended in a walk, HBP, or strikeout.`,
      tone: 'info',
    },
    {
      title: 'Run differential',
      value: `${summary.runDiff >= 0 ? '+' : ''}${summary.runDiff}`,
      detail: `${summary.runs} scored and ${summary.runsAllowed} allowed over ${summary.games} games.`,
      tone: summary.runDiff >= 0 ? 'success' : 'warning',
    },
  ];
}

function formatIntValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? String(Math.round(number)) : String(value);
}
