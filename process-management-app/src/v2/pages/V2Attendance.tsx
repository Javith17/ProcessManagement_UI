import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Button, Grid2, Paper, TextField, Typography } from '@mui/material';
import { useAppDispatch } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchEmployeeAttendanceList, updateAttendanceStatus } from '../../slices/adminSlice';
// Add imports
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Attendance.tsx. Known bugs reproduced verbatim:
// - pageNo/setPageNo and searchText/Search-icon state exist but are fully
//   dead: no Pagination control and no search TextField are rendered at
//   all, only the DatePicker + Refresh button drive the list
// - "View Location" only ever uses location_details.check_in_location for
//   the Google Maps link, even though check_out_location also exists
// - both the Verify dialog's Reject and Verify actions refetch the list for
//   TODAY (dayjs(new Date())) regardless of the page's own selectedDate
//   DatePicker, so acting while viewing a past date silently reverts the
//   visible list back to today
export default function V2Attendance() {
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
        dispatch(fetchEmployeeAttendanceList({
            attendance_date:
                dayjs(selectedDate ? selectedDate : new Date()).format("YYYY-MM-DD")
        })).unwrap().then((res: any) => {
            setAttendanceList(res?.list)
        })
    }, [dispatch, selectedDate])

    const handleSearch = () => {
        // dispatch(fetchPartsInStores({ searchText })).unwrap()
    }

    const handleRefresh = () => {
        dispatch(fetchEmployeeAttendanceList({
            attendance_date:
                dayjs(selectedDate ? selectedDate : new Date()).format("YYYY-MM-DD")
        })).unwrap().then((res: any) => {
            setAttendanceList(res?.list)
        })
    }

    return (
        <V2PageShell currentPage="attendance">
            <Grid2 container spacing={2}>
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
                    <RefreshButton onClick={handleRefresh} />
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
                        <Table sx={{
                            '& .MuiTableCell-head': {
                                lineHeight: 0.8,
                                backgroundColor: v2Colors.primaryTint,
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
                                        <V2TableRowStyled key={row.id}>

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
                open={verifyDialog}
                onClose={() => setVerifyDialog(false)}
                title="Verify Attendance"
                actions={<>
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
                </>}
            >
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

            </V2Drawer>

            <V2Drawer
                open={detailsDialog}
                onClose={() => setDetailsDialog(false)}
                title="Attendance Details"
                actions={<>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setDetailsDialog(false)
                        }}
                    >
                        Close
                    </Button>
                </>}
            >

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

            </V2Drawer>
        </V2PageShell>
    );
}
