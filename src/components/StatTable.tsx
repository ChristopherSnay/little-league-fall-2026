import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GlossaryTooltip } from './GlossaryTooltip';
import type { Column } from '../lib/columns';
import type { SortDirection, StatValue } from '../lib/types';
import { toNumberOrNull } from '../lib/stats';

function compareValues(a: StatValue, b: StatValue): number {
  const aNumber = toNumberOrNull(a);
  const bNumber = toNumberOrNull(b);

  if (aNumber === null && bNumber === null) return String(a ?? '').localeCompare(String(b ?? ''));
  if (aNumber === null) return 1;
  if (bNumber === null) return -1;
  return aNumber - bNumber;
}

export function StatTable<T>({
  rows,
  columns,
  getRowId,
  getSearchText,
  rowLabel,
  initialSortKey,
  initialSortDirection = 'desc',
  onRowClick,
  showRank = false,
  caption,
  emptyMessage = 'No players match this search.',
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  getSearchText: (row: T) => string;
  rowLabel: (row: T) => ReactNode;
  initialSortKey: string;
  initialSortDirection?: SortDirection;
  onRowClick?: (row: T) => void;
  showRank?: boolean;
  caption?: string;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  const effectiveSortKey = columns.some((column) => column.key === sortKey)
    ? sortKey
    : columns[0]?.key;
  const activeColumn = columns.find((column) => column.key === effectiveSortKey) ?? columns[0];

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(normalizedQuery));
  }, [getSearchText, query, rows]);

  const sortedRows = useMemo(() => {
    if (!activeColumn) return filteredRows;
    return [...filteredRows].sort(
      (a, b) =>
        compareValues(activeColumn.value(a), activeColumn.value(b)) *
        (sortDirection === 'asc' ? 1 : -1),
    );
  }, [activeColumn, filteredRows, sortDirection]);

  if (!columns.length) return null;

  const handleSort = (column: Column<T>) => {
    if (effectiveSortKey === column.key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(column.key);
    setSortDirection(column.defaultSortDirection ?? 'desc');
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="body2" color="text.secondary">
          {sortedRows.length} {sortedRows.length === 1 ? 'player' : 'players'} shown
        </Typography>
        <TextField
          size="small"
          label="Search players"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 240 } }}
        />
      </Stack>
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
        <Table size="small" className="stat-table" aria-label={caption ?? 'Player statistics'}>
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
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? 'right'}
                  sortDirection={
                    effectiveSortKey === column.key ? sortDirection : false
                  }
                  sx={{ minWidth: column.minWidth ?? 64 }}
                >
                  <TableSortLabel
                    active={effectiveSortKey === column.key}
                    direction={effectiveSortKey === column.key ? sortDirection : 'asc'}
                    onClick={() => handleSort(column)}
                  >
                    <GlossaryTooltip section={column.section} abbr={column.key}>
                      {column.label}
                    </GlossaryTooltip>
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row, index) => {
              const rank = index + 1;
              return (
                <TableRow
                  key={getRowId(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      {showRank ? (
                        <Chip
                          size="small"
                          label={rank}
                          color={rank === 1 ? 'secondary' : 'default'}
                          variant={rank <= 3 ? 'filled' : 'outlined'}
                          sx={{ minWidth: 32 }}
                        />
                      ) : null}
                      {rowLabel(row)}
                    </Stack>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align ?? 'right'}
                      sx={{ whiteSpace: 'nowrap', minWidth: column.minWidth ?? 64 }}
                    >
                      {column.format
                        ? column.format(column.value(row))
                        : String(column.value(row) ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
