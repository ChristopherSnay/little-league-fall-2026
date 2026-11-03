import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartCard, DataNotes, InsightCard, KpiCard, SectionHeader } from '../components/common';
import { OutcomeDonut } from '../components/OutcomeDonut';
import { PLAYERS, TEAM } from '../data';
import { HORIZONTAL_BAR_MARGIN, PLAYER_AXIS_WIDTH } from '../lib/chart';
import { buildInsights } from '../lib/insights';
import { formatPct, formatRate, getTeamSummary, toNumber } from '../lib/stats';

const DONUT_COLORS = {
  walk: '#0b2545',
  strikeout: '#c8102e',
  hit: '#1565c0',
  hbp: '#ef6c00',
  other: '#9aa4b2',
};

export function Overview() {
  const summary = getTeamSummary(TEAM);
  const insights = buildInsights(TEAM);
  const runRows = [...PLAYERS].sort(
    (a, b) => toNumber(b.batting.R) - toNumber(a.batting.R),
  );

  const offenseSlices = [
    { id: 'bb', label: 'Walks', value: summary.bb, color: DONUT_COLORS.walk },
    { id: 'so', label: 'Strikeouts', value: summary.so, color: DONUT_COLORS.strikeout },
    { id: 'h', label: 'Hits', value: summary.h, color: DONUT_COLORS.hit },
    { id: 'hbp', label: 'Hit by pitch', value: summary.hbp, color: DONUT_COLORS.hbp },
    {
      id: 'other',
      label: 'Other outcomes',
      value: summary.pa - summary.bb - summary.so - summary.h - summary.hbp,
      color: DONUT_COLORS.other,
    },
  ];

  const opponentSlices = [
    { id: 'bb', label: 'Walks', value: summary.pitchBb, color: DONUT_COLORS.walk },
    { id: 'so', label: 'Strikeouts', value: summary.pitchSo, color: DONUT_COLORS.strikeout },
    { id: 'hbp', label: 'Hit by pitch', value: summary.pitchHbp, color: DONUT_COLORS.hbp },
    { id: 'h', label: 'Hits', value: summary.pitchH, color: DONUT_COLORS.hit },
    {
      id: 'other',
      label: 'Other outcomes',
      value:
        summary.bf - summary.pitchBb - summary.pitchSo - summary.pitchHbp - summary.pitchH,
      color: DONUT_COLORS.other,
    },
  ];

  return (
    <Box>
      <Box className="hero" sx={{ p: { xs: 3, md: 4.5 }, mb: 4 }}>
        <Box className="hero-diamond" />
        <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
              <Chip
                size="small"
                label={`${TEAM.meta.season} · ${TEAM.meta.ageGroup}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }}
              />
              <Chip
                size="small"
                label={`${summary.games} games · ${summary.players} players`}
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }}
              />
            </Stack>
            <Typography variant="h2" component="h1" sx={{ color: '#fff', lineHeight: 1.05 }}>
              JC Bombers
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.78)', mt: 1, fontWeight: 500 }}>
              A walk-heavy offense, a strikeout-and-walk pitching staff, and a roster that played
              everywhere.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.64)', mt: 2, maxWidth: 620 }}
            >
              Season totals from the {TEAM.meta.sourceFile} export. No game logs, opponents, or
              win/loss record are included in the source, so this site sticks to what the numbers
              actually say.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 1.5,
              }}
            >
              {[
                { label: 'Runs scored', value: summary.runs, note: `${summary.runsPerGame.toFixed(1)} per game` },
                { label: 'Runs allowed', value: summary.runsAllowed, note: `${summary.runsAllowedPerGame.toFixed(1)} per game` },
                {
                  label: 'Run differential',
                  value: `${summary.runDiff >= 0 ? '+' : ''}${summary.runDiff}`,
                  note: `${summary.games} games`,
                },
                { label: 'Team OBP', value: formatRate(summary.obp), note: `${summary.bb} walks` },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 1.75,
                    borderRadius: 0,
                    bgcolor: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(255,255,255,0.13)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#fff', mt: 0.25 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.56)' }}>
                    {stat.note}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <SectionHeader
        eyebrow="Season snapshot"
        title="The shape of the season"
        description="Headline totals use the official Team row. The notes at the bottom explain where the Team row and the player rows disagree."
      />

      <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {[
          {
            label: 'Batting average',
            value: formatRate(summary.avg),
            detail: `${summary.h} hits in ${summary.ab} at-bats`,
            accent: 'primary.main',
          },
          {
            label: 'On-base percentage',
            value: formatRate(summary.obp),
            detail: `${summary.bb} walks + ${summary.hbp} HBP`,
            accent: 'info.main',
          },
          {
            label: 'OPS',
            value: formatRate(summary.ops),
            detail: `${formatRate(summary.slg)} slugging`,
            accent: 'secondary.main',
          },
          {
            label: 'Walks',
            value: summary.bb,
            detail: `${formatPct(summary.bbRate)} of plate appearances`,
            accent: 'success.main',
          },
          {
            label: 'Team ERA',
            value: summary.era.toFixed(2),
            detail: `${summary.ipDisplay} innings · ${summary.pitchSo} strikeouts`,
            accent: 'warning.main',
          },
          {
            label: 'Fielding percentage',
            value: formatRate(summary.fpct),
            detail: `${summary.errors} errors in ${summary.tc} chances`,
            accent: 'primary.main',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 4, lg: 2 }}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      <SectionHeader
        eyebrow="What stands out"
        title="Eight things the totals reveal"
        description="Derived from the season totals in the CSV — the export has no game-by-game logs."
      />

      <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {insights.map((insight) => (
          <Grid key={insight.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <InsightCard insight={insight} />
          </Grid>
        ))}
      </Grid>

      <SectionHeader
        eyebrow="How the runs happened"
        title="Plate appearance outcomes"
        description="The offense was powered by walks; opposing hitters rarely put the ball in play."
      />

      <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Bombers plate appearances"
            subtitle={`${summary.pa} PA · ${formatPct(summary.bbRate)} walks · ${formatPct(summary.kRate)} strikeouts`}
          >
            <OutcomeDonut
              slices={offenseSlices}
              centerValue={String(summary.pa)}
              centerLabel="plate appearances"
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Opponent plate appearances"
            subtitle={`${summary.bf} PA · ${formatPct(summary.bbHbpSoRate)} ended in BB, HBP, or SO`}
          >
            <OutcomeDonut
              slices={opponentSlices}
              centerValue={String(summary.bf)}
              centerLabel="opponent PA"
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ChartCard
            title="Runs scored by player"
            subtitle="Season runs, sorted high to low. Bubble charts and full stat sheets live on the other tabs."
          >
            <BarChart
              layout="horizontal"
              height={430}
              margin={HORIZONTAL_BAR_MARGIN}
              grid={{ vertical: true }}
              yAxis={[
                {
                  scaleType: 'band',
                  data: runRows.map((player) => player.last),
                  width: PLAYER_AXIS_WIDTH,
                  tickLabelStyle: { fontSize: 12, fontWeight: 700 },
                },
              ]}
              xAxis={[{ label: 'Runs', min: 0 }]}
              series={[
                {
                  label: 'Runs',
                  data: runRows.map((player) => toNumber(player.batting.R)),
                  color: '#0b2545',
                  valueFormatter: (value) => (value == null ? '—' : `${value} R`),
                },
              ]}
            />
          </ChartCard>
        </Grid>
      </Grid>

      <DataNotes />
    </Box>
  );
}
