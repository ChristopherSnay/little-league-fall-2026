import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const csvPath = path.join(root, 'JCBombers10UStatsFall2026.csv');
const outPath = path.join(root, 'src', 'data', 'team.json');

const POSITION_KEYS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SF'];
const FIELDING_INNINGS_KEYS = new Set([...POSITION_KEYS, 'Total']);

const text = fs.readFileSync(csvPath, 'utf8');
const rows = parse(text, {
  bom: true,
  relax_column_count: false,
  skip_empty_lines: false,
});

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(rows.length === 17, `Expected 17 CSV rows, found ${rows.length}`);
rows.forEach((row, index) => {
  assert(row.length === 180, `Expected 180 columns on row ${index + 1}, found ${row.length}`);
});

const sectionRow = rows[0];
const headerRow = rows[1];
const glossaryRow = rows[16];

const sectionAt = [];
let currentSection = null;
for (let i = 0; i < headerRow.length; i += 1) {
  if (sectionRow[i]?.trim()) {
    currentSection = sectionRow[i].trim().toLowerCase();
  }
  sectionAt[i] = currentSection;
}

const sections = { batting: [], pitching: [], fielding: [] };
for (let i = 3; i < headerRow.length; i += 1) {
  const section = sectionAt[i];
  const key = headerRow[i]?.trim();
  if (section && key) {
    sections[section].push({ index: i, key });
  }
}

assert(sections.batting.length > 0, 'No batting columns found');
assert(sections.pitching.length > 0, 'No pitching columns found');
assert(sections.fielding.length > 0, 'No fielding columns found');

const glossary = { batting: [], pitching: [], fielding: [] };
for (const section of Object.keys(sections)) {
  for (const { index, key } of sections[section]) {
    const raw = (glossaryRow[index] ?? '').trim();
    if (!raw) continue;
    const equalsIndex = raw.indexOf('=');
    const abbr = equalsIndex >= 0 ? raw.slice(0, equalsIndex).trim() : key;
    const definition = equalsIndex >= 0 ? raw.slice(equalsIndex + 1).trim() : raw;
    glossary[section].push({ abbr, definition });
  }
}

function toOuts(innings) {
  const value = String(innings ?? '').trim();
  if (!value) return 0;
  const [whole, fraction] = value.split('.');
  return (Number(whole) || 0) * 3 + (Number(fraction) || 0);
}

function toDecimalInnings(innings) {
  return toOuts(innings) / 3;
}

