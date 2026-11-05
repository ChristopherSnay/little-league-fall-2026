import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Accent bar for full-height stat cards, drawn as an inset pseudo-element
 * instead of a border. Cards already have a 1px outline from the theme; a 4px
 * accent border would sit on the outer border-box edge and look wider than the
 * card face by 1px on each side.
 */
export function accentCardSx(
  side: 'top' | 'left',
  color: string,
): SxProps<Theme> {
  return {
    height: '100%',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      bgcolor: color,
      pointerEvents: 'none',
      ...(side === 'top'
        ? { top: 0, left: 0, right: 0, height: 4 }
        : { top: 0, bottom: 0, left: 0, width: 4 }),
    },
  };
}
