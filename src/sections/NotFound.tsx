import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export function NotFound() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <Typography variant="overline" color="secondary.main">
        404
      </Typography>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        That page is not part of this season&apos;s site.
      </Typography>
      <Button component={RouterLink} to="/overview" variant="contained">
        Back to overview
      </Button>
    </Box>
  );
}