function parseValue(section, key, raw) {
  const value = (raw ?? '').trim();
  if (!value) return null;

  const isInnings =
    (section === 'pitching' && key === 'IP') ||
    (section === 'fielding' && FIELDING_INNINGS_KEYS.has(key));

  if (isInnings) return value;

  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

function parseBlock(row, section) {
  const block = {};
  for (const { index, key } of sections[section]) {
    block[key] = parseValue(section, key, row[index]);
  }
  return block;
}

function derivePitching(block) {
  return {
    ...block,
    IPDecimal: toDecimalInnings(block.IP),
    IPOuts: toOuts(block.IP),
  };
}

function deriveFielding(block) {
  const positions = {};
  for (const key of POSITION_KEYS) {
    positions[key] = toDecimalInnings(block[key]);
  }

  return {
    ...block,
    positions,
    positionCount: POSITION_KEYS.filter((key) => positions[key] > 0).length,
    totalInnings: toDecimalInnings(block.Total),
  };
}

const teamRowIndex = rows.findIndex((row) => row[0]?.trim() === 'Team');
const glossaryRowIndex = rows.findIndex((row) => row[0]?.trim() === 'Glossary');
assert(teamRowIndex > 0, 'Could not find the Team row');
assert(glossaryRowIndex === 16, 'Could not find the Glossary row');

const playerRows = rows.slice(2, teamRowIndex);
assert(playerRows.length === 13, `Expected 13 players, found ${playerRows.length}`);

const players = playerRows.map((row) => {
  const rawLast = (row[1] ?? '').trim();
  const last = rawLast === 'MCCoy' ? 'McCoy' : rawLast;
  const first = (row[2] ?? '').trim();
  const pitching = derivePitching(parseBlock(row, 'pitching'));

  return {
    id: `${last}-${first}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    number: (row[0] ?? '').trim(),
    first,
    last,
    name: `${first} ${last}`,
    sourceLast: rawLast,
    batting: parseBlock(row, 'batting'),
    pitching: pitching.IPOuts > 0 ? pitching : null,
    fielding: deriveFielding(parseBlock(row, 'fielding')),
  };
});

const teamBatting = parseBlock(rows[teamRowIndex], 'batting');
const teamPitching = derivePitching(parseBlock(rows[teamRowIndex], 'pitching'));
const teamFielding = deriveFielding(parseBlock(rows[teamRowIndex], 'fielding'));

teamFielding.positionTotals = Object.fromEntries(
  POSITION_KEYS.map((key) => [
    key,
    players.reduce((total, player) => total + (player.fielding.positions[key] || 0), 0),
  ]),
);

const sumPlayerStat = (section, key) =>
  players.reduce((total, player) => {
    const value = player[section]?.[key];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);

const discrepancyChecks = [
  { stat: 'Runs (R)', label: 'R', section: 'batting', team: teamBatting.R },
  { stat: 'Fielding chances (TC)', label: 'TC', section: 'fielding', team: teamFielding.TC },
  { stat: 'Putouts (PO)', label: 'PO', section: 'fielding', team: teamFielding.PO },
  { stat: 'Double plays (DP)', label: 'DP', section: 'fielding', team: teamFielding.DP },
  { stat: 'Stolen bases allowed (SB)', label: 'SB', section: 'fielding', team: teamFielding.SB },
  { stat: 'Caught stealing (CS)', label: 'CS', section: 'fielding', team: teamFielding.CS },
  { stat: 'Runners left on base (LOB)', label: 'LOB', section: 'batting', team: teamBatting.LOB },
];

const discrepancies = discrepancyChecks
  .map((check) => ({
    stat: check.stat,
    teamValue: check.team,
    playerSum: sumPlayerStat(check.section, check.label),
  }))
  .filter((check) => check.teamValue !== check.playerSum);

const data = {
  meta: {
    team: 'JC Bombers',
    ageGroup: '10U',
    season: 'Fall 2026',
    games: Number(teamBatting.GP) || 0,
    playerCount: players.length,
    sourceFile: path.basename(csvPath),
    generatedAt: new Date().toISOString(),
  },
  team: {
    batting: teamBatting,
    pitching: teamPitching,
    fielding: teamFielding,
  },
  players,
  glossary,
  dataQuality: {
    discrepancies,
    notes: [
      'The source CSV contains season totals only. There are no dates, opponents, game logs, or win/loss record.',
      'Pitching W/L/SV and pitch-tracking/velocity columns are empty or zero in this export, so they are not displayed.',
      'Innings use baseball notation: 11.1 means 11 1/3 innings. ERA is calculated with 6-inning games, matching the source values.',
      'Fielding innings cover ten positions: pitcher, catcher, four infield spots, three outfield spots, and short field (SF).',
      'The official Team row differs slightly from the sum of player rows in a few counting stats. Headline team stats use the Team row; the differences are listed below.',
      "The source spells the player's last name 'MCCoy'; the app displays it as 'McCoy'.",
    ],
  },
};

// Spot-check a few known values so a bad CSV or parser change fails loudly.
const byLast = Object.fromEntries(players.map((player) => [player.last, player]));
assert(byLast.Bazinet?.batting.AVG === 0.684, 'Bazinet AVG changed; check CSV parsing');
assert(byLast.Adams?.batting.OPS === 1.793, 'Adams OPS changed; check CSV parsing');
assert(Number(teamBatting.BB) === 138, 'Team walks changed; check CSV parsing');
assert(players.filter((player) => player.pitching).length === 8, 'Expected 8 pitchers');
assert(sections.batting.length === 51, `Expected 51 batting columns, found ${sections.batting.length}`);
assert(sections.pitching.length === 101, `Expected 101 pitching columns, found ${sections.pitching.length}`);
assert(sections.fielding.length === 25, `Expected 25 fielding columns, found ${sections.fielding.length}`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Wrote ${path.relative(root, outPath)}`);
console.log(`Players: ${players.length} (${players.filter((player) => player.pitching).length} pitchers)`);
console.log(`Games: ${data.meta.games}, batting columns: ${sections.batting.length}`);
console.log(`Team-row discrepancies: ${discrepancies.length}`);
for (const check of discrepancies) {
  console.log(`  ${check.stat}: team ${check.teamValue}, player sum ${check.playerSum}`);
}
