import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface ScatterPoint {
  id: string;
  label: string;
  marker: string;
  x: number;
  y: number;
  size: number;
  detail?: string;
}

export interface QuadrantScatterProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  xFormat: (value: number) => string;
  yFormat: (value: number) => string;
  referenceX: number;
  referenceY: number;
  quadrantLabels: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  sizeLabel: string;
  color?: string;
  ariaLabel: string;
  height?: number;
}

const WIDTH = 760;

export function QuadrantScatter({
  points,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xFormat,
  yFormat,
  referenceX,
  referenceY,
  quadrantLabels,
  sizeLabel,
  color = '#0b2545',
  ariaLabel,
  height = 430,
}: QuadrantScatterProps) {
  if (!points.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No data available.
      </Typography>
    );
  }

  const left = 64;
  const right = 24;
  const top = 28;
  const bottom = 58;
  const innerWidth = WIDTH - left - right;
  const innerHeight = height - top - bottom;
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;
  const maxSize = Math.max(...points.map((point) => point.size), 1);

  const scaleX = (value: number) =>
    left + ((value - xMin) / Math.max(xMax - xMin, 0.0001)) * innerWidth;
  const scaleY = (value: number) =>
    top + innerHeight - ((value - yMin) / Math.max(yMax - yMin, 0.0001)) * innerHeight;

  const referenceXPosition = scaleX(referenceX);
  const referenceYPosition = scaleY(referenceY);

  return (
    <Box>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          width="100%"
          role="img"
          aria-label={ariaLabel}
          style={{ display: 'block', minWidth: 520, height: 'auto' }}
        >
          <rect x={left} y={top} width={innerWidth} height={innerHeight} fill="rgba(11,37,69,0.02)" />

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={left}
                x2={left + innerWidth}
                y1={scaleY(tick)}
                y2={scaleY(tick)}
                stroke="rgba(11,37,69,0.12)"
                strokeWidth={1}
              />
              <text
                x={left - 10}
                y={scaleY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="rgba(23,32,51,0.72)"
                fontFamily="Segoe UI, sans-serif"
              >
                {yFormat(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={scaleX(tick)}
                x2={scaleX(tick)}
                y1={top}
                y2={top + innerHeight}
                stroke="rgba(11,37,69,0.12)"
                strokeWidth={1}
              />
              <text
                x={scaleX(tick)}
                y={top + innerHeight + 20}
                textAnchor="middle"
                fontSize={11}
                fill="rgba(23,32,51,0.72)"
                fontFamily="Segoe UI, sans-serif"
              >
                {xFormat(tick)}
              </text>
            </g>
          ))}

          <line
            x1={left}
            x2={left}
            y1={top}
            y2={top + innerHeight}
            stroke="rgba(11,37,69,0.4)"
            strokeWidth={1}
          />
          <line
            x1={left}
            x2={left + innerWidth}
            y1={top + innerHeight}
            y2={top + innerHeight}
            stroke="rgba(11,37,69,0.4)"
            strokeWidth={1}
          />

          {referenceX > xMin && referenceX < xMax ? (
            <line
              x1={referenceXPosition}
              x2={referenceXPosition}
              y1={top}
              y2={top + innerHeight}
              stroke="rgba(200,16,46,0.55)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
          ) : null}
          {referenceY > yMin && referenceY < yMax ? (
            <line
              x1={left}
              x2={left + innerWidth}
              y1={referenceYPosition}
              y2={referenceYPosition}
              stroke="rgba(200,16,46,0.55)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
          ) : null}

          <text
            x={left + 8}
            y={top + 15}
            fontSize={10}
            fontWeight={800}
            fill="rgba(11,37,69,0.44)"
            fontFamily="Segoe UI, sans-serif"
          >
            {quadrantLabels.topLeft}
          </text>
          <text
            x={left + innerWidth - 8}
            y={top + 15}
            textAnchor="end"
            fontSize={10}
            fontWeight={800}
            fill="rgba(11,37,69,0.44)"
            fontFamily="Segoe UI, sans-serif"
          >
            {quadrantLabels.topRight}
          </text>
          <text
            x={left + 8}
            y={top + innerHeight - 8}
            fontSize={10}
            fontWeight={800}
            fill="rgba(11,37,69,0.44)"
            fontFamily="Segoe UI, sans-serif"
          >
            {quadrantLabels.bottomLeft}
          </text>
          <text
            x={left + innerWidth - 8}
            y={top + innerHeight - 8}
            textAnchor="end"
            fontSize={10}
            fontWeight={800}
            fill="rgba(11,37,69,0.44)"
            fontFamily="Segoe UI, sans-serif"
          >
            {quadrantLabels.bottomRight}
          </text>

          <text
            x={left + innerWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill="rgba(23,32,51,0.8)"
            fontFamily="Segoe UI, sans-serif"
          >
            {xLabel}
          </text>
          <text
            x={18}
            y={top + innerHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${top + innerHeight / 2})`}
            fontSize={12}
            fontWeight={700}
            fill="rgba(23,32,51,0.8)"
            fontFamily="Segoe UI, sans-serif"
          >
            {yLabel}
          </text>

          {points.map((point) => {
            const radius = 8 + Math.sqrt(point.size / maxSize) * 10;
            return (
              <g key={point.id}>
                <circle
                  cx={scaleX(point.x)}
                  cy={scaleY(point.y)}
                  r={radius}
                  fill={color}
                  fillOpacity={0.9}
                  stroke="#fffdf8"
                  strokeWidth={1.5}
                />
                <text
                  x={scaleX(point.x)}
                  y={scaleY(point.y)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={point.marker.length > 2 ? 9 : 11}
                  fontWeight={800}
                  fill="#fff"
                  fontFamily="Segoe UI, sans-serif"
                >
                  {point.marker}
                </text>
                <title>
                  {point.label} — {xLabel}: {xFormat(point.x)}, {yLabel}: {yFormat(point.y)}
                  {point.detail ? ` · ${point.detail}` : ''}
                </title>
              </g>
            );
          })}
        </svg>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Bubble size = {sizeLabel}. Hover a bubble for exact values.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 0.5,
          mt: 1.5,
        }}
      >
        {points.map((point) => (
          <Stack key={point.id} direction="row" spacing={0.75} alignItems="baseline">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: color,
                flex: '0 0 auto',
                transform: 'translateY(-1px)',
              }}
            />
            <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
              <strong>{point.marker}</strong> {point.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 'auto' }}>
              {xFormat(point.x)} / {yFormat(point.y)}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
