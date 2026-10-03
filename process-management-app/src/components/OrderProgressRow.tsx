import { Box, Card, LinearProgress, Typography } from '@mui/material';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

interface OrderProgressRowProps {
    orderId: string;
    machineName: string;
    customerName?: string;
    status?: string;
    percent: number;
    caption?: string;
    onClick?: () => void;
    onView?: () => void;
}

export default function OrderProgressRow({ orderId, machineName, customerName, status, percent, caption, onClick, onView }: OrderProgressRowProps) {
    return (
        <Card
            onClick={onClick}
            sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { boxShadow: 2 } : undefined,
            }}
        >
            <Box sx={{ minWidth: 160 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{orderId}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {customerName ? `${customerName} — ` : ''}{machineName}
                </Typography>
            </Box>

            {status && (
                <Typography variant="caption" sx={{ minWidth: 110 }}>{status}</Typography>
            )}

            <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, percent))}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={percent >= 100 ? 'success' : 'info'}
                />
                {caption && (
                    <Typography variant="caption" color="text.secondary">{caption}</Typography>
                )}
            </Box>

            <Typography variant="subtitle2" sx={{ minWidth: 44, textAlign: 'right', fontWeight: 700 }}>
                {percent}%
            </Typography>

            {onView && (
                <MdOutlineRemoveRedEye
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    size={18}
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                />
            )}
        </Card>
    );
}
