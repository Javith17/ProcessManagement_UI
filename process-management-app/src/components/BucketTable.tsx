import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography } from '@mui/material';
import type { StatusBarChartDatum } from './StatusBarChart';

interface BucketTableProps {
    data: StatusBarChartDatum[];
    labelHeader?: string;
    valueHeader?: string;
    activeLabel?: string | null;
    onRowClick?: (label: string) => void;
    valueFormatter?: (value: number) => string;
}

export default function BucketTable({ data, labelHeader = 'Name', valueHeader = 'Count', activeLabel, onRowClick, valueFormatter }: BucketTableProps) {
    if (!data.length) {
        return <Typography variant="body2" color="text.secondary">No data</Typography>;
    }

    return (
        <Table size="small" sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
            <TableHead>
                <TableRow>
                    <TableCell>{labelHeader}</TableCell>
                    <TableCell align="right">{valueHeader}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((d) => (
                    <TableRow
                        key={d.label}
                        onClick={() => onRowClick?.(d.label)}
                        sx={{
                            cursor: onRowClick ? 'pointer' : 'default',
                            backgroundColor: activeLabel === d.label ? 'action.selected' : undefined,
                            '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : undefined,
                        }}
                    >
                        <TableCell sx={{ borderLeft: d.color ? `3px solid ${d.color}` : undefined }}>{d.label}</TableCell>
                        <TableCell align="right">{valueFormatter ? valueFormatter(d.value) : d.value}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
