/**
 * Width reserved for the player-name axis on horizontal bar charts.
 * MUI X Charts defaults this to 45px, which truncates most last names
 * (e.g. "Kudlak" renders as "Kudl...") before they can be displayed.
 *
 * MUI X Charts ADDS this width to `margin.left`. Keep the shared margin's
 * `left` at 0 so the axis space is only reserved once; otherwise the plot
 * area gets pushed inward twice and the chart looks centered in its card.
 */
export const PLAYER_AXIS_WIDTH = 104;

/** Shared margins for horizontal bar charts with player names on the y-axis. */
export const HORIZONTAL_BAR_MARGIN = {
  left: 0,
  right: 0,
  top: 12,
  bottom: 56,
} as const;
