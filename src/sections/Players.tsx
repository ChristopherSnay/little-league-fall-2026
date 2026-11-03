import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { ChartCard, Metric, PlayerIdentity, SectionHeader } from '../components/common';
import { RadarCompare } from '../components/RadarCompare';
import { PLAYERS } from '../data';
import type { Player } from '../lib/types';
import {
  formatInnings,
  formatRate,
  formatStat,
  toNumber,
} from '../lib/stats';

type RoleFilter = 'all' | 'pitchers' | 'position';
type SortKey = 'name' | 'ops' | 'avg' | 'obp' | 'runs' | 'walks' | 'era' | 'strikeouts';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'ops', label: 'OPS' },
  { value: 'avg', label: 'Batting average' },
  { value: 'obp', label: 'On-base percentage' },
  { value: 'runs', label: 'Runs scored' },
  { value: 'walks', label: 'Walks' },
  { value: 'strikeouts', label: 'Pitching strikeouts' },
  { value: 'era', label: 'ERA (low to high)' },
  { value: 'name', label: 'Name' },
];

function topPositions(player: Player): string[] {
  return Object.entries(player.fielding.positions)
    .filter(([, innings]) => innings > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([position]) => position);
}

export function Players({ onSelectPlayer }: { onSelectPlayer: (player: Player) => void }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('ops');
  const [compareIds, setCompareIds] = useState<string[]>([
    'adams-kylan',
    'jahn-colby',
  ]);

  const visiblePlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = PLAYERS.filter((player) => {
      if (role === 'pitchers' && !player.pitching) return false;
      if (role === 'position' && player.pitching) return false;
      if (!normalized) return true;
      const positions = Object.keys(player.fielding.positions)
        .filter((position) => (player.fielding.positions[position] ?? 0) > 0)
        .join(' ');
      return `${player.name} ${player.number} ${positions}`.toLowerCase().includes(normalized);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.last.localeCompare(b.last);
        case 'avg':
          return toNumber(b.batting.AVG) - toNumber(a.batting.AVG);
        case 'obp':
          return toNumber(b.batting.OBP) - toNumber(a.batting.OBP);
        case 'runs':
          return toNumber(b.batting.R) - toNumber(a.batting.R);
        case 'walks':
          return toNumber(b.batting.BB) - toNumber(a.batting.BB);
        case 'strikeouts':
          return (
            (b.pitching ? toNumber(b.pitching.SO) : -1) -
            (a.pitching ? toNumber(a.pitching.SO) : -1)
          );
        case 'era':
          return (
            (a.pitching ? toNumber(a.pitching.ERA) : Number.POSITIVE_INFINITY) -
            (b.pitching ? toNumber(b.pitching.ERA) : Number.POSITIVE_INFINITY)
          );
        case 'ops':
        default:
          return toNumber(b.batting.OPS) - toNumber(a.batting.OPS);
      }
    });
    return sorted;
  }, [query, role, sortKey]);

  const comparePlayers = compareIds
    .map((id) => PLAYERS.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player));

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  };

  const updateCompareSlot = (index: number, id: string) => {
    setCompareIds((current) => {
      const next = [...current];
      if (!id) {
        next.splice(index, 1);
        return next;
      }
      if (index < next.length) next[index] = id;
      else next.push(id);
      return next.slice(0, 2);
    });
  };

  return (
    <Box>
      <SectionHeader
        eyebrow="Roster"
        title="Player explorer"
        description="Search, filter, and sort all 13 players. Open a full stat sheet or check two players to compare their profiles."
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Search players"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={role}
                onChange={(_, value: RoleFilter | null) => {
                  if (value) setRole(value);
                }}
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="all">All 13</ToggleButton>
                <ToggleButton value="pitchers">Pitchers</ToggleButton>
                <ToggleButton value="position">Position-only</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sort by"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ChartCard
        title="Two-player comparison"
        subtitle="Radar spokes are percentile ranks within the roster; the table underneath shows the raw values."
        action={
          compareIds.length ? (
            <Button size="small" onClick={() => setCompareIds([])}>
              Clear
            </Button>
          ) : undefined
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[0, 1].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={index === 0 ? 'Player A' : 'Player B'}
                value={compareIds[index] ?? ''}
                onChange={(event) => updateCompareSlot(index, event.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {PLAYERS.map((player) => (
                  <MenuItem
                    key={player.id}
                    value={player.id}
                    disabled={compareIds[index === 0 ? 1 : 0] === player.id}
                  >
                    {player.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
        </Grid>

        {comparePlayers.length === 2 ? (
          <RadarCompare players={comparePlayers} />
        ) : (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            {comparePlayers.length === 1
              ? 'Pick a second player to draw the comparison.'
              : 'Pick two players above, or check “Compare” on a player card.'}
          </Typography>
        )}
      </ChartCard>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'baseline' }}
        justifyContent="space-between"
        sx={{ mt: 3, mb: 1.5 }}
      >
        <Typography variant="h6">{visiblePlayers.length} players</Typography>
        <Typography variant="body2" color="text.secondary">
          Compare selection: {comparePlayers.map((player) => player.name).join(' vs ') || 'none'}
        </Typography>
      </Stack>

      {visiblePlayers.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          No players match this search and filter.
        </Typography>
      ) : null}

      <Grid container spacing={2}>
        {visiblePlayers.map((player) => {
          const positions = topPositions(player);
          const checked = compareIds.includes(player.id);

          return (
            <Grid key={player.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  borderTop: '4px solid',
                  borderTopColor: checked ? 'secondary.main' : 'primary.main',
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <PlayerIdentity player={player} />
                    <FormControlLabel
                      sx={{ m: 0, whiteSpace: 'nowrap' }}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleCompare(player.id)}
                        />
                      }
                      label={<Typography variant="caption">Compare</Typography>}
                    />
                  </Stack>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 1.25,
                      mt: 2,
                    }}
                  >
                    <Metric label="AVG" value={formatRate(player.batting.AVG)} />
                    <Metric label="OBP" value={formatRate(player.batting.OBP)} />
                    <Metric label="OPS" value={formatRate(player.batting.OPS)} />
                    <Metric label="R" value={formatStat('batting', 'R', player.batting.R)} />
                    <Metric label="BB" value={formatStat('batting', 'BB', player.batting.BB)} />
                    <Metric label="SO" value={formatStat('batting', 'SO', player.batting.SO)} />
                  </Box>

                  {player.pitching ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                        gap: 1,
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Metric label="IP" value={formatInnings(player.pitching.IP)} />
                      <Metric
                        label="ERA"
                        value={formatStat('pitching', 'ERA', player.pitching.ERA)}
                      />
                      <Metric label="SO" value={formatStat('pitching', 'SO', player.pitching.SO)} />
                      <Metric label="BAA" value={formatRate(player.pitching.BAA)} />
                    </Box>
                  ) : null}

                  <Stack
                    direction="row"
                    spacing={0.5}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 1.75, mb: 1.5 }}
                  >
                    {positions.map((position) => (
                      <Chip
                        key={position}
                        label={position}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22 }}
                      />
                    ))}
                    <Chip
                      label={`${player.fielding.positionCount} pos.`}
                      size="small"
                      sx={{ height: 22, bgcolor: 'rgba(11,37,69,0.06)' }}
                    />
                  </Stack>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onSelectPlayer(player)}
                    sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                  >
                    Full stat sheet
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
