import { Card, Typography, Box } from '@mui/material';

interface StatTileProps {
    label: string;
    value: number | string;
    sub?: string;
    color?: string;
    onClick?: () => void;
}

export default function StatTile({ label, value, sub, color = '#007fff', onClick }: StatTileProps) {
    return (
        <Card
            onClick={onClick}
            sx={{
                p: 2,
                cursor: onClick ? 'pointer' : 'default',
                borderLeft: `4px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                height: '100%',
                '&:hover': onClick ? { boxShadow: 2 } : undefined,
            }}
        >
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {value}
            </Typography>
            {sub && (
                <Box>
                    <Typography variant="caption" color="text.secondary">{sub}</Typography>
                </Box>
            )}
        </Card>
    );
}
