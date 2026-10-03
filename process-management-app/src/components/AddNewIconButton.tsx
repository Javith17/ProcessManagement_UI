import { IconButton, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';

interface AddNewIconButtonProps {
  onClick: () => void;
  title: string;
}

export default function AddNewIconButton({ onClick, title }: AddNewIconButtonProps) {
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          flexShrink: 0,
          width: 30.75,
          height: 30.75,
          alignSelf: 'flex-end',
          mb: 0.5,
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
