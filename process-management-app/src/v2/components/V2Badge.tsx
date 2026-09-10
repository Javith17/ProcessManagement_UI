import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import { v2Colors } from '../theme';

export type V2BadgeVariant = 'crimson' | 'green' | 'info' | 'amber' | 'muted' | 'action';

const variantSx: Record<V2BadgeVariant, { bg: string; color: string; border?: string; borderStyle?: string }> = {
  crimson: { bg: v2Colors.primaryTint, color: v2Colors.primary },
  green: { bg: v2Colors.secondaryTint, color: v2Colors.secondary },
  info: { bg: v2Colors.infoTint, color: v2Colors.info },
  amber: { bg: v2Colors.amberTint, color: v2Colors.amber },
  muted: { bg: v2Colors.surface2, color: v2Colors.muted, border: v2Colors.line, borderStyle: 'solid' },
  action: { bg: 'transparent', color: v2Colors.primary, border: v2Colors.primary, borderStyle: 'dashed' },
};

// Status pill lifted from ui-design-concept.html's .badge / .badge--* / .badge--action classes.
export default function V2Badge(props: {
  label: ReactNode;
  variant?: V2BadgeVariant;
  onClick?: (e: React.MouseEvent) => void;
  dot?: boolean;
  sx?: object;
}) {
  const { label, variant = 'muted', onClick, dot = true, sx } = props;
  const v = variantSx[variant];
  return (
    <Box
      component={onClick ? 'button' : 'span'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 9px',
        borderRadius: '20px',
        fontSize: '11.5px',
        fontWeight: 700,
        lineHeight: 1.5,
        backgroundColor: v.bg,
        color: v.color,
        border: v.border ? `1px ${v.borderStyle} ${v.border}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit',
        appearance: 'none',
        '&:hover': onClick ? { backgroundColor: variant === 'action' ? v2Colors.primaryTint : v.bg, opacity: variant === 'action' ? 1 : 0.85 } : undefined,
        ...sx,
      }}
    >
      {dot && variant !== 'action' && (
        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', flex: 'none' }} />
      )}
      {label}
    </Box>
  );
}
