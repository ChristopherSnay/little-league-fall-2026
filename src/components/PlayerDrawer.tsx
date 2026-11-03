import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GlossaryTooltip } from './GlossaryTooltip';
import { BATTING_GROUPS } from '../lib/columns';
import type { Player, Section, StatBlock } from '../lib/types';
import {
  formatInnings,
  formatRaw,
  formatRate,
  formatStat,
  POSITIONS,
  toNumber,
} from '../lib/stats';

const PITCHING_GROUPS: Array<{ label: string; keys: string[] }> = [
  {
    label: 'Core line',
    keys: [
      'IP',
      'GP',
      'GS',
      'BF',
      '#P',
      'H',
      'R',
      'ER',
      'BB',
      'SO',
      'K-L',
      'HBP',
      'ERA',
      'WHIP',
      'BAA',
      'FIP',
    ],
  },
  {
    label: 'Command & strikes',
    keys: [
      'P/IP',
      'P/BF',
      '<3%',
      'S%',
      'FPS%',
      'FPSO%',
      'FPSW%',
      'FPSH%',
      'K/BF',
      'K/BB',
      'BB/INN',
      '0BBINN',
      'BBS',
      'LOBB',
      'LOBBS',
      'SM%',
      'LOO',
      '1ST2OUT',
      '123INN',
      '<13',
    ],
  },
  {
    label: 'Batted ball & runners',
    keys: [
      'HR',
      'LD%',
      'FB%',
      'GB%',
      'BABIP',
      'BA/RISP',
      'WEAK%',
      'HHB%',
      'GO/AO',
      'LOB',
      'BK',
      'WP',
      'PIK',
      'CS',
      'SB',
      'SB%',
    ],
  },
];

const FIELDING_KEYS = [
  'TC',
  'PO',
  'A',
  'E',
  'FPCT',
  'DP',
  'TP',
  'PB',
  'SB',
  'SBATT',
  'CS',
  'CS%',
  'PIK',
  'CI',
  'Total',
];

function SheetGroup({
  section,
  label,
  keys,
  stats,
}: {
  section: Section;
  label: string;
  keys: string[];
  stats: StatBlock;
}) {
  const visibleKeys = keys.filter((key) => key in stats);
  if (!visibleKeys.length) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 0.75,
        }}
      >
        {visibleKeys.map((key) => (
          <Box
            key={key}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              px: 1.25,
              py: 0.9,
              bgcolor: 'rgba(11,37,69,0.02)',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="div">
              <GlossaryTooltip section={section} abbr={key}>
                {key}
              </GlossaryTooltip>
            </Typography>
            <Typography variant="body1" fontWeight={800} sx={{ mt: 0.1 }}>
              {formatStat(section, key, stats[key])}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function PositionInnings({ player }: { player: Player }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        Innings by position
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' },
          gap: 0.75,
        }}
      >
        {POSITIONS.map((position) => {
          const innings = player.fielding.positions[position] ?? 0;
          return (
            <Box
              key={position}
              sx={{
                border: '1px solid',
                borderColor: innings ? 'rgba(11,37,69,0.18)' : 'divider',
                borderRadius: 0,
                px: 1,
                py: 0.8,
                textAlign: 'center',
                bgcolor: innings ? 'rgba(11,37,69,0.06)' : 'transparent',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {position}
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {formatInnings(innings)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function PlayerDrawer({
  player,
  open,
  onClose,
}: {
  player: Player | null;
  open: boolean;
  onClose: () => void;
}) {
  const seenBattingKeys = new Set<string>();
  const battingGroups = BATTING_GROUPS.map((group) => {
    const keys = group.columns
      .map((column) => column.key)
      .filter((key) => !seenBattingKeys.has(key));
    keys.forEach((key) => seenBattingKeys.add(key));
    return { label: group.label, keys };
  }).filter((group) => group.keys.length > 0);

  const knownBattingKeys = new Set(seenBattingKeys);
  const otherBattingKeys = player
    ? Object.keys(player.batting).filter((key) => !knownBattingKeys.has(key))
    : [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 520, md: 610 },
            bgcolor: 'background.default',
          },
        },
      }}
    >
      {player ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'primary.main', color: '#fff' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  #{player.number} · {player.fielding.positionCount} positions
                </Typography>
                <Typography variant="h4" component="h2">
                  {player.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.25 }}>
                  {formatInnings(player.fielding.totalInnings)} fielding innings ·{' '}
                  {toNumber(player.batting.GP)} games played
                </Typography>
              </Box>
              <Button
                onClick={onClose}
                variant="outlined"
                size="small"
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.5)',
                  minWidth: 0,
                  px: 1.5,
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Close
              </Button>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 1,
                mt: 2,
              }}
            >
              {[
                ['AVG', formatRate(player.batting.AVG)],
                ['OBP', formatRate(player.batting.OBP)],
                ['OPS', formatRate(player.batting.OPS)],
                ['R', formatStat('batting', 'R', player.batting.R)],
                ['BB', formatStat('batting', 'BB', player.batting.BB)],
                ['SO', formatStat('batting', 'SO', player.batting.SO)],
                player.pitching
                  ? ['IP', formatInnings(player.pitching.IP)]
                  : ['SB', formatStat('batting', 'SB', player.batting.SB)],
                player.pitching
                  ? ['ERA', formatStat('pitching', 'ERA', player.pitching.ERA)]
                  : ['FPCT', formatRate(player.fielding.FPCT)],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                    {label}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', lineHeight: 1.2 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ overflowY: 'auto', p: { xs: 2, sm: 2.5 }, flex: 1 }}>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {Object.entries(player.fielding.positions)
                .filter(([, innings]) => innings > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([position, innings]) => (
                  <Chip
                    key={position}
                    size="small"
                    label={`${position} ${formatInnings(innings)}`}
                    variant="outlined"
                  />
                ))}
            </Stack>

            <Accordion defaultExpanded disableGutters elevation={0} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<Typography fontWeight={800}>+</Typography>}>
                <Typography fontWeight={800}>Batting</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {battingGroups.map((group) => (
                  <SheetGroup
                    key={group.label}
                    section="batting"
                    label={group.label}
                    keys={group.keys}
                    stats={player.batting}
                  />
                ))}
                {otherBattingKeys.length ? (
                  <SheetGroup
                    section="batting"
                    label="Other"
                    keys={otherBattingKeys}
                    stats={player.batting}
                  />
                ) : null}
              </AccordionDetails>
            </Accordion>

            {player.pitching ? (
              <Accordion defaultExpanded disableGutters elevation={0} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<Typography fontWeight={800}>+</Typography>}>
                  <Typography fontWeight={800}>Pitching</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {PITCHING_GROUPS.map((group) => (
                    <SheetGroup
                      key={group.label}
                      section="pitching"
                      label={group.label}
                      keys={group.keys}
                      stats={player.pitching ?? {}}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    W/L/SV and pitch-type/velocity columns are empty or zero in the source export, so
                    they are omitted here.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ) : null}

            <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<Typography fontWeight={800}>+</Typography>}>
                <Typography fontWeight={800}>Fielding</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SheetGroup
                  section="fielding"
                  label="Fielding line"
                  keys={FIELDING_KEYS}
                  stats={player.fielding}
                />
                <Divider sx={{ my: 2 }} />
                <PositionInnings player={player} />
              </AccordionDetails>
            </Accordion>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Source: {formatRaw(player.sourceLast)} row in JCBombers10UStatsFall2026.csv. Innings use
              baseball notation.
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Drawer>
  );
}
