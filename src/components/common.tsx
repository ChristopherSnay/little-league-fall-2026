import type { ReactNode } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TEAM } from '../data';
import type { Player } from '../lib/types';
import type { Insight, InsightTone } from '../lib/insights';

const toneColor: Record<InsightTone, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  warning: 'warning.main',
  info: 'info.main',
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" color="secondary.main">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ maxWidth: 840, mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  accent = 'primary.main',
}: {
  label: string;
  value: ReactNode;
  detail: string;
  accent?: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        borderTop: '4px solid',
        borderTopColor: accent,
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="space-between"
          alignItems="flex-start"
          useFlexGap
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        <Box sx={{ mt: subtitle ? 1.5 : 1 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '4px solid',
        borderLeftColor: toneColor[insight.tone],
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Typography variant="overline" color="text.secondary">
          {insight.title}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25 }}>
          {insight.value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {insight.detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function Metric({
  label,
  value,
  accent = 'text.primary',
}: {
  label: string;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={800} sx={{ color: accent, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function PlayerIdentity({ player, showPositions = false }: { player: Player; showPositions?: boolean }) {
  const topPositions = Object.entries(player.fielding.positions)
    .filter(([, innings]) => innings > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([position]) => position);

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Chip
        label={`#${player.number}`}
        size="small"
        sx={{ minWidth: 44, bgcolor: 'rgba(11,37,69,0.08)' }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800} noWrap>
          {player.name}
        </Typography>
        {showPositions ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {topPositions.length ? topPositions.join(' · ') : 'No fielding innings'}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

export function DataNotes() {
  const { notes, discrepancies } = TEAM.dataQuality;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
          transform: 'rotate(45deg)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<Typography sx={{ fontWeight: 800, lineHeight: 1 }}>+</Typography>}
        sx={{ px: 2.5 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Data notes & caveats
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Source: {TEAM.meta.sourceFile} · {TEAM.meta.playerCount} players · {TEAM.meta.games} games
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pt: 0 }}>
        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
          {notes.map((note) => (
            <Typography component="li" variant="body2" color="text.secondary" key={note} sx={{ mb: 0.9 }}>
              {note}
            </Typography>
          ))}
        </Box>
        {discrepancies.length ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>
              Team row vs. sum of player rows
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {discrepancies.map((entry) => (
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  key={entry.stat}
                  sx={{ mb: 0.5 }}
                >
                  {entry.stat}: Team row {String(entry.teamValue)}, player sum {entry.playerSum}
                </Typography>
              ))}
            </Box>
          </Box>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}
