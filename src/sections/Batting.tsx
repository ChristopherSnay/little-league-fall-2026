import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartCard, KpiCard, PlayerIdentity, SectionHeader } from '../components/common';
import { QuadrantScatter } from '../components/QuadrantScatter';
import { StatTable } from '../components/StatTable';
import { PLAYERS, TEAM } from '../data';
import { HORIZONTAL_BAR_MARGIN, PLAYER_AXIS_WIDTH } from '../lib/chart';
import { BATTING_GROUPS } from '../lib/columns';
import type { Player } from '../lib/types';
import {
  battingBbPct,
  battingKPct,
  formatPct,
  formatRate,
  getTeamSummary,
  toNumber,
} from '../lib/stats';

export function Batting({ onSelectPlayer }: { onSelectPlayer: (player: Player) => void }) {
  const [group, setGroup] = useState('core');
  const summary = getTeamSummary(TEAM);
  const activeGroup = BATTING_GROUPS.find((entry) => entry.key === group) ?? BATTING_GROUPS[0];
  const opsRows = [...PLAYERS].sort(
    (a, b) => toNumber(b.batting.OPS) - toNumber(a.batting.OPS),
  );
  const runsAndRbi = [...PLAYERS]
    .sort(
      (a, b) =>
        toNumber(b.batting.R) +
        toNumber(b.batting.RBI) -
        (toNumber(a.batting.R) + toNumber(a.batting.RBI)),
    )
    .slice(0, 10);

  const scatterPoints = PLAYERS.map((player) => ({
    id: player.id,
    label: player.name,
    marker: player.number,
    x: battingBbPct(player),
    y: battingKPct(player),
    size: toNumber(player.batting.PA),
    detail: `${formatRate(player.batting.OBP)} OBP`,
  }));

  const initialSortByGroup: Record<string, string> = {
    core: 'OPS',
    discipline: 'QAB%',
    'batted-ball': 'BABIP',
    situational: 'SB%',
  };

  return (
    <Box>
      <SectionHeader
        eyebrow="Offense"
        title="Batting"
        description="The Bombers walked in 45% of plate appearances. The tables include every batting column in the export; hover a column header for its definition."
      />

      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start" sx={{ mb: 4 }}>
        {[
          {
            label: 'Batting average',
            value: formatRate(summary.avg),
            detail: `${summary.h} H / ${summary.ab} AB`,
            accent: 'primary.main',
          },
          {
            label: 'On-base percentage',
            value: formatRate(summary.obp),
            detail: `${summary.bb} BB + ${summary.hbp} HBP`,
            accent: 'info.main',
          },
          {
            label: 'OPS',
            value: formatRate(summary.ops),
            detail: `${formatRate(summary.slg)} SLG`,
            accent: 'secondary.main',
          },
          {
            label: 'Walks',
            value: summary.bb,
            detail: `${formatPct(summary.bbRate)} of PA`,
            accent: 'success.main',
          },
          {
            label: 'Strikeouts',
            value: summary.so,
            detail: `${formatPct(summary.kRate)} of PA`,
            accent: 'warning.main',
          },
          {
            label: 'Quality at-bats',
            value: formatPct(summary.qabPct),
            detail: `${summary.qab} QAB`,
            accent: 'primary.main',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 4, lg: 2 }}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start" sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard
            title="Patience vs. strikeouts"
            subtitle="Each bubble is a player. Right is better (more walks); down is better (fewer strikeouts). Bubble size = plate appearances."
          >
            <QuadrantScatter
              points={scatterPoints}
              xLabel="Walk rate (BB%)"
              yLabel="Strikeout rate (K%)"
              xDomain={[0, 70]}
              yDomain={[0, 60]}
              xTicks={[0, 20, 40, 60]}
              yTicks={[0, 20, 40, 60]}
              xFormat={(value) => `${value.toFixed(0)}%`}
              yFormat={(value) => `${value.toFixed(0)}%`}
              referenceX={summary.bbRate}
              referenceY={summary.kRate}
              quadrantLabels={{
                topLeft: 'STRIKEOUT RISK',
                topRight: 'ALL-OR-NOTHING',
                bottomLeft: 'CONTACT, PASSIVE',
                bottomRight: 'BEST EYE',
              }}
              sizeLabel="plate appearances"
              color="#0b2545"
              ariaLabel="Scatter plot of walk rate versus strikeout rate for every player"
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard
            title="OPS leaders"
            subtitle="On-base plus slugging, sorted high to low."
          >
            <BarChart
              layout="horizontal"
              height={430}
              margin={HORIZONTAL_BAR_MARGIN}
              grid={{ vertical: true }}
              yAxis={[
                {
                  scaleType: 'band',
                  data: opsRows.map((player) => player.last),
                  width: PLAYER_AXIS_WIDTH,
                  tickLabelStyle: { fontSize: 12, fontWeight: 700 },
                },
              ]}
              xAxis={[{ label: 'OPS', min: 0 }]}
              series={[
                {
                  label: 'OPS',
                  data: opsRows.map((player) => toNumber(player.batting.OPS)),
                  color: '#c8102e',
                  valueFormatter: (value) => (value == null ? '—' : formatRate(value)),
                },
              ]}
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ChartCard
            title="Runs + RBI leaders"
            subtitle="The top 10 players by combined runs scored and runs batted in."
          >
            <BarChart
              layout="horizontal"
              height={430}
              margin={HORIZONTAL_BAR_MARGIN}
              grid={{ vertical: true }}
              yAxis={[
                {
                  scaleType: 'band',
                  data: runsAndRbi.map((player) => player.last),
                  width: PLAYER_AXIS_WIDTH,
                  tickLabelStyle: { fontSize: 12, fontWeight: 700 },
                },
              ]}
              xAxis={[{ label: 'Runs', min: 0 }]}
              series={[
                {
                  label: 'Runs scored',
                  data: runsAndRbi.map((player) => toNumber(player.batting.R)),
                  color: '#0b2545',
                  valueFormatter: (value) => (value == null ? '—' : `${value} R`),
                },
                {
                  label: 'RBI',
                  data: runsAndRbi.map((player) => toNumber(player.batting.RBI)),
                  color: '#c8102e',
                  valueFormatter: (value) => (value == null ? '—' : `${value} RBI`),
                },
              ]}
            />
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard
        title="Full batting table"
        subtitle="Sort any column, search by name or number, and click a row for the complete stat sheet."
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={group}
            onChange={(_, value) => {
              if (value) setGroup(value);
            }}
            sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
          >
            {BATTING_GROUPS.map((entry) => (
              <ToggleButton key={entry.key} value={entry.key}>
                {entry.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {activeGroup.label} columns · {activeGroup.columns.length} stats
          </Typography>
          <StatTable
            key={group}
            rows={PLAYERS}
            columns={activeGroup.columns}
            getRowId={(player) => player.id}
            getSearchText={(player) => `${player.name} ${player.number}`}
            rowLabel={(player) => <PlayerIdentity player={player} />}
            initialSortKey={initialSortByGroup[group] ?? activeGroup.columns[0]?.key ?? ''}
            onRowClick={onSelectPlayer}
            showRank={group === 'core'}
            caption="Batting statistics, season totals"
          />
        </Stack>
      </ChartCard>
    </Box>
  );
}
