import type { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { TEAM } from '../data';
import type { Section } from '../lib/types';

function getDefinition(section: Section, abbr: string): string | undefined {
  return TEAM.glossary[section].find((entry) => entry.abbr === abbr)?.definition;
}

export function GlossaryTooltip({
  section,
  abbr,
  children,
}: {
  section: Section;
  abbr: string;
  children: ReactNode;
}) {
  const definition = getDefinition(section, abbr);

  if (!definition) return <>{children}</>;

  return (
    <Tooltip title={definition} arrow describeChild>
      <span
        tabIndex={0}
        style={{
          borderBottom: '1px dotted currentColor',
          cursor: 'help',
          outlineOffset: 3,
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
}
