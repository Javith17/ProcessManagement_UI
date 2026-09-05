import { IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';

export default function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="Refresh">
      <IconButton onClick={onClick} size="small" sx={{ border: '1px solid rgba(0, 0, 0, 0.23)' }}>
        <Refresh fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
