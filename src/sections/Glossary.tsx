import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { ChartCard, DataNotes, SectionHeader } from '../components/common';
import { TEAM } from '../data';
import type { Section } from '../lib/types';

const SECTION_INFO: Array<{ key: Section; label: string; description: string }> = [
  {
    key: 'batting',
    label: 'Batting',
    description: 'Plate-appearance, discipline, batted-ball, and situational stats.',
  },
  {
    key: 'pitching',
    label: 'Pitching',
    description: 'Pitching line, command, batted-ball, and pitch-tracking columns.',
  },
  {
    key: 'fielding',
    label: 'Fielding',
    description: 'Chances, catching results, and innings by position.',
  },
];

type GlossaryFilter = 'all' | Section;

export function Glossary() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GlossaryFilter>('all');

  const sections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SECTION_INFO.filter((section) => filter === 'all' || filter === section.key).map(
      (section) => ({
        ...section,
        entries: TEAM.glossary[section.key].filter((entry) => {
          if (!normalized) return true;
          return `${entry.abbr} ${entry.definition}`.toLowerCase().includes(normalized);
        }),
      }),
    );
  }, [filter, query]);

  const total = sections.reduce((sum, section) => sum + section.entries.length, 0);
  const glossaryTotal = Object.values(TEAM.glossary).reduce(
    (sum, entries) => sum + entries.length,
    0,
  );

  return (
    <Box>
      <SectionHeader
        eyebrow="Reference"
        title="Glossary"
        description="Every abbreviation in the export, with the definition from the CSV's Glossary row. Hover any stat label elsewhere in the app to see the same wording."
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <TextField
          size="small"
          label="Search definitions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 320 } }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, value: GlossaryFilter | null) => {
            if (value) setFilter(value);
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all">All</ToggleButton>
          {SECTION_INFO.map((section) => (
            <ToggleButton key={section.key} value={section.key}>
              {section.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {total} of {glossaryTotal} definitions.
      </Typography>

      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid key={section.key} size={{ xs: 12 }}>
            <ChartCard
              title={`${section.label} (${section.entries.length})`}
              subtitle={section.description}
            >
              {section.entries.length ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'repeat(3, minmax(0, 1fr))',
                    },
                    gap: 1,
                  }}
                >
                  {section.entries.map((entry) => (
                    <Box
                      key={`${section.key}-${entry.abbr}`}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        p: 1.25,
                        borderRadius: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'rgba(11,37,69,0.02)',
                      }}
                    >
                      <Chip
                        label={entry.abbr}
                        size="small"
                        sx={{ flex: '0 0 auto', minWidth: 56 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ pt: 0.15 }}>
                        {entry.definition}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No definitions match this search.
                </Typography>
              )}
            </ChartCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <DataNotes />
      </Box>
    </Box>
  );
}
