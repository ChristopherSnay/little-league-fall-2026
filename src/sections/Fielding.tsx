import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartCard, KpiCard, PlayerIdentity, SectionHeader } from '../components/common';
import { PositionHeatmap } from '../components/PositionHeatmap';
import { StatTable } from '../components/StatTable';
import { PLAYERS, TEAM } from '../data';
import { HORIZONTAL_BAR_MARGIN, PLAYER_AXIS_WIDTH } from '../lib/chart';
import { FIELDING_COLUMNS } from '../lib/columns';
import type { Player } from '../lib/types';
import {
  formatInnings,
  formatPct,
  formatRate,
  getTeamSummary,
  toDecimalInnings,
  toNumber,
} from '../lib/stats';

export function Fielding({ onSelectPlayer }: { onSelectPlayer: (player: Player) => void }) {
  const summary = getTeamSummary(TEAM);

  const catchers = [...PLAYERS]
    .filter((player) => toDecimalInnings(player.fielding.C) > 0)
    .sort(
      (a, b) => toDecimalInnings(b.fielding.C) - toDecimalInnings(a.fielding.C),
    );

  const errors = [...PLAYERS]
    .filter((player) => toNumber(player.fielding.E) > 0)
    .sort((a, b) => toNumber(b.fielding.E) - toNumber(a.fielding.E))
    .slice(0, 10);

  return (
    <Box>
      <SectionHeader
        eyebrow="Defense"
        title="Fielding"
        description="The roster covered all ten positions. The heatmap shows who played where; the catcher table isolates the position with the most recorded chances."
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: 'Fielding percentage',
            value: formatRate(summary.fpct),
            detail: `${summary.errors} E / ${summary.tc} TC`,
            accent: 'primary.main',
          },
          {
            label: 'Errors',
            value: summary.errors,
            detail: `${formatPct((summary.errors / Math.max(summary.tc, 1)) * 100)} of chances`,
            accent: 'secondary.main',
          },
          {
            label: 'Total chances',
            value: summary.tc,
            detail: `${summary.errors} E · ${summary.tc - summary.errors} made`,
            accent: 'info.main',
          },
          {
            label: 'Passed balls',
            value: toNumber(TEAM.team.fielding.PB),
            detail: 'Team row',
            accent: 'warning.main',
          },
          {
            label: 'Caught stealing',
            value: toNumber(TEAM.team.fielding.CS),
            detail: `${formatPct(toNumber(TEAM.team.fielding['CS%']))} of attempts`,
            accent: 'success.main',
          },
          {
            label: 'Double plays',
            value: toNumber(TEAM.team.fielding.DP),
            detail: 'Team row',
            accent: 'primary.main',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 4, lg: 2 }}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      <ChartCard
        title="Position innings"
        subtitle="Every player's innings by position, including catcher and short field (SF). Darker cells mean more time there."
        action={
          <Typography variant="caption" color="text.secondary">
            Click a row for the full sheet
          </Typography>
        }
      >
        <PositionHeatmap players={PLAYERS} onSelectPlayer={onSelectPlayer} />
      </ChartCard>

      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start" sx={{ mt: 1, mb: 4 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard title="Errors by player" subtitle="Players with at least one error.">
            {errors.length ? (
              <BarChart
                layout="horizontal"
                height={320}
                margin={HORIZONTAL_BAR_MARGIN}
                grid={{ vertical: true }}
                yAxis={[
                  {
                    scaleType: 'band',
                    data: errors.map((player) => player.last),
                    width: PLAYER_AXIS_WIDTH,
                    tickLabelStyle: { fontSize: 12, fontWeight: 700 },
                  },
                ]}
                xAxis={[{ label: 'Errors', min: 0 }]}
                series={[
                  {
                    label: 'Errors',
                    data: errors.map((player) => toNumber(player.fielding.E)),
                    color: '#c8102e',
                    valueFormatter: (value) => (value == null ? '—' : `${value} E`),
                  },
                ]}
              />
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No errors recorded.
              </Typography>
            )}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard
            title="Catcher workload"
            subtitle="Catcher innings, passed balls, and stolen-base results."
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0 }}
            >
              <Table size="small" aria-label="Catcher workload">
                <TableHead>
                  <TableRow>
                    <TableCell>Catcher</TableCell>
                    <TableCell align="right">C inn.</TableCell>
                    <TableCell align="right">PB</TableCell>
                    <TableCell align="right">SB</TableCell>
                    <TableCell align="right">CS</TableCell>
                    <TableCell align="right">CS%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {catchers.map((player) => (
                    <TableRow
                      key={player.id}
                      hover
                      onClick={() => onSelectPlayer(player)}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectPlayer(player);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <PlayerIdentity player={player} />
                      </TableCell>
                      <TableCell align="right">
                        {formatInnings(player.fielding.C)}
                      </TableCell>
                      <TableCell align="right">{toNumber(player.fielding.PB)}</TableCell>
                      <TableCell align="right">{toNumber(player.fielding.SB)}</TableCell>
                      <TableCell align="right">{toNumber(player.fielding.CS)}</TableCell>
                      <TableCell align="right">{formatPct(player.fielding['CS%'])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard
        title="Full fielding table"
        subtitle="Sort by any column and click a row for the complete player sheet."
      >
        <StatTable
          rows={PLAYERS}
          columns={FIELDING_COLUMNS}
          getRowId={(player) => player.id}
          getSearchText={(player) => `${player.name} ${player.number}`}
          rowLabel={(player) => <PlayerIdentity player={player} />}
          initialSortKey="TC"
          onRowClick={onSelectPlayer}
          caption="Fielding statistics, season totals"
        />
      </ChartCard>
    </Box>
  );
}
