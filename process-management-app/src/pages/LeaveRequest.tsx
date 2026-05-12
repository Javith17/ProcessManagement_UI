import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText, Alert, CircularProgress, Pagination, Typography, Chip } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewRole, fetchEmployeeAttendanceList, fetchLeaveRequestList, fetchRoles, updateAttendanceStatus, updateLeaveStatus } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
// Add imports
import dayjs from "dayjs";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { nav_leave_request, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
export default function LeaveRequest() {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const [searchText, setSearchText] = useState("")
    const [leaveRequestList, setLeaveRequestList] = useState<any[]>()
    const [leaveActionDialog, setLeaveActionDialog] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<any>();
    const [isDetail, setIsDetail] = useState(false);

    const [pageNo, setPageNo] = useState(1)

    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        dispatch(fetchLeaveRequestList({})).unwrap().then((res: any) => {
            setLeaveRequestList(res?.list)
        })
    }, [dispatch])

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

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_leave_request} />

            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
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

                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <TableContainer component={Paper}>
                        <Table sx={{
                            '& .MuiTableCell-head': {
                                lineHeight: 0.8,
                                backgroundColor: "#fadbda",
                                fontWeight: 'bold'
                            }
                        }}>
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
                                        <TableRowStyled key={row.id}>

                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>{row.user.emp_name}</TableCell>

                                            <TableCell>{row.leave_date ? formatDate(row.leave_date) : "-"}</TableCell>

                                            <TableCell>{row.created_at ? formatDate(row.created_at) : "-"}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={row.status?.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor:
                                                            row.status === "Pending"
                                                                ? "#e3f2fd"
                                                                : row.status === "Approved"
                                                                    ? "#e8f5e9"
                                                                    : row.status === "Rejected"
                                                                        ? "#ffebee"
                                                                        : "#f5f5f5",

                                                        color:
                                                            row.status === "Pending"
                                                                ? "#1976d2"
                                                                : row.status === "Approved"
                                                                    ? "#2e7d32"
                                                                    : row.status === "Rejected"
                                                                        ? "#d32f2f"
                                                                        : "#616161",
                                                    }}
                                                />
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

                                        </TableRowStyled>
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

            <Dialog
                open={leaveActionDialog}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") {
                        return;
                    }

                    setLeaveActionDialog(false);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Leave Request Action
                </DialogTitle>

                <DialogContent>

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
                                        <Chip
                                            label={selectedLeave.status?.toUpperCase()}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                backgroundColor:
                                                    selectedLeave.status === "Pending"
                                                        ? "#e3f2fd"
                                                        : selectedLeave.status === "Approved"
                                                            ? "#e8f5e9"
                                                            : selectedLeave.status === "Rejected"
                                                                ? "#ffebee"
                                                                : "#f5f5f5",

                                                color:
                                                    selectedLeave.status === "Pending"
                                                        ? "#1976d2"
                                                        : selectedLeave.status === "Approved"
                                                            ? "#2e7d32"
                                                            : selectedLeave.status === "Rejected"
                                                                ? "#d32f2f"
                                                                : "#616161",
                                            }}
                                        />
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

                </DialogContent>

                <DialogActions>
                    <Button
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

                </DialogActions>
            </Dialog>
        </Box>
    );
}
