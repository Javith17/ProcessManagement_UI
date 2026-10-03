import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

interface PartRow {
    id?: string;
    part_name?: string;
    part_code?: string;
    available_aty?: string | number;
    minimum_stock_qty?: string | number;
}

interface LowStockTableProps {
    parts: PartRow[];
    lowStockOnly?: boolean;
    onView?: () => void;
}

export function isLowStock(part: PartRow): boolean {
    return Number(part.available_aty) < Number(part.minimum_stock_qty);
}

export default function LowStockTable({ parts, lowStockOnly = false, onView }: LowStockTableProps) {
    const rows = lowStockOnly ? parts.filter(isLowStock) : parts;

    return (
        <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Part Code</TableCell>
                        <TableCell>Part Name</TableCell>
                        <TableCell align="right">Available Qty</TableCell>
                        <TableCell align="right">Minimum Stock Qty</TableCell>
                        {onView && <TableCell></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length > 0 ? rows.map((row, idx) => {
                        const low = isLowStock(row);
                        return (
                            <TableRow key={row.id || idx} sx={low ? { backgroundColor: '#fbe6ea' } : undefined}>
                                <TableCell>{row.part_code}</TableCell>
                                <TableCell>{row.part_name}</TableCell>
                                <TableCell align="right" sx={low ? { color: '#bb0037', fontWeight: 700 } : undefined}>{row.available_aty}</TableCell>
                                <TableCell align="right">{row.minimum_stock_qty}</TableCell>
                                {onView && (
                                    <TableCell style={{ cursor: 'pointer' }}>
                                        <MdOutlineRemoveRedEye onClick={onView} />
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    }) : (
                        <TableRow>
                            <TableCell colSpan={onView ? 5 : 4} align="center">No Data</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
