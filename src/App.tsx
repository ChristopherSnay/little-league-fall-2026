import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { PlayerDrawer } from './components/PlayerDrawer';
import { PLAYERS, TEAM } from './data';
import { TABS } from './lib/navigation';
import type { PlayerSelectContext, TabKey } from './lib/navigation';
import type { Player } from './lib/types';

function App() {
  const [selection, setSelection] = useState<{ playerId: string; pathname: string } | null>(
    null,
  );
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = TABS.find((tab) => tab.path === location.pathname)?.key;

  const selectedPlayer =
    selection && selection.pathname === location.pathname
      ? PLAYERS.find((player) => player.id === selection.playerId) ?? null
      : null;

  const openPlayer = (player: Player) =>
    setSelection({ playerId: player.id, pathname: location.pathname });
  const closePlayer = () => setSelection(null);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollRestoration />
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, sm: 72 } }}>
          <Box
            aria-hidden
            sx={{
              width: 24,
              height: 24,
              flex: '0 0 auto',
              border: '2px solid rgba(255,255,255,0.82)',
              borderRadius: 0,
              transform: 'rotate(45deg)',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ color: '#fff', lineHeight: 1.1, letterSpacing: '-0.01em' }}
            >
              JC Bombers
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.66)', display: 'block' }}
            >
              {TEAM.meta.ageGroup} · {TEAM.meta.season} · season totals
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${TEAM.meta.games} games`}
            sx={{
              ml: 'auto',
              bgcolor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
        </Toolbar>
        <Tabs
          value={activeTab ?? false}
          onChange={(_, value: TabKey) => {
            const target = TABS.find((tab) => tab.key === value);
            if (target) navigate(target.path);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 1, md: 2 },
            minHeight: 48,
            '& .MuiTabs-indicator': { height: 3, bgcolor: 'secondary.light' },
          }}
        >
          {TABS.map((entry) => (
            <Tab key={entry.key} value={entry.key} label={entry.label} />
          ))}
        </Tabs>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1460,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Outlet context={{ onSelectPlayer: openPlayer } satisfies PlayerSelectContext} />
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          py: 2.5,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ maxWidth: 1460, mx: 'auto', width: '100%' }}
        >
          <Typography variant="caption" color="text.secondary">
            {TEAM.meta.team} {TEAM.meta.ageGroup} · {TEAM.meta.season} · source:{' '}
            {TEAM.meta.sourceFile}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Season totals only — no game logs, opponents, or win/loss record in the export.
          </Typography>
        </Stack>
      </Box>

      <PlayerDrawer
        player={selectedPlayer}
        open={Boolean(selectedPlayer)}
        onClose={closePlayer}
      />
    </Box>
  );
}

export default App;
