import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import V2SidebarNav from './V2SidebarNav';
import { v2Colors } from '../theme';

// Replaces the copy-pasted <Box sx={{display:'flex'}}><SidebarNav/><content/></Box>
// wrapper every existing page embeds itself (see pages/Users.tsx:138-141).
export default function V2PageShell(props: { currentPage?: string; children: ReactNode; maxWidth?: number | string }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: v2Colors.bg }}>
      <V2SidebarNav currentPage={props.currentPage} />
      <Box sx={{ mt: 10, flexGrow: 1, p: 3, maxWidth: props.maxWidth, minWidth: 0 }}>
        {props.children}
      </Box>
    </Box>
  );
}
