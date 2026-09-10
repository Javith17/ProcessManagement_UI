import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ReactNode } from 'react';
import { v2Colors, v2Fonts, v2Shadows } from '../theme';

// Right-side slide-in popup lifted from ui-design-concept.html's .drawer / .drawer-head /
// .drawer-body / .drawer-foot classes. Used in place of a centered Dialog for
// substantial create/edit forms and content-heavy popups.
export default function V2Drawer(props: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  width?: number | string;
  disableBackdropClose?: boolean;
}) {
  const { open, onClose, title, children, actions, width = 440, disableBackdropClose } = props;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={(event, reason) => {
        if (disableBackdropClose && reason === 'backdropClick') return;
        onClose();
      }}
      PaperProps={{
        sx: {
          width,
          maxWidth: '92vw',
          boxShadow: v2Shadows.drawer,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: v2Colors.surface,
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${v2Colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 'none' }}>
        <Typography sx={{ fontFamily: v2Fonts.display, fontWeight: 700, fontSize: 17, color: v2Colors.ink }}>{title}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: v2Colors.muted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        {children}
      </Box>
      {actions && (
        <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${v2Colors.line}`, display: 'flex', justifyContent: 'flex-end', gap: 1.25, flex: 'none' }}>
          {actions}
        </Box>
      )}
    </Drawer>
  );
}

// Groups related fields with a small uppercase dashed-underline label, matching
// ui-design-concept.html's .form-section / .section-title.
export function V2FormSection(props: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
      <Typography sx={{
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: v2Colors.faint,
        fontWeight: 700, mb: 1.5, pb: 1, borderBottom: `1px dashed ${v2Colors.line}`,
      }}>
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
}
