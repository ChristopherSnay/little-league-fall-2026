import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartCard, KpiCard, PlayerIdentity, SectionHeader } from '../components/common';
import { QuadrantScatter } from '../components/QuadrantScatter';
import { StatTable } from '../components/StatTable';
import { PITCHERS, TEAM } from '../data';
import { HORIZONTAL_BAR_MARGIN, PLAYER_AXIS_WIDTH } from '../lib/chart';
import { PITCHING_COLUMNS } from '../lib/columns';
import type { Player } from '../lib/types';
import {
  formatInnings,
  formatPct,
  formatRate,
  getTeamSummary,
  pitchingBbPct,
  pitchingKPct,
  toNumber,
} from '../lib/stats';

export function Pitching({ onSelectPlayer }: { onSelectPlayer: (player: Player) => void }) {
  const summary = getTeamSummary(TEAM);
  const workload = [...PITCHERS].sort(
    (a, b) => toNumber(b.pitching.IPDecimal) - toNumber(a.pitching.IPDecimal),
  );

  const scatterPoints = PITCHERS.map((player) => ({
    id: player.id,
    label: player.name,
    marker: player.number,
    x: pitchingBbPct(player),
    y: pitchingKPct(player),
    size: toNumber(player.pitching.BF),
    detail: `${formatRate(player.pitching.ERA)} ERA`,
  }));

  return (
    <Box>
      <SectionHeader
        eyebrow="Run prevention"
        title="Pitching"
        description="Opponents walked or were hit 55.6% of the time and struck out another 28.3%. The staff threw a lot of pitches and rarely let the defense make a play."
      />

      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start" sx={{ mb: 4 }}>
        {[
          {
            label: 'ERA',
            value: summary.era.toFixed(2),
            detail: `${summary.ipDisplay} innings`,
            accent: 'warning.main',
          },
          {
            label: 'WHIP',
            value: summary.whip.toFixed(2),
            detail: `${summary.pitchH} H + ${summary.pitchBb} BB per 6 innings`,
            accent: 'secondary.main',
          },
          {
            label: 'Opponent BAA',
            value: formatRate(summary.baa),
            detail: `${summary.pitchH} hits allowed · ${summary.pitchSo} SO`,
            accent: 'primary.main',
          },
          {
            label: 'Strikeout rate',
            value: formatPct(summary.pitchKRate),
            detail: `${summary.pitchSo} SO in ${summary.bf} PA`,
            accent: 'success.main',
          },
          {
            label: 'Walks allowed',
            value: summary.pitchBb,
            detail: `${formatPct(summary.pitchBbRate)} of opponent PA`,
            accent: 'info.main',
          },
          {
            label: 'Hit by pitch',
            value: summary.pitchHbp,
            detail: `${formatPct(summary.pitchHbpRate)} of opponent PA`,
            accent: 'warning.main',
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
            title="Command vs. swing-and-miss"
            subtitle="Each bubble is a pitcher. Left is better (fewer walks); up is better (more strikeouts). Bubble size = batters faced."
          >
            <QuadrantScatter
              points={scatterPoints}
              xLabel="Walk rate (BB%)"
              yLabel="Strikeout rate (K%)"
              xDomain={[0, 80]}
              yDomain={[0, 55]}
              xTicks={[0, 20, 40, 60, 80]}
              yTicks={[0, 20, 40]}
              xFormat={(value) => `${value.toFixed(0)}%`}
              yFormat={(value) => `${value.toFixed(0)}%`}
              referenceX={summary.pitchBbRate}
              referenceY={summary.pitchKRate}
              quadrantLabels={{
                topLeft: 'BEST COMMAND',
                topRight: 'POWER & WILD',
                bottomLeft: 'CONTACT HEAVY',
                bottomRight: 'WALKS + FEW K',
              }}
              sizeLabel="batters faced"
              color="#c8102e"
              ariaLabel="Scatter plot of walk rate versus strikeout rate for every pitcher"
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard title="Workload" subtitle="Innings pitched, sorted high to low.">
            <BarChart
              layout="horizontal"
              height={330}
              margin={HORIZONTAL_BAR_MARGIN}
              grid={{ vertical: true }}
              yAxis={[
                {
                  scaleType: 'band',
                  data: workload.map((player) => player.last),
                  width: PLAYER_AXIS_WIDTH,
                  tickLabelStyle: { fontSize: 12, fontWeight: 700 },
                },
              ]}
              xAxis={[{ label: 'Innings pitched', min: 0 }]}
              series={[
                {
                  label: 'IP',
                  data: workload.map((player) => toNumber(player.pitching.IPDecimal)),
                  color: '#0b2545',
                  valueFormatter: (value) =>
                    value == null ? '—' : `${formatInnings(value)} IP`,
                },
              ]}
            />
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard
        title="Full pitching table"
        subtitle="Includes every exported pitching column that has meaningful data. Click a row for the player's full sheet."
      >
        <StatTable
          rows={PITCHERS}
          columns={PITCHING_COLUMNS}
          getRowId={(player) => player.id}
          getSearchText={(player) => `${player.name} ${player.number}`}
          rowLabel={(player) => <PlayerIdentity player={player} />}
          initialSortKey="IP"
          onRowClick={onSelectPlayer}
          caption="Pitching statistics, season totals"
        />
      </ChartCard>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        W/L/SV and pitch-type/velocity columns are empty or zero in the source export, so they are
        not displayed. Small innings samples make individual ERA and BAA volatile.
      </Typography>
    </Box>
  );
}
