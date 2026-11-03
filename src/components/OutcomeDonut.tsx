import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export function OutcomeDonut({
  slices,
  centerValue,
  centerLabel,
  height = 220,
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  height?: number;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (!total) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No data available.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <PieChart
          height={height}
          margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
          colors={slices.map((slice) => slice.color)}
          series={[
            {
              data: slices.map((slice) => ({
                id: slice.id,
                value: slice.value,
                label: slice.label,
              })),
              innerRadius: height * 0.28,
              outerRadius: height * 0.42,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
          hideLegend
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800}>
              {centerValue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {centerLabel}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Stack spacing={0.75} sx={{ mt: 1 }}>
        {slices.map((slice) => (
          <Stack key={slice.id} direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: slice.color,
                flex: '0 0 auto',
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {slice.label}
            </Typography>
            <Typography variant="body2" fontWeight={800}>
              {slice.value}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ width: 52, textAlign: 'right' }}
            >
              {((slice.value / total) * 100).toFixed(1)}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
