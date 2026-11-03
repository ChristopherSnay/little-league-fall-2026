import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { PLAYERS } from '../data';
import type { Player } from '../lib/types';
import { buildRadarSeries, formatRaw, RADAR_METRICS } from '../lib/stats';

const SERIES_COLORS = ['#0b2545', '#c8102e'];

export function RadarCompare({ players }: { players: Player[] }) {
  if (!players.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Choose two players to compare.
      </Typography>
    );
  }

  const series = buildRadarSeries(PLAYERS, players);

  return (
    <Box>
      <RadarChart
        height={330}
        radar={{
          metrics: RADAR_METRICS.map((metric) => metric.label),
          max: 100,
        }}
        series={series.map((entry, index) => ({
          data: entry.values,
          label: entry.label,
          color: SERIES_COLORS[index % SERIES_COLORS.length],
          fillArea: true,
        }))}
        margin={{ top: 36, bottom: 36, left: 52, right: 52 }}
        sx={{
          '& .MuiChartsLegend-label': { fontSize: 13, fontWeight: 700 },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Percentile rank within the roster (100 = team best). K% is inverted, so a longer spoke is
        always better.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `1.1fr repeat(${players.length}, minmax(72px, 0.8fr))`,
          gap: 0.5,
          mt: 2,
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={800}>
          Metric
        </Typography>
        {players.map((player, index) => (
          <Typography
            key={player.id}
            variant="caption"
            fontWeight={800}
            textAlign="right"
            sx={{ color: SERIES_COLORS[index % SERIES_COLORS.length] }}
          >
            {player.last}
          </Typography>
        ))}

        {RADAR_METRICS.map((metric) => {
          const values = players.map((player) => metric.value(player));
          const best =
            metric.better === 'high' ? Math.max(...values) : Math.min(...values);

          return (
            <Box key={metric.key} sx={{ display: 'contents' }}>
              <Typography variant="body2" color="text.secondary">
                {metric.label}
              </Typography>
              {players.map((player, index) => {
                const value = values[index];
                const isBest = values.length > 1 && value === best;
                return (
                  <Typography
                    key={player.id}
                    variant="body2"
                    textAlign="right"
                    fontWeight={isBest ? 800 : 500}
                    sx={{ color: isBest ? 'secondary.main' : 'text.primary' }}
                  >
                    {formatRaw(metric.format(value))}
                  </Typography>
                );
              })}
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
        {players.map((player, index) => (
          <Stack key={player.id} direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: SERIES_COLORS[index % SERIES_COLORS.length],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {player.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
