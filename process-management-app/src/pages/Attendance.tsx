import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText, Alert, CircularProgress, Pagination, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewRole, fetchEmployeeAttendanceList, fetchRoles, updateAttendanceStatus } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
// Add imports
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { nav_attendance, nav_roles, nav_stores, page_limit, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import loader from '../assets/image/loader.gif'
import { fetchPartsInStores } from '../slices/dashboardSlice';

export default function Attendance() {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const [searchText, setSearchText] = useState("")
    const [attendanceList, setAttendanceList] = useState<any[]>()

    const [pageNo, setPageNo] = useState(1)

    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

    const [verifyDialog, setVerifyDialog] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);

    const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

    const [remarks, setRemarks] = useState("");

    const formatDate = (date: string) => {
        return dayjs(date).format("YYYY-MM-DD");
    };

    const formatTime = (epoch: string | number) => {
        if (!epoch) return "-";

        return dayjs(Number(epoch)).format("HH:mm");
    };

    const parseLocationDetails = (locationDetails: string) => {
        try {
            return JSON.parse(locationDetails || "{}");
        } catch {
            return {};
        }
    };

    const parseBreakDetails = (breakDetails: string) => {
        try {
            return JSON.parse(breakDetails || "[]");
        } catch {
            return [];
        }
    };

    useEffect(() => {
        dispatch(fetchEmployeeAttendanceList({ attendance_date: 
            dayjs(selectedDate ? selectedDate : new Date()).format("YYYY-MM-DD") 
        })).unwrap().then((res: any) => {
            setAttendanceList(res?.list)
        })
    }, [dispatch, selectedDate])

    const handleSearch = () => {
        // dispatch(fetchPartsInStores({ searchText })).unwrap()
    }

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_attendance} />

            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
                <Grid2 size={{ xs: 6, md: 6 }}>
                    <DatePicker
                        label="Attendance Date"
                        value={selectedDate}
                        onChange={(newValue) => {
                            setSelectedDate(newValue);

                            if (newValue) {
                                console.log(dayjs(newValue).format("YYYY-MM-DD"));
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true
                            }
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
                                    <TableCell>Check In Time</TableCell>
                                    <TableCell>Check Out Time</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>View Location</TableCell>
                                    <TableCell>Details</TableCell>
                                    <TableCell>Verification</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {attendanceList && attendanceList?.length > 0 ? (
                                    attendanceList.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>

                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>{row.emp_name}</TableCell>

                                            <TableCell>{row.check_in_time ? new Date(Number(row.check_in_time)).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            }) : "-"}</TableCell>

                                            <TableCell>{row.check_out_time ? new Date(Number(row.check_out_time)).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            }) : "-"}</TableCell>

                                            <TableCell>{row.status}</TableCell>

                                            {/* View Location */}
                                            <TableCell>
                                                {row?.location_details ? <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<LocationOnIcon />}
                                                    onClick={() => {
                                                        window.open(
                                                            `https://www.google.com/maps?q=${row?.location_details ? JSON.parse(row?.location_details).check_in_location : ''}&ll=${row?.location_details ? JSON.parse(row?.location_details).check_in_location : ''}&z=20`,
                                                            "_blank"
                                                        )
                                                    }}
                                                >
                                                    View
                                                </Button> : "-"}
                                            </TableCell>

                                            {/* Details */}
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    disabled={row.status != 'Present'}
                                                    onClick={() => {
                                                        setSelectedAttendance(row)
                                                        setDetailsDialog(true)
                                                    }}
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>

                                            {/* Verify */}
                                            <TableCell>
                                                {(row.is_verified || row.status == 'Rejected') ? (
                                                    <Typography sx={{ color: row.status == 'Verified' ? 'green' : 'red', fontWeight: 100 }}>
                                                        {row.status}
                                                    </Typography>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        disabled={row.status != 'Present'}
                                                        onClick={() => {
                                                            setSelectedAttendance(row)
                                                            setRemarks("")
                                                            setVerifyDialog(true)
                                                        }}
                                                    >
                                                        Verify
                                                    </Button>
                                                )}
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
                open={verifyDialog}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") {
                        return
                    }

                    setVerifyDialog(false)
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Verify Attendance
                </DialogTitle>

                <DialogContent>

                    {selectedAttendance && (() => {

                        const locationDetails = parseLocationDetails(
                            selectedAttendance.location_details
                        );

                        const breakList = parseBreakDetails(
                            selectedAttendance.break_details
                        );

                        return (
                            <Grid2 container spacing={2} sx={{ mt: 1 }}>

                                {/* Employee */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Employee Name
                                        </Typography>

                                        <Typography variant="body1">
                                            {selectedAttendance.emp_name}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Date */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Date
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatDate(selectedAttendance.attendance_date)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check In */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check In Time
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatTime(selectedAttendance.check_in_time)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check Out */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check Out Time
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatTime(selectedAttendance.check_out_time)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check In Location */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check In Location
                                        </Typography>

                                        <Typography variant="body1">
                                            {locationDetails?.check_in_location || "-"}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check Out Location */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check Out Location
                                        </Typography>

                                        <Typography variant="body1">
                                            {locationDetails?.check_out_location || "-"}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                <Grid2 size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check In Image
                                        </Typography>

                                        <img src={`${process.env.REACT_APP_API_URL}user/loadImage/${formatDate(selectedAttendance.attendance_date)}/${selectedAttendance.attendance_user_id}.png`} style={{ height: '160px', width: '120px' }} />
                                    </Box>
                                </Grid2>

                                {/* Break Details */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mb: 1, fontWeight: 600 }}
                                    >
                                        Break Details
                                    </Typography>

                                    <TableContainer component={Paper}>
                                        <Table size="small">

                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Break In</TableCell>
                                                    <TableCell>Break Out</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {breakList.length > 0 ? (
                                                    breakList.map((br: any, index: number) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {formatTime(br.break_in)}
                                                            </TableCell>

                                                            <TableCell>
                                                                {formatTime(br.break_out)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={2}
                                                            align="center"
                                                        >
                                                            No Breaks
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>

                                        </Table>
                                    </TableContainer>
                                </Grid2>

                                {/* Remarks */}
                                <Grid2 size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Remarks"
                                        value={remarks}
                                        onChange={(e) => {
                                            setRemarks(e.target.value)
                                        }}
                                    />
                                </Grid2>

                            </Grid2>
                        )
                    })()}

                </DialogContent>

                <DialogActions>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            setVerifyDialog(false);
                        }}
                    >
                        Close
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            dispatch(updateAttendanceStatus({
                                id: selectedAttendance.id,
                                type: 'verify',
                                remarks: remarks,
                                status: 'Rejected',
                                attendance_date: dayjs(selectedAttendance.attendance_date).format("YYYY-MM-DD"),
                                user_id: selectedAttendance.attendance_user_id
                            })).unwrap().then((res) => {
                                enqueueSnackbar('Rejected', { variant: 'success' });
                                setVerifyDialog(false);
                                dispatch(fetchEmployeeAttendanceList({ attendance_date: dayjs(new Date()).format("YYYY-MM-DD") })).unwrap().then((res: any) => {
                                    setAttendanceList(res?.list)
                                });
                            }).catch((err) => {
                                enqueueSnackbar('Unable to reject', { variant: 'error' });
                            })
                        }}
                    >
                        Reject
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            dispatch(updateAttendanceStatus({
                                id: selectedAttendance.id,
                                type: 'verify',
                                remarks: remarks,
                                status: 'Verified',
                                attendance_date: dayjs(selectedAttendance.attendance_date).format("YYYY-MM-DD"),
                                user_id: selectedAttendance.attendance_user_id
                            })).unwrap().then((res) => {
                                enqueueSnackbar('Verified', { variant: 'success' });
                                setVerifyDialog(false);
                                dispatch(fetchEmployeeAttendanceList({ attendance_date: dayjs(new Date()).format("YYYY-MM-DD") })).unwrap().then((res: any) => {
                                    setAttendanceList(res?.list)
                                });
                            }).catch((err) => {
                                enqueueSnackbar('Unable to verify', { variant: 'error' });
                            })
                        }}
                    >
                        Verify
                    </Button>

                </DialogActions>
            </Dialog>

            <Dialog
                open={detailsDialog}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") {
                        return
                    }

                    setDetailsDialog(false)
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Attendance Details
                </DialogTitle>

                <DialogContent>

                    {selectedAttendance && (() => {

                        const locationDetails = parseLocationDetails(
                            selectedAttendance.location_details
                        );

                        const breakList = parseBreakDetails(
                            selectedAttendance.break_details
                        );

                        return (
                            <Grid2 container spacing={2} sx={{ mt: 1 }}>

                                {/* Employee */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Employee Name
                                        </Typography>

                                        <Typography variant="body1">
                                            {selectedAttendance.emp_name}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Date */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Date
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatDate(selectedAttendance.attendance_date)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check In */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check In Time
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatTime(selectedAttendance.check_in_time)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check Out */}
                                <Grid2 size={{ xs: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check Out Time
                                        </Typography>

                                        <Typography variant="body1">
                                            {formatTime(selectedAttendance.check_out_time)}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check In Location */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check In Location
                                        </Typography>

                                        <Typography variant="body1">
                                            {locationDetails?.check_in_location || "-"}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Check Out Location */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Check Out Location
                                        </Typography>

                                        <Typography variant="body1">
                                            {locationDetails?.check_out_location || "-"}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                {/* Break Details */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mb: 1, fontWeight: 600 }}
                                    >
                                        Break Details
                                    </Typography>

                                    <TableContainer component={Paper}>
                                        <Table size="small">

                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Break In</TableCell>
                                                    <TableCell>Break Out</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {breakList.length > 0 ? (
                                                    breakList.map((br: any, index: number) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {formatTime(br.break_in)}
                                                            </TableCell>

                                                            <TableCell>
                                                                {formatTime(br.break_out)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={2}
                                                            align="center"
                                                        >
                                                            No Breaks
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>

                                        </Table>
                                    </TableContainer>
                                </Grid2>

                            </Grid2>
                        )
                    })()}

                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setDetailsDialog(false)
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
