import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import V2PageShell from './V2PageShell';

// Temporary placeholder used while a v2 page is still being built out —
// replaced with the real port page-by-page per the build plan's batches.
export default function V2Stub(props: { currentPage?: string; title: string }) {
  return (
    <V2PageShell currentPage={props.currentPage}>
      <Typography variant="h4" gutterBottom>{props.title}</Typography>
      <Box sx={{ color: 'text.secondary' }}>v2 page under construction.</Box>
    </V2PageShell>
  );
}
