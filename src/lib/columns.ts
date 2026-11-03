import type { Player, Section, SortDirection, StatValue } from './types';
import {
  formatDecimal,
  formatInnings,
  formatInt,
  formatPct,
  formatPctFromRate,
  formatRate,
  formatRatio,
} from './stats';

export interface Column<T> {
  key: string;
  label: string;
  section: Section;
  align?: 'left' | 'right';
  value: (row: T) => StatValue;
  format?: (value: StatValue) => string;
  defaultSortDirection?: SortDirection;
  minWidth?: number;
}

const fmt2 = (value: StatValue) => formatDecimal(value, 2);
const fmtRatio2 = (value: StatValue) => formatRatio(value, 2);
const fmtInnings = (value: StatValue) => formatInnings(value);
const fmtPct = (value: StatValue) => formatPct(value);
const fmtPctRate = (value: StatValue) => formatPctFromRate(value);
const fmtInt = (value: StatValue) => formatInt(value);
const fmtRate = (value: StatValue) => formatRate(value);

function bat(
  key: string,
  label: string,
  format: Column<Player>['format'] = fmtInt,
): Column<Player> {
  return {
    key,
    label,
    section: 'batting',
    value: (player) => player.batting[key] ?? null,
    format,
  };
}

function pit(
  key: string,
  label: string,
  format: Column<Player>['format'] = fmtInt,
  defaultSortDirection?: SortDirection,
): Column<Player> {
  return {
    key,
    label,
    section: 'pitching',
    value: (player) => player.pitching?.[key] ?? null,
    format,
    defaultSortDirection,
  };
}

function fld(
  key: string,
  label: string,
  format: Column<Player>['format'] = fmtInt,
): Column<Player> {
  return {
    key,
    label,
    section: 'fielding',
    value: (player) => player.fielding[key] ?? null,
    format,
  };
}

export interface BattingGroup {
  key: string;
  label: string;
  columns: Column<Player>[];
}

export const BATTING_GROUPS: BattingGroup[] = [
  {
    key: 'core',
    label: 'Core',
    columns: [
      bat('GP', 'GP'),
      bat('PA', 'PA'),
      bat('AB', 'AB'),
      bat('AVG', 'AVG', fmtRate),
      bat('OBP', 'OBP', fmtRate),
      bat('OPS', 'OPS', fmtRate),
      bat('SLG', 'SLG', fmtRate),
      bat('H', 'H'),
      bat('1B', '1B'),
      bat('2B', '2B'),
      bat('3B', '3B'),
      bat('HR', 'HR'),
      bat('RBI', 'RBI'),
      bat('R', 'R'),
      bat('BB', 'BB'),
      bat('SO', 'SO'),
      bat('SB', 'SB'),
    ],
  },
  {
    key: 'discipline',
    label: 'Discipline',
    columns: [
      bat('K-L', 'K-L'),
      bat('HBP', 'HBP'),
      bat('QAB', 'QAB'),
      bat('QAB%', 'QAB%', fmtPct),
      bat('PA/BB', 'PA/BB', fmt2),
      bat('BB/K', 'BB/K', fmt2),
      bat('C%', 'C%', fmtPct),
      bat('PS', 'PS'),
      bat('PS/PA', 'PS/PA', fmt2),
      bat('2S+3', '2S+3'),
      bat('2S+3%', '2S+3%', fmtPct),
      bat('6+', '6+'),
      bat('6+%', '6+%', fmtPct),
    ],
  },
  {
    key: 'batted-ball',
    label: 'Batted ball',
    columns: [
      bat('HHB', 'HHB'),
      bat('LD%', 'LD%', fmtPct),
      bat('FB%', 'FB%', fmtPct),
      bat('GB%', 'GB%', fmtPct),
      bat('BABIP', 'BABIP', fmtRate),
      bat('XBH', 'XBH'),
      bat('TB', 'TB'),
      bat('AB/HR', 'AB/HR', fmtRatio2),
      bat('BA/RISP', 'BA/RISP', fmtRate),
    ],
  },
  {
    key: 'situational',
    label: 'Situational',
    columns: [
      bat('SB', 'SB'),
      bat('SB%', 'SB%', fmtPct),
      bat('CS', 'CS'),
      bat('LOB', 'LOB'),
      bat('2OUTRBI', '2OUTRBI'),
      bat('ROE', 'ROE'),
      bat('FC', 'FC'),
      bat('SAC', 'SAC'),
      bat('SF', 'SF'),
      bat('GIDP', 'GIDP'),
      bat('GITP', 'GITP'),
      bat('CI', 'CI'),
    ],
  },
];

export const PITCHING_COLUMNS: Column<Player>[] = [
  pit('IP', 'IP', fmtInnings),
  pit('GP', 'GP'),
  pit('GS', 'GS'),
  pit('BF', 'BF'),
  pit('#P', '#P'),
  pit('H', 'H'),
  pit('R', 'R'),
  pit('ER', 'ER'),
  pit('BB', 'BB'),
  pit('SO', 'SO'),
  pit('K-L', 'K-L'),
  pit('HBP', 'HBP'),
  pit('ERA', 'ERA', fmt2, 'asc'),
  pit('WHIP', 'WHIP', fmt2, 'asc'),
  pit('BAA', 'BAA', fmtRate, 'asc'),
  pit('FIP', 'FIP', fmt2, 'asc'),
  pit('K/BF', 'K/BF', fmtPctRate),
  pit('K/BB', 'K/BB', fmt2),
  pit('S%', 'S%', fmtPct),
  pit('FPS%', 'FPS%', fmtPct),
  pit('SM%', 'SM%', fmtPct),
  pit('GO/AO', 'GO/AO', fmtRatio2),
  pit('WEAK%', 'WEAK%', fmtPct),
  pit('HHB%', 'HHB%', fmtPct),
];

export const FIELDING_COLUMNS: Column<Player>[] = [
  fld('TC', 'TC'),
  fld('PO', 'PO'),
  fld('A', 'A'),
  fld('E', 'E'),
  fld('FPCT', 'FPCT', fmtRate),
  fld('DP', 'DP'),
  fld('TP', 'TP'),
  fld('PB', 'PB'),
  fld('SB', 'SB'),
  fld('SBATT', 'SBATT'),
  fld('CS', 'CS'),
  fld('CS%', 'CS%', fmtPct),
  fld('PIK', 'PIK'),
  {
    key: 'Pos',
    label: 'Pos',
    section: 'fielding',
    value: (player) => player.fielding.positionCount,
    format: fmtInt,
  },
  fld('Total', 'Total', fmtInnings),
];
