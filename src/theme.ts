import { createTheme } from '@mui/material/styles';

const navy = '#0b2545';
const red = '#c8102e';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: navy,
      dark: '#071a33',
      light: '#244b7a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: red,
      dark: '#8f0b20',
      light: '#e32f4a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f1e7',
      paper: '#fffdf8',
    },
    text: {
      primary: '#172033',
      secondary: '#5d6678',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ef6c00' },
    info: { main: '#1565c0' },
    divider: 'rgba(11, 37, 69, 0.12)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
    overline: { fontWeight: 800, letterSpacing: '0.12em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(120deg, #071a33 0%, #0b2545 45%, #123a6b 100%)',
          boxShadow: '0 10px 30px rgba(7, 26, 51, 0.24)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.74)',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(11, 37, 69, 0.08)',
          borderRadius: 0,
          boxShadow: '0 14px 34px rgba(11, 37, 69, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          fontWeight: 800,
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
});
