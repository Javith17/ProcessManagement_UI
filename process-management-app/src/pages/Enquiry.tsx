import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, ButtonGroup, Card, FormControl, Grid2, Input, InputAdornment, InputLabel, Alert, TextField, CircularProgress, Pagination, RadioGroup, FormControlLabel, Radio, Typography, Autocomplete } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewEnquiry, createNewUser, fetchCustomers, fetchEnquiries, fetchRoles, fetchUsers, updateEnquiryStatus } from '../slices/adminSlice';
import AddNewIconButton from '../components/AddNewIconButton';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit } from 'react-icons/md';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { CustomTablePagination, nav_users, page_limit, TableRowStyled } from '../constants';
import RefreshButton from '../components/RefreshButton';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import dayjs, { Dayjs } from 'dayjs';
import { fetchMachineList } from '../slices/machineSlice';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { quotation_terms } from '../utils/Constants';

const statusColors: Record<string, "info" | "warning" | "error" | "success"> = {
    "Open": "info",
    "In Progress": "warning",
    "Rejected": "error",
    "Approved": "success",
};

export default function Enquiry() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const { enquiries, users, status, customers } = useAppSelector(
        (state) => state.admin
    );

    const { machines } = useAppSelector(
        (state) => state.machine
    );

    const [searchText, setSearchText] = React.useState("")
    const [createDialog, setCreateDialog] = React.useState(false)
    const [loadingDialog, setLoadingDialog] = React.useState(true)
    const [pageNo, setPageNo] = React.useState(1)
    const [statusFilter, setStatusFilter] = React.useState("In Progress");

    const [customerName, setCustomerName] = React.useState("")
    const [customerId, setCustomerId] = React.useState(null)
    const [machineName, setMachineName] = React.useState("")
    const [existingMachineId, setExistingMachineId] = React.useState("")
    const [contactNo, setContactNo] = React.useState("")
    const [gstNo, setGstNo] = React.useState("")
    const [addressLine, setAddressLine] = React.useState("")
    const [city, setCity] = React.useState("")
    const [state, setState] = React.useState("")
    const [pincode, setPincode] = React.useState("")
    const [resource, setResource] = React.useState("")
    const [technicalDiscussionUser, setTechnicalDiscussionUser] = React.useState("")
    const [remarks, setRemarks] = React.useState("")

    // Quotation preview captured at enquiry-creation time (mirrors the Approve dialog's
    // fields) so Save can chain straight through the Start flow instead of requiring a
    // separate manual "Start" step, and Save & Approve can chain all the way through.
    const [createQuotationDate, setCreateQuotationDate] = React.useState<Dayjs | null>(null)
    const [createReminderDays, setCreateReminderDays] = React.useState("")
    const [createCost, setCreateCost] = React.useState("")
    const [createQuantity, setCreateQuantity] = React.useState("")

    const [selectedId, setSelectedId] = React.useState("");

    const [openStartDialog, setOpenStartDialog] = React.useState(false);
    const [openRejectDialog, setOpenRejectDialog] = React.useState(false);
    const [openApproveDialog, setOpenApproveDialog] = React.useState(false);
    const [isExpand, setIsExpand] = React.useState(false)
    const [quotationTerms, setQuotationTerms] = React.useState<any>(quotation_terms);

    const [selectedRow, setSelectedRow] = React.useState<any>(null);

    const [followupUser, setFollowupUser] = React.useState("");

    const [approveForm, setApproveForm] = React.useState<{
        followupUser: string;
        quotationDate: Dayjs | null;
        reminderDays: string;
        cost: string;
        quantity: string;
    }>({
        followupUser: "",
        quotationDate: null,
        reminderDays: "",
        cost: "",
        quantity: ""
    });

    useEffect(() => {
        if (openApproveDialog) {
            if (selectedRow && selectedRow.level2_user) {
                // Pre-fill from the quotation details captured when the enquiry was created,
                // so the approver isn't re-typing what's already on file.
                const detail = selectedRow.approval_detail;
                setApproveForm({
                    ...approveForm,
                    followupUser: selectedRow.level2_user.id,
                    quotationDate: detail?.quotation_date ? dayjs(detail.quotation_date) : approveForm.quotationDate,
                    reminderDays: detail?.reminder_date ? String(Math.max(0, dayjs(detail.reminder_date).diff(dayjs(), 'day'))) : approveForm.reminderDays,
                    cost: detail?.cost != null ? String(detail.cost) : approveForm.cost,
                    quantity: detail?.quantity != null ? String(detail.quantity) : approveForm.quantity,
                });
                setQuotationTerms(selectedRow.quotation_terms);
            }
        }
    }, [openApproveDialog, selectedRow]);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchMachineList());
        dispatch(fetchCustomers());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: statusFilter })).unwrap()
    }, [statusFilter])

    const handleSearch = () => {
        dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: statusFilter, searchText: searchText })).unwrap();
    }

    const handleRefresh = () => {
        dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: statusFilter, searchText: searchText })).unwrap();
    }

    const handleEdit = (item: any) => {
        setCreateDialog(true);
        setSelectedId(item.id);
        setCustomerName(item.customer_name);
        setMachineName(item.machine_name);
        setExistingMachineId(item.existing_machine_id);
        setContactNo(item.contact_no);
        setGstNo(item.gst_no);
        setAddressLine(item.address?.address_1);
        setCity(item.address?.city);
        setState(item.address?.state);
        setPincode(item.address?.postal_code);
        setResource(item.enquiry_resource);
        setTechnicalDiscussionUser(item.technical_discussion_user?.id || "");
        setRemarks(item.remarks);
        setFollowupUser(item.level2_user?.id || "");
        setQuotationTerms(item.quotation_terms || quotation_terms);
        setCreateQuotationDate(item.approval_detail?.quotation_date ? dayjs(item.approval_detail.quotation_date) : null);
        setCreateCost(item.approval_detail?.cost != null ? String(item.approval_detail.cost) : "");
        setCreateQuantity(item.approval_detail?.quantity != null ? String(item.approval_detail.quantity) : "");
    };

    const handleStart = (item: any) => {
        setSelectedRow(item);
        setOpenStartDialog(true);
    }

    const handleStartSubmit = () => {
        dispatch(updateEnquiryStatus({
            enquiry_id: selectedRow?.id,
            status: 'Start',
            level2_user: followupUser
        })).unwrap()
            .then((res) => {
                setOpenStartDialog(false)
                DisplaySnackbar('Enquiry started successfully', 'success', enqueueSnackbar)
                setFollowupUser('');
                setSelectedRow(null);
                dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: 'Open' }))
            })
            .catch((err) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
    }

    const handleApprove = (item: any) => {
        setSelectedRow(item);
        setOpenApproveDialog(true);
    }

    const handleReject = (item: any) => {
        setSelectedRow(item);
        setOpenRejectDialog(true);
    }

    const handleRejectSubmit = () => {
        dispatch(updateEnquiryStatus({
            enquiry_id: selectedRow?.id,
            status: 'Reject',
            remarks: remarks
        })).unwrap()
            .then((res) => {
                setOpenRejectDialog(false)
                DisplaySnackbar('Enquiry rejected', 'success', enqueueSnackbar)
                setRemarks('');
                setSelectedRow(null);
                dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: 'In Progress' }))
            })
            .catch((err) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
    }

    const handleApproveSubmit = () => {
        const reminderDate = dayjs().add(Number(approveForm.reminderDays), 'day').format('YYYY-MM-DD');
        dispatch(updateEnquiryStatus({
            enquiry_id: selectedRow?.id,
            status: 'Approve',
            quotation_date: approveForm.quotationDate,
            reminder_date: reminderDate,
            cost: approveForm.cost,
            qty: approveForm.quantity,
            approved_by: JSON.parse(localStorage.getItem("userDetail") as string).user.userId,
            quotation_terms: quotationTerms
        })).unwrap()
            .then((res) => {
                setOpenApproveDialog(false)
                DisplaySnackbar('Enquiry Approved successfully', 'success', enqueueSnackbar)
                setApproveForm({
                    followupUser: "",
                    quotationDate: null,
                    reminderDays: "",
                    cost: "",
                    quantity: ""
                })
                setSelectedRow(null);
                dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: 'In Progress' }))
            })
            .catch((err) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
    }

    const handleSaveEnquiry = (approveNow: boolean = false) => {
        const reminderDate = createReminderDays ? dayjs().add(Number(createReminderDays), 'day').format('YYYY-MM-DD') : null;
        dispatch(createNewEnquiry({
            "customer_name": customerName,
            "machine_name": machineName,
            "existing_machine_id": existingMachineId,
            "existing_customer_id": customerId,
            "contact_no": contactNo,
            "address": {
                "address_1": addressLine,
                "city": city,
                "state": state,
                "postal_code": pincode
            },
            "gst_no": gstNo,
            "enquiry_resource": resource,
            "level1_user": JSON.parse(localStorage.getItem("userDetail") as string).user.userId,
            "technical_discussion_user": technicalDiscussionUser || null,
            "remarks": remarks,
            "quotation_date": createQuotationDate ? createQuotationDate.format('YYYY-MM-DD') : null,
            "reminder_date": reminderDate,
            "cost": createCost,
            "qty": createQuantity,
            "quotation_terms": quotationTerms
        })).unwrap().then((res: any) => {
            if (!res?.id) {
                throw new Error(res?.message || 'Unable to create enquiry');
            }
            if (selectedId) {
                // Editing an existing enquiry -- no status flow to chain.
                return;
            }
            return dispatch(updateEnquiryStatus({
                enquiry_id: res.id,
                status: 'Start',
                level2_user: followupUser
            })).unwrap().then(() => {
                if (approveNow) {
                    return dispatch(updateEnquiryStatus({
                        enquiry_id: res.id,
                        status: 'Approve',
                        quotation_date: createQuotationDate,
                        reminder_date: reminderDate,
                        cost: createCost,
                        qty: createQuantity,
                        approved_by: JSON.parse(localStorage.getItem("userDetail") as string).user.userId,
                        quotation_terms: quotationTerms
                    })).unwrap();
                }
            });
        }).then(() => {
            setCreateDialog(false)
            DisplaySnackbar(approveNow ? 'Enquiry created and approved successfully' : 'Enquiry created successfully', 'success', enqueueSnackbar)
            clearValues();
            dispatch(fetchEnquiries({ limit: page_limit, page: pageNo, status: statusFilter }))
        }).catch((err: any) => {
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
    }

    const clearValues = () => {
        setSelectedId("");
        setCustomerName("");
        setCustomerId(null);
        setMachineName("");
        setExistingMachineId("");
        setContactNo("");
        setGstNo("");
        setAddressLine("");
        setCity("");
        setState("");
        setPincode("");
        setResource("");
        setTechnicalDiscussionUser("");
        setRemarks("");
        setFollowupUser("");
        setCreateQuotationDate(null);
        setCreateReminderDays("");
        setCreateCost("");
        setCreateQuantity("");
        setQuotationTerms(quotation_terms);
    }
    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_users} />
            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
                <Grid2
                    size={12}
                    sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        gap: 2,
                        overflowX: 'auto',
                    }}
                >
                    <TextField
                        placeholder="Search enquiry"
                        variant="outlined"
                        size="small"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        sx={{ flex: '1 1 240px', minWidth: 150 }}
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

                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            alignItems: 'center',
                            gap: 2,
                            flexShrink: 0,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            size="small"
                            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                            onClick={() => {
                                clearValues();
                                setCreateDialog(true);
                            }}
                        >
                            Add New
                        </Button>

                        <ButtonGroup size="small" sx={{ flexWrap: 'nowrap' }}>
                            {["In Progress", "Rejected", "Approved"].map((s) => (
                                <Button
                                    key={s}
                                    color={statusColors[s]}
                                    variant={statusFilter === s ? "contained" : "outlined"}
                                    onClick={() => setStatusFilter(s)}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {s}
                                </Button>
                            ))}
                        </ButtonGroup>

                        <RefreshButton onClick={handleRefresh} />
                    </Box>
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>Machine Name</TableCell>
                                    <TableCell>Contact No</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Created By</TableCell>
                                    <TableCell align="center">Action</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {enquiries.list.length > 0 ? enquiries.list?.map((row) => (
                                    <TableRowStyled key={row.id}>
                                        <TableCell>{row.customer_name}</TableCell>
                                        <TableCell>{row.machine_name}</TableCell>
                                        <TableCell>{row.contact_no}</TableCell>
                                        <TableCell>{dayjs(row.createdAt).format("DD-MM-YYYY")}</TableCell>
                                        <TableCell>{row.level1_user?.emp_name}</TableCell>
                                        <TableCell align="center">
                                            {statusFilter === "Open" && (
                                                <Button
                                                    variant="contained"
                                                    sx={{ backgroundColor: "blue", '&:hover': { backgroundColor: "darkblue" } }}
                                                    onClick={() => handleStart(row)}
                                                >
                                                    Start
                                                </Button>
                                            )}

                                            {statusFilter === "In Progress" && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        sx={{ backgroundColor: "green", mr: 1, '&:hover': { backgroundColor: "darkgreen" } }}
                                                        onClick={() => handleApprove(row)}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        variant="contained"
                                                        sx={{ backgroundColor: "red", '&:hover': { backgroundColor: "darkred" } }}
                                                        onClick={() => handleReject(row)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <MdOutlineEdit onClick={() => handleEdit(row)} />
                                        </TableCell>
                                    </TableRowStyled>
                                )) : <TableRow key={0}>
                                    <TableCell colSpan={7} align='center'>No Data</TableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Pagination count={Math.ceil(enquiries.count / page_limit)} shape="rounded" sx={{
                        '& > .MuiPagination-ul': {
                            justifyContent: 'center',
                        }, mt: 2
                    }} onChange={(e: any, value: number) => {
                        dispatch(fetchUsers({ limit: page_limit, page: value }))
                    }} />

                </Grid2>
            </Grid2>

            <Dialog maxWidth="md" fullWidth open={createDialog}>
                <DialogTitle>
                    {selectedId ? "Update Enquiry" : "Create Enquiry"}
                </DialogTitle>

                <DialogContent>
                    <Grid2 container spacing={2} marginTop={2}>

                        {/* CUSTOMER NAME (INPUT OR DROPDOWN) */}
                        {/* <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </Grid2> */}
                        <Grid2 size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                <Autocomplete
                                    fullWidth
                                    freeSolo
                                    options={customers.list || []}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option.customer_name
                                    }
                                    value={customerName}
                                    onChange={(event, newValue) => {
                                        if (typeof newValue === "string") {
                                            // User typed manually
                                            setCustomerName(newValue);
                                            setCustomerId(null);
                                        } else if (newValue && newValue.inputValue) {
                                            // (optional case if using create option)
                                            setCustomerName(newValue.inputValue);
                                            setCustomerId(null);
                                        } else {
                                            // User selected from dropdown
                                            setCustomerName(newValue?.customer_name || "");
                                            setCustomerId(newValue?.id || null);
                                            setGstNo(newValue?.customer_gst);
                                            setContactNo(newValue?.customer_mobile_no1);
                                            setAddressLine(newValue?.customer_address1);
                                            setCity(newValue?.customer_city);
                                            setState(newValue?.customer_state);
                                            setPincode(newValue?.customer_pincode);
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setCustomerName(newInputValue);
                                        setCustomerId(null); // typing = not existing
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Customer Name" fullWidth />
                                    )}
                                />
                                <AddNewIconButton title="Add new customer" onClick={() => navigate('/customers/newCustomer')} />
                            </Box>
                        </Grid2>


                        {/* MACHINE NAME */}
                        <Grid2 size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Machine</InputLabel>
                                    <Select
                                        value={machineName}
                                        label="Machine"
                                        onChange={(e) => {
                                            setMachineName(e.target.value);
                                            const selectedMachine = machines.find(m => m.machine_name === e.target.value);
                                            setExistingMachineId(selectedMachine.id);
                                        }}
                                    >
                                        {machines?.map((m) => (
                                            <MenuItem key={m.id} value={m.machine_name}>
                                                {m.machine_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <AddNewIconButton title="Add new machine" onClick={() => navigate('/machines', { state: { openCreate: true } })} />
                            </Box>
                        </Grid2>

                        {/* CONTACT */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                value={contactNo}
                                disabled={customerId ? true : false}
                                onChange={(e) => setContactNo(e.target.value)}
                            />
                        </Grid2>

                        {/* GST */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="GST No"
                                value={gstNo}
                                disabled={customerId ? true : false}
                                onChange={(e) => setGstNo(e.target.value)}
                            />
                        </Grid2>


                        {/* ADDRESS SECTION */}
                        <Grid2 size={12}>
                            <Typography variant="h6">Address</Typography>
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                value={addressLine}
                                disabled={customerId ? true : false}
                                onChange={(e) => setAddressLine(e.target.value)}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={city}
                                disabled={customerId ? true : false}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="State"
                                value={state}
                                disabled={customerId ? true : false}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                value={pincode}
                                disabled={customerId ? true : false}
                                onChange={(e) => setPincode(e.target.value)}
                            />
                        </Grid2>

                        {/* ENQUIRY RESOURCE */}
                        <Grid2 size={6}>
                            <FormControl fullWidth>
                                <InputLabel>Enquiry Resource</InputLabel>
                                <Select
                                    value={resource}
                                    label="Enquiry Resource"
                                    onChange={(e) => setResource(e.target.value)}
                                >
                                    {["Indiamart", "Ad", "Call"].map((r) => (
                                        <MenuItem key={r} value={r}>{r}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>

                        {/* TECHNICAL DISCUSSION BY */}
                        <Grid2 size={6}>
                            <FormControl fullWidth>
                                <InputLabel>Technical Discussion By</InputLabel>
                                <Select
                                    value={technicalDiscussionUser}
                                    label="Technical Discussion By"
                                    onChange={(e) => setTechnicalDiscussionUser(e.target.value)}
                                >
                                    {users.list.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.emp_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>

                        {/* REMARKS */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </Grid2>

                        {/* QUOTATION DETAILS */}
                        <Grid2 size={12}>
                            <Typography variant="h6">Quotation Details</Typography>
                        </Grid2>

                        {/* FOLLOW UP USER */}
                        <Grid2 size={6}>
                            <FormControl fullWidth>
                                <InputLabel>Follow up User</InputLabel>
                                <Select
                                    value={followupUser}
                                    label="Follow up User"
                                    onChange={(e) => setFollowupUser(e.target.value)}
                                >
                                    {users.list.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.emp_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>

                        {/* QUOTATION DATE */}
                        <Grid2 size={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Quotation Date"
                                    sx={{ width: '100%' }}
                                    value={dayjs(createQuotationDate)}
                                    onChange={(e: any) => setCreateQuotationDate(e)}
                                    slotProps={{
                                        textField: { fullWidth: true }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid2>

                        {/* REMINDER DAYS */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Reminder Days"
                                value={createReminderDays}
                                onChange={(e) => setCreateReminderDays(e.target.value)}
                            />
                        </Grid2>

                        {/* COST */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Cost"
                                value={createCost}
                                onChange={(e) => setCreateCost(e.target.value)}
                            />
                        </Grid2>

                        {/* QUANTITY */}
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={createQuantity}
                                onChange={(e) => setCreateQuantity(e.target.value)}
                            />
                        </Grid2>

                    </Grid2>

                    <div style={{
                        display: 'flex', flexDirection: 'row',
                        marginTop: '10px', color: 'blue', cursor: 'pointer'
                    }} onClick={() => {
                        setIsExpand(!isExpand)
                    }}>
                        <p><u>Terms and Conditions</u></p>
                        {isExpand ? <IoIosArrowUp style={{ marginLeft: '5px', marginTop: '5px' }} /> :
                            <IoIosArrowDown style={{ marginLeft: '5px', marginTop: '5px' }} />}
                    </div>

                    {isExpand && quotationTerms?.map((term: string, index: number) => {
                        return <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            multiline
                            name="remarks"
                            onChange={(e: any) => {
                                setQuotationTerms([
                                    ...quotationTerms.slice(0, index),
                                    e.target.value,
                                    ...quotationTerms.slice(index + 1)
                                ])
                            }}
                            value={term}
                            sx={{ mt: 1 }}
                        />
                    })}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
                    <Button onClick={() => handleSaveEnquiry(false)} variant="contained">
                        {selectedId ? "Update" : "Save"}
                    </Button>
                    {!selectedId && (
                        <Button onClick={() => handleSaveEnquiry(true)} variant="contained" color="success">
                            Save &amp; Approve
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Start Dialog */}
            <Dialog open={openStartDialog} onClose={() => setOpenStartDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Start Enquiry</DialogTitle>

                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Followup User</InputLabel>
                        <Select
                            value={followupUser}
                            label="Followup User"
                            onChange={(e) => setFollowupUser(e.target.value)}
                        >
                            {users.list.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.emp_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenStartDialog(false)}>Cancel</Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStartSubmit}
                    >
                        Start
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Reject Dialog */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Reject Enquiry</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRejectSubmit}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
                open={openApproveDialog}
                onClose={() => setOpenApproveDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Approve Enquiry</DialogTitle>

                <DialogContent>
                    <Grid2 container spacing={2} sx={{ mt: 1 }}>

                        {/* Customer Name */}
                        <Grid2 size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Customer Name"
                                value={selectedRow?.customer_name || ""}
                                disabled
                            />
                        </Grid2>

                        {/* Machine Name */}
                        <Grid2 size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Machine Name"
                                value={selectedRow?.machine_name || ""}
                                disabled
                            />
                        </Grid2>

                        {/* Followup User */}
                        <Grid2 size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Followup User</InputLabel>
                                <Select
                                    value={approveForm.followupUser}
                                    label="Followup User"
                                    onChange={(e) =>
                                        setApproveForm({ ...approveForm, followupUser: e.target.value })
                                    }
                                >
                                    {users.list.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.emp_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>

                        {/* Quotation Date */}
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Quotation Date"
                                    sx={{ mt: 2, width: '100%' }}
                                    value={dayjs(approveForm.quotationDate)}
                                    onChange={(e: any) => {
                                        setApproveForm({ ...approveForm, quotationDate: e })
                                    }}
                                    slotProps={{
                                        textField: { fullWidth: true }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid2>

                        {/* Reminder Days */}
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                sx={{ mt: 2 }}
                                type="number"
                                label="Reminder Days"
                                value={approveForm.reminderDays}
                                onChange={(e) =>
                                    setApproveForm({ ...approveForm, reminderDays: e.target.value })
                                }
                            />
                        </Grid2>

                        {/* Cost */}
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Cost"
                                value={approveForm.cost}
                                onChange={(e) =>
                                    setApproveForm({ ...approveForm, cost: e.target.value })
                                }
                            />
                        </Grid2>

                        {/* Quantity */}
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={approveForm.quantity}
                                onChange={(e) =>
                                    setApproveForm({ ...approveForm, quantity: e.target.value })
                                }
                            />
                        </Grid2>

                    </Grid2>

                    <div style={{
                        display: 'flex', flexDirection: 'row',
                        marginTop: '10px', color: 'blue', cursor: 'pointer'
                    }} onClick={() => {
                        setIsExpand(!isExpand)
                    }}>
                        <p><u>Terms and Conditions</u></p>
                        {isExpand ? <IoIosArrowUp style={{ marginLeft: '5px', marginTop: '5px' }} /> :
                            <IoIosArrowDown style={{ marginLeft: '5px', marginTop: '5px' }} />}
                    </div>

                    {isExpand && quotationTerms?.map((term: string, index: number) => {
                        return <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            multiline
                            name="remarks"
                            onChange={(e: any) => {
                                setQuotationTerms([
                                    ...quotationTerms.slice(0, index),
                                    e.target.value,
                                    ...quotationTerms.slice(index + 1)
                                ])
                            }}
                            value={term}
                            sx={{ mt: 1 }}
                        />
                    })}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveSubmit}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog maxWidth={'md'}
                open={status.includes('loading')}>
                <CircularProgress color='success' sx={{ m: 3 }} />
                {/* <img src={loader} /> */}
            </Dialog>

        </Box>
    );
}
