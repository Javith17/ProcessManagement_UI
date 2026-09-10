import { Box, Card, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { v2Colors } from '../theme';

// Mirrors ui-design-concept.html's .panel / .panel-head / .panel-body pattern:
// a bordered card with a titled header row and a padded body.
export default function V2Panel(props: { title?: ReactNode; caption?: ReactNode; actions?: ReactNode; flush?: boolean; children: ReactNode; sx?: any }) {
  const { title, caption, actions, flush, children, sx } = props;
  return (
    <Card sx={{ mb: 2.5, ...sx }}>
      {(title || caption || actions) && (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
          flexWrap: 'wrap', padding: '14px 18px', borderBottom: `1px solid ${v2Colors.line}`,
        }}>
          {title && <Typography sx={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 700 }}>{title}</Typography>}
          {caption && <Typography sx={{ fontSize: '11px', letterSpacing: '0.09em', textTransform: 'uppercase', color: v2Colors.faint, fontWeight: 600 }}>{caption}</Typography>}
          {actions}
        </Box>
      )}
      <Box sx={{ padding: flush ? 0 : '18px' }}>
        {children}
      </Box>
    </Card>
  );
}
