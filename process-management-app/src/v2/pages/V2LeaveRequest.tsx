import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Button, Grid2, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import V2Badge, { V2BadgeVariant } from '../components/V2Badge';
import { useAppDispatch } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchLeaveRequestList, updateLeaveStatus } from '../../slices/adminSlice';
import { Search } from '@mui/icons-material';
import dayjs from "dayjs";
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/LeaveRequest.tsx.
export default function V2LeaveRequest() {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const [searchText, setSearchText] = useState("")
    const [leaveRequestList, setLeaveRequestList] = useState<any[]>()
    const [leaveActionDialog, setLeaveActionDialog] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<any>();
    const [isDetail, setIsDetail] = useState(false);

    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        dispatch(fetchLeaveRequestList({})).unwrap().then((res: any) => {
            setLeaveRequestList(res?.list)
        })
    }, [dispatch])

    const handleRefresh = () => {
        dispatch(fetchLeaveRequestList(searchText.length > 0 ? { search: searchText } : {})).unwrap().then((res: any) => {
            setLeaveRequestList(res?.list)
        })
    }

    const updateLeave = (id: string, status: string) => {
        dispatch(updateLeaveStatus({
            id: id,
            status: status,
            remarks: remarks,
            approved_by: JSON.parse(localStorage.getItem("userDetail") as string).user.userId
        })).then((res) => {
            setLeaveActionDialog(false);
            enqueueSnackbar(`Leave ${status} successfully`, { variant: 'success' })
            dispatch(fetchLeaveRequestList({})).unwrap().then((res: any) => {
                setLeaveRequestList(res?.list)
            })
        }).catch((err) => {
            setLeaveActionDialog(false);
            enqueueSnackbar(`Unable to ${status == 'Approved' ? 'approve' : 'reject'} leave`, { variant: 'success' })
        })
    }

    const formatDate = (date: string) => {
        return dayjs(date).format("DD-MMM-YYYY");
    };

    const leaveBadgeVariant = (status: string): V2BadgeVariant => {
        if (status === "Pending") return 'amber';
        if (status === "Approved") return 'green';
        if (status === "Rejected") return 'crimson';
        return 'muted';
    };

    return (
        <V2PageShell currentPage="leave_request">
            <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 6, md: 6 }}>
                    <TextField
                        placeholder='Search by employee'
                        variant="outlined"
                        size='small'
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value)
                        }}
                        onKeyDown={(ev) => {
                            if (ev.key == "Enter") {
                                dispatch(fetchLeaveRequestList(searchText.length > 0 ? { search: searchText } : {})).unwrap().then((res: any) => {
                                    setLeaveRequestList(res?.list)
                                })
                            }
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Grid2>

                <Grid2 size="grow" display="flex" alignItems="end" flexDirection="column">
                    <RefreshButton onClick={handleRefresh} />
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Leave Date</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {leaveRequestList && leaveRequestList?.length > 0 ? (
                                    leaveRequestList.map((row: any, index: number) => (
                                        <V2TableRowStyled key={row.id}>

                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>{row.user.emp_name}</TableCell>

                                            <TableCell>{row.leave_date ? formatDate(row.leave_date) : "-"}</TableCell>

                                            <TableCell>{row.created_at ? formatDate(row.created_at) : "-"}</TableCell>

                                            <TableCell>
                                                <V2Badge label={row.status?.toUpperCase()} variant={leaveBadgeVariant(row.status)} />
                                            </TableCell>

                                            {/* View Location */}
                                            <TableCell>
                                                {row.status == 'Pending' ? <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSelectedLeave(row);
                                                        setLeaveActionDialog(true);
                                                    }}
                                                >
                                                    Approve/Reject
                                                </Button> : <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSelectedLeave(row);
                                                        setLeaveActionDialog(true);
                                                        setIsDetail(true);
                                                    }}
                                                >
                                                    Details
                                                </Button>}
                                            </TableCell>

                                        </V2TableRowStyled>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No Data
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid2>
            </Grid2>

            <V2Drawer
                open={leaveActionDialog}
                onClose={() => {
                    setLeaveActionDialog(false);
                    setIsDetail(false);
                }}
                title="Leave Request Action"
                actions={<>
                    <Button
                        variant='text'
                        onClick={() => {
                            setLeaveActionDialog(false);
                            setIsDetail(false);
                        }}
                    >
                        Close
                    </Button>
                    {!isDetail && <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            updateLeave(selectedLeave.id, 'Rejected');
                        }}
                    >
                        Reject
                    </Button>}
                    {!isDetail && <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            updateLeave(selectedLeave.id, 'Approved');
                        }}
                    >
                        Approve
                    </Button>}
                </>}
            >
                    {selectedLeave && (
                        <Grid2 container spacing={2} sx={{ mt: 1 }}>

                            {/* Employee Name */}
                            <Grid2 size={{ xs: 6 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Employee Name
                                    </Typography>

                                    <Typography variant="body1">
                                        {selectedLeave.user.emp_name || "-"}
                                    </Typography>
                                </Box>
                            </Grid2>

                            <Grid2 size={{ xs: 6 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Status
                                    </Typography>

                                    <Typography variant="body1">
                                        <V2Badge label={selectedLeave.status?.toUpperCase()} variant={leaveBadgeVariant(selectedLeave.status)} />
                                    </Typography>
                                </Box>
                            </Grid2>

                            {/* Leave Date */}
                            <Grid2 size={{ xs: 6 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Leave Date
                                    </Typography>

                                    <Typography variant="body1">
                                        {formatDate(selectedLeave.leave_date)}
                                    </Typography>
                                </Box>
                            </Grid2>

                            {/* Applied Date */}
                            <Grid2 size={{ xs: 6 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Applied Date
                                    </Typography>

                                    <Typography variant="body1">
                                        {formatDate(selectedLeave.createdAt)}
                                    </Typography>
                                </Box>
                            </Grid2>

                            {/* Description */}
                            <Grid2 size={{ xs: 12 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Description
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        sx={{ whiteSpace: "pre-line" }}
                                    >
                                        {selectedLeave.description || "-"}
                                    </Typography>
                                </Box>
                            </Grid2>

                            {/* Remarks */}
                            <Grid2 size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Remarks"
                                    value={isDetail ? selectedLeave.remarks : remarks}
                                    disabled={isDetail}
                                    onChange={(e) => {
                                        setRemarks(e.target.value);
                                    }}
                                />
                            </Grid2>

                            {selectedLeave.status !== 'Pending' && <Grid2 size={{ xs: 6 }}>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Approved By
                                    </Typography>

                                    <Typography variant="body1">
                                        {selectedLeave.approved_user.emp_name}
                                    </Typography>
                                </Box>
                            </Grid2>}

                        </Grid2>
                    )}

            </V2Drawer>
        </V2PageShell>
    );
}
