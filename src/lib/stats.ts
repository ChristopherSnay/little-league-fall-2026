import type { Player, Section, StatValue, TeamData } from './types';

export const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SF'] as const;
export type Position = (typeof POSITIONS)[number];

/* -------------------------------------------------------------------------- */
/* Numbers and formatting                                                     */
/* -------------------------------------------------------------------------- */

export function toNumber(value: StatValue | undefined, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function toNumberOrNull(value: StatValue | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function toOuts(value: StatValue | undefined): number {
  if (typeof value === 'number') return Math.round(value * 3);
  const text = String(value ?? '').trim();
  if (!text) return 0;
  const [whole, fraction] = text.split('.');
  return (Number(whole) || 0) * 3 + (Number(fraction) || 0);
}

export function toDecimalInnings(value: StatValue | undefined): number {
  if (typeof value === 'number') return value;
  return toOuts(value) / 3;
}

export function formatInnings(value: StatValue | undefined): string {
  const outs = toOuts(value);
  if (!outs) return '—';
  const whole = Math.floor(outs / 3);
  const remainder = outs % 3;
  if (remainder === 0) return String(whole);
  return `${whole}${remainder === 1 ? '⅓' : '⅔'}`;
}

export function formatRate(value: StatValue | undefined): string {
  const number = toNumberOrNull(value);
  if (number === null) return '—';
  const fixed = number.toFixed(3);
  if (fixed.startsWith('0.')) return fixed.slice(1);
  if (fixed.startsWith('-0.')) return `-${fixed.slice(2)}`;
  return fixed;
}

export function formatPct(value: StatValue | undefined, digits = 1): string {
  const number = toNumberOrNull(value);
  if (number === null) return '—';
  return `${number.toFixed(digits)}%`;
}

export function formatPctFromRate(value: StatValue | undefined, digits = 1): string {
  const number = toNumberOrNull(value);
  if (number === null) return '—';
  return formatPct(number * 100, digits);
}

export function formatInt(value: StatValue | undefined): string {
  const number = toNumberOrNull(value);
  if (number === null) return '—';
  return String(Math.round(number));
}

export function formatDecimal(value: StatValue | undefined, digits = 2): string {
  const number = toNumberOrNull(value);
  if (number === null) return '—';
  return number.toFixed(digits);
}

export function formatRatio(value: StatValue | undefined, digits = 2): string {
  const number = toNumberOrNull(value);
  if (number === null || number === 0) return '—';
  return number.toFixed(digits);
}

export function formatRaw(value: StatValue | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export function ratePct(numerator: number, denominator: number): number {
  return denominator ? (numerator / denominator) * 100 : 0;
}

const BATTING_RATE = new Set(['AVG', 'OBP', 'OPS', 'SLG', 'BABIP', 'BA/RISP']);
const BATTING_PCT = new Set([
  'SB%',
  'QAB%',
  'C%',
  'LD%',
  'FB%',
  'GB%',
  '2S+3%',
  '6+%',
]);
const BATTING_RATIO = new Set(['PA/BB', 'BB/K', 'PS/PA', 'AB/HR']);
const PITCHING_RATE = new Set(['BAA', 'BA/RISP']);
const PITCHING_PCT = new Set([
  'SV%',
  'SB%',
  'S%',
  'FPS%',
  'FPSO%',
  'FPSW%',
  'FPSH%',
  'SM%',
  'WEAK%',
  'HHB%',
  'LD%',
  'FB%',
  'GB%',
  '<3%',
]);
const PITCHING_PCT_RATE = new Set(['K/BF']);
const PITCHING_RATIO = new Set([
  'ERA',
  'WHIP',
  'FIP',
  'K/BB',
  'P/IP',
  'P/BF',
  'BB/INN',
  'GO/AO',
]);
const FIELDING_RATE = new Set(['FPCT']);
const FIELDING_PCT = new Set(['CS%']);
const FIELDING_INNINGS = new Set<string>([...POSITIONS, 'Total']);

/** Formats any raw CSV stat key for the full stat sheets in the player drawer. */
export function formatStat(section: Section, key: string, value: StatValue | undefined): string {
  if (value === null || value === undefined || value === '') return '—';

  if (section === 'batting') {
    if (BATTING_RATE.has(key)) return formatRate(value);
    if (BATTING_PCT.has(key)) return formatPct(value);
    if (BATTING_RATIO.has(key)) return formatDecimal(value, 2);
  }

  if (section === 'pitching') {
    if (key === 'IP') return formatInnings(value);
    if (PITCHING_RATE.has(key)) return formatRate(value);
    if (PITCHING_PCT.has(key)) return formatPct(value);
    if (PITCHING_PCT_RATE.has(key)) return formatPctFromRate(value);
    if (PITCHING_RATIO.has(key)) return formatDecimal(value, 2);
  }

  if (section === 'fielding') {
    if (FIELDING_INNINGS.has(key)) return formatInnings(value);
    if (FIELDING_RATE.has(key)) return formatRate(value);
    if (FIELDING_PCT.has(key)) return formatPct(value);
  }

  return formatRaw(value);
}

/* -------------------------------------------------------------------------- */
/* Batting / pitching rate helpers                                            */
/* -------------------------------------------------------------------------- */

export function battingTob(player: Player): number {
  return (
    toNumber(player.batting.H) +
    toNumber(player.batting.BB) +
    toNumber(player.batting.HBP)
  );
}

export function battingBbPct(player: Player): number {
  return ratePct(toNumber(player.batting.BB), toNumber(player.batting.PA));
}

export function battingKPct(player: Player): number {
  return ratePct(toNumber(player.batting.SO), toNumber(player.batting.PA));
}

export function battingHbpPct(player: Player): number {
  return ratePct(toNumber(player.batting.HBP), toNumber(player.batting.PA));
}

export function isPitcher(
  player: Player,
): player is Player & { pitching: NonNullable<Player['pitching']> } {
  return player.pitching !== null;
}

export function pitchingBf(player: Player): number {
  return player.pitching ? toNumber(player.pitching.BF) : 0;
}

export function pitchingBbPct(player: Player): number {
  return player.pitching ? ratePct(toNumber(player.pitching.BB), pitchingBf(player)) : 0;
}

export function pitchingKPct(player: Player): number {
  return player.pitching ? ratePct(toNumber(player.pitching.SO), pitchingBf(player)) : 0;
}

export function pitchingHbpPct(player: Player): number {
  return player.pitching ? ratePct(toNumber(player.pitching.HBP), pitchingBf(player)) : 0;
}

export function pitchingOtherPct(player: Player): number {
  if (!player.pitching) return 0;
  const other =
    pitchingBf(player) -
    toNumber(player.pitching.H) -
    toNumber(player.pitching.BB) -
    toNumber(player.pitching.HBP) -
    toNumber(player.pitching.SO);
  return ratePct(other, pitchingBf(player));
}

/* -------------------------------------------------------------------------- */
/* Positions                                                                  */
/* -------------------------------------------------------------------------- */

export function positionEntries(player: Player): Array<{ position: Position; innings: number }> {
  return POSITIONS.map((position) => ({
    position,
    innings: player.fielding.positions[position] ?? 0,
  }))
    .filter((entry) => entry.innings > 0)
    .sort((a, b) => b.innings - a.innings);
}

/* -------------------------------------------------------------------------- */
/* Team summary                                                               */
/* -------------------------------------------------------------------------- */

export interface TeamSummary {
  games: number;
  players: number;
  runs: number;
  runsAllowed: number;
  runDiff: number;
  runsPerGame: number;
  runsAllowedPerGame: number;
  pa: number;
  ab: number;
  h: number;
  bb: number;
  hbp: number;
  so: number;
  tob: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  bbRate: number;
  kRate: number;
  hRate: number;
  hbpRate: number;
  otherRate: number;
  qab: number;
  qabPct: number;
  sb: number;
  cs: number;
  sbPct: number;
  ip: number;
  ipDisplay: string;
  bf: number;
  pitchH: number;
  pitchBb: number;
  pitchHbp: number;
  pitchSo: number;
  pitchOther: number;
  pitchBbRate: number;
  pitchKRate: number;
  pitchHbpRate: number;
  pitchOtherRate: number;
  ballsInPlay: number;
  bbHbpSoRate: number;
  era: number;
  whip: number;
  baa: number;
  fpct: number;
  errors: number;
  tc: number;
}

export function getTeamSummary(data: TeamData): TeamSummary {
  const batting = data.team.batting;
  const pitching = data.team.pitching;
  const fielding = data.team.fielding;

  const pa = toNumber(batting.PA);
  const ab = toNumber(batting.AB);
  const h = toNumber(batting.H);
  const bb = toNumber(batting.BB);
  const hbp = toNumber(batting.HBP);
  const so = toNumber(batting.SO);
  const runs = toNumber(batting.R);
  const runsAllowed = toNumber(pitching.R);
  const games = data.meta.games || 0;

  const bf = toNumber(pitching.BF);
  const pitchH = toNumber(pitching.H);
  const pitchBb = toNumber(pitching.BB);
  const pitchHbp = toNumber(pitching.HBP);
  const pitchSo = toNumber(pitching.SO);
  const pitchOther = bf - pitchH - pitchBb - pitchHbp - pitchSo;
  const ballsInPlay = bf - pitchBb - pitchHbp - pitchSo;

  const qab = toNumber(batting.QAB);
  const sb = toNumber(batting.SB);
  const cs = toNumber(batting.CS);

  return {
    games,
    players: data.players.length,
    runs,
    runsAllowed,
    runDiff: runs - runsAllowed,
    runsPerGame: games ? runs / games : 0,
    runsAllowedPerGame: games ? runsAllowed / games : 0,
    pa,
    ab,
    h,
    bb,
    hbp,
    so,
    tob: h + bb + hbp,
    avg: toNumberOrNull(batting.AVG) ?? (ab ? h / ab : 0),
    obp:
      toNumberOrNull(batting.OBP) ??
      (ab + bb + hbp ? (h + bb + hbp) / (ab + bb + hbp) : 0),
    slg: toNumberOrNull(batting.SLG) ?? (ab ? toNumber(batting.TB) / ab : 0),
    ops:
      toNumberOrNull(batting.OPS) ??
      (toNumberOrNull(batting.OBP) ?? 0) + (toNumberOrNull(batting.SLG) ?? 0),
    bbRate: ratePct(bb, pa),
    kRate: ratePct(so, pa),
    hRate: ratePct(h, pa),
    hbpRate: ratePct(hbp, pa),
    otherRate: ratePct(pa - h - bb - hbp - so, pa),
    qab,
    qabPct: ratePct(qab, pa),
    sb,
    cs,
    sbPct: ratePct(sb, sb + cs),
    ip: toDecimalInnings(pitching.IP),
    ipDisplay: formatInnings(pitching.IP),
    bf,
    pitchH,
    pitchBb,
    pitchHbp,
    pitchSo,
    pitchOther,
    pitchBbRate: ratePct(pitchBb, bf),
    pitchKRate: ratePct(pitchSo, bf),
    pitchHbpRate: ratePct(pitchHbp, bf),
    pitchOtherRate: ratePct(pitchOther, bf),
    ballsInPlay,
    bbHbpSoRate: ratePct(pitchBb + pitchHbp + pitchSo, bf),
    era: toNumber(pitching.ERA),
    whip: toNumber(pitching.WHIP),
    baa: toNumber(pitching.BAA),
    fpct: toNumber(fielding.FPCT),
    errors: toNumber(fielding.E),
    tc: toNumber(fielding.TC),
  };
}

/* -------------------------------------------------------------------------- */
/* Radar / comparison metrics                                                 */
/* -------------------------------------------------------------------------- */

export interface RadarMetric {
  key: string;
  label: string;
  better: 'high' | 'low';
  value: (player: Player) => number;
  format: (value: number) => string;
}

export const RADAR_METRICS: RadarMetric[] = [
  {
    key: 'avg',
    label: 'AVG',
    better: 'high',
    value: (player) => toNumber(player.batting.AVG),
    format: (value) => formatRate(value),
  },
  {
    key: 'obp',
    label: 'OBP',
    better: 'high',
    value: (player) => toNumber(player.batting.OBP),
    format: (value) => formatRate(value),
  },
  {
    key: 'slg',
    label: 'SLG',
    better: 'high',
    value: (player) => toNumber(player.batting.SLG),
    format: (value) => formatRate(value),
  },
  {
    key: 'ops',
    label: 'OPS',
    better: 'high',
    value: (player) => toNumber(player.batting.OPS),
    format: (value) => formatRate(value),
  },
  {
    key: 'bbPct',
    label: 'BB%',
    better: 'high',
    value: battingBbPct,
    format: (value) => formatPct(value),
  },
  {
    key: 'kPct',
    label: 'K%',
    better: 'low',
    value: battingKPct,
    format: (value) => formatPct(value),
  },
  {
    key: 'qabPct',
    label: 'QAB%',
    better: 'high',
    value: (player) => toNumber(player.batting['QAB%']),
    format: (value) => formatPct(value),
  },
  {
    key: 'sb',
    label: 'SB',
    better: 'high',
    value: (player) => toNumber(player.batting.SB),
    format: (value) => formatInt(value),
  },
  {
    key: 'fpct',
    label: 'FPCT',
    better: 'high',
    value: (player) => toNumber(player.fielding.FPCT),
    format: (value) => formatRate(value),
  },
];

export interface RadarSeriesData {
  label: string;
  values: number[];
}

export function buildRadarSeries(allPlayers: Player[], selected: Player[]): RadarSeriesData[] {
  const allValues = allPlayers.map((player) => RADAR_METRICS.map((metric) => metric.value(player)));
  const minimums = RADAR_METRICS.map((_, index) =>
    Math.min(...allValues.map((values) => values[index])),
  );
  const maximums = RADAR_METRICS.map((_, index) =>
    Math.max(...allValues.map((values) => values[index])),
  );

  return selected.map((player) => ({
    label: player.name,
    values: RADAR_METRICS.map((metric, index) => {
      const minimum = minimums[index];
      const maximum = maximums[index];
      const normalized =
        maximum === minimum ? 50 : ((metric.value(player) - minimum) / (maximum - minimum)) * 100;
      return Math.round(metric.better === 'low' ? 100 - normalized : normalized);
    }),
  }));
}
