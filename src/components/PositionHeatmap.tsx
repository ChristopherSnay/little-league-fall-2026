import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { PlayerIdentity } from './common';
import type { Player } from '../lib/types';
import { formatInnings, POSITIONS } from '../lib/stats';

export function PositionHeatmap({
  players,
  onSelectPlayer,
}: {
  players: Player[];
  onSelectPlayer?: (player: Player) => void;
}) {
  const maxInnings = Math.max(
    1,
    ...players.flatMap((player) =>
      POSITIONS.map((position) => player.fielding.positions[position] ?? 0),
    ),
  );

  const totals = POSITIONS.map((position) =>
    players.reduce(
      (total, player) => total + (player.fielding.positions[position] ?? 0),
      0,
    ),
  );

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      className="scroll-hint"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.paper',
        overflowX: 'auto',
      }}
    >
      <Table size="small" aria-label="Fielding innings by player and position">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                bgcolor: 'background.paper',
                minWidth: 190,
                boxShadow: '1px 0 0 rgba(11,37,69,0.08)',
              }}
            >
              Player
            </TableCell>
            {POSITIONS.map((position) => (
              <TableCell key={position} align="center" sx={{ minWidth: 48 }}>
                {position}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ minWidth: 64 }}>
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.id}
              hover={Boolean(onSelectPlayer)}
              onClick={onSelectPlayer ? () => onSelectPlayer(player) : undefined}
              tabIndex={onSelectPlayer ? 0 : undefined}
              onKeyDown={
                onSelectPlayer
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectPlayer(player);
                      }
                    }
                  : undefined
              }
              sx={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
            >
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  boxShadow: '1px 0 0 rgba(11,37,69,0.08)',
                }}
              >
                <PlayerIdentity player={player} />
              </TableCell>
              {POSITIONS.map((position) => {
                const innings = player.fielding.positions[position] ?? 0;
                const intensity = innings / maxInnings;
                return (
                  <TableCell
                    key={position}
                    align="center"
                    sx={{
                      p: 0.5,
                      minWidth: 48,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 0,
                        py: 0.55,
                        px: 0.5,
                        bgcolor: innings
                          ? `rgba(11, 37, 69, ${0.07 + intensity * 0.78})`
                          : 'transparent',
                        color: intensity > 0.56 ? '#fff' : 'text.primary',
                        fontWeight: innings ? 700 : 400,
                      }}
                    >
                      {formatInnings(innings)}
                    </Box>
                  </TableCell>
                );
              })}
              <TableCell align="right" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                {formatInnings(player.fielding.totalInnings)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ bgcolor: 'rgba(11,37,69,0.04)' }}>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 1,
                bgcolor: 'inherit',
                fontWeight: 800,
              }}
            >
              Team innings by position
            </TableCell>
            {totals.map((innings, index) => (
              <TableCell
                key={POSITIONS[index]}
                align="center"
                sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                {formatInnings(innings)}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatInnings(totals.reduce((sum, value) => sum + value, 0))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>
        Darker cells mean more innings. C = catcher; SF = short field. Click a row for the full
        player sheet.
      </Typography>
    </TableContainer>
  );
}
