import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, Alert, Tabs, Tab, InputLabel, FormHelperText, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewProcess, fetchCustomers, fetchProcessList, fetchRoles, fetchSuppliers, fetchUsers, fetchVendors } from '../slices/adminSlice';
import { Add, ClosedCaptionDisabled, CloseSharp, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { errorTextColor, nav_process, nav_quotations, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { DatePicker } from '@mui/x-date-pickers';
import { useReactToPrint } from "react-to-print";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fetchBoughtOutList, fetchMachineList, fetchPartDetail, fetchPartsList, getMachineDetails } from '../slices/machineSlice';
import { approveRejectQuotation, createMachineQuotation, createSparesQuotation, createSupplierQuotation, createVendorQuotation, deleteQuotation, fetchMachineQuotationList, fetchQuotationDoc, fetchSparesQuotationList, fetchSupplierQuotationList, fetchVendorQuotationList } from '../slices/quotationSlice';
import dayjs from 'dayjs';
import { MdDeleteOutline } from "react-icons/md";
import moment from 'moment';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { quotation_terms } from '../utils/Constants';
import { MdLocalPrintshop } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";

export default function Quotations() {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const { machines, parts, boughtOuts } = useAppSelector(
        (state) => state.machine
    );
    const { customers, users, vendors, suppliers } = useAppSelector(
        (state) => state.admin
    );
    const { machineQuotationList, vendorQuotationList, supplierQuotationList, sparesQuotationList } = useAppSelector(
        (state) => state.quotation
    );

    const [searchText, setSearchText] = React.useState("")
    const [createDialog, setCreateDialog] = React.useState(false)
    const [spareDialog, setSpareDialog] = React.useState(false)
    const [vendorQDialog, setVendorQDialog] = React.useState(false)
    const [supplierQDialog, setSupplierQDialog] = React.useState(false)
    const [approveDialog, setApproveDialog] = React.useState(false)
    const [processName, setProcessName] = React.useState("")
    const [currentTab, setCurrentTab] = React.useState(0)
    const [errors, setErrors] = React.useState<any>({})
    const [isNew, setIsNew] = React.useState(false)
    const [isApprove, setIsApprove] = React.useState(false)
    const [partProcessList, setPartProcessList] = React.useState<any[]>([])
    const [quotationTerms, setQuotationTerms] = React.useState(quotation_terms)
    const [isExpand, setIsExpand] = React.useState(false)
    const [machineSpares, setMachineSpares] = React.useState<any[]>([])
    const [spareParts, setSpareParts] = React.useState<Array<{
        id: number, spare_id: number, spare_name: string, spare_type: string,
        spare_qty: number, spare_cost: number
    }>>([])
    const [quotationDoc, setQuotatioinDoc] = React.useState({
        dialog: false,
        html: ''
    })
    const [selectedMachine, setSelectedMachine] = React.useState<{
        machine_id?: string,
        min_spindles?: number,
        max_spindles?: number,
        spindles?: number
    }>({})

    const [deleteDialog, setDeleteDialog] = React.useState({
        type: '',
        dialog: false,
        id: '',
        no: ''
    })

    const [formData, setFormData] = React.useState({
        quotation_id: '',
        quotation_no: '',
        quotation_date: '',
        machine_id: '',
        machine_name: '',
        customer_id: '',
        customer_name: '',
        reminder_date: '',
        user_id: '',
        user_name: '',
        cost: '',
        qty: '',
        remarks: '',
        type: ''
    });

    const [sparesFormData, setSparesFormData] = React.useState({
        quotation_id: '',
        quotation_no: '',
        quotation_date: '',
        spares: [],
        customer_id: '',
        machine_id: '',
        customer_name: '',
        reminder_date: '',
        user_id: '',
        user_name: '',
        cost: '',
        qty: '',
        remarks: '',
        type: ''
    });

    const [vendorFormData, setVendorFormData] = React.useState({
        quotation_id: '',
        quotation_no: '',
        quotation_date: '',
        vendor_id: '',
        part_id: '',
        remarks: '',
        approvalRemarks: ''
    })

    const [supplierFormData, setSupplierFormData] = React.useState({
        quotation_id: '',
        quotation_no: '',
        quotation_date: '',
        supplier_id: '',
        bought_out_id: '',
        remarks: '',
        approvalRemarks: '',
        cost: 0,
        delivery_time: 0
    })

    const [approveData, setApproveData] = React.useState({
        quotation_id: '',
        remarks: '',
        cost: ''
    });

    const contentRef = React.useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(() => {
        dispatch(fetchMachineList()).unwrap()
        dispatch(fetchCustomers()).unwrap()
        dispatch(fetchMachineQuotationList()).unwrap()
        dispatch(fetchUsers())
        dispatch(fetchVendors())
        dispatch(fetchSuppliers())
        dispatch(fetchBoughtOutList())
        dispatch(fetchPartsList())
    }, [dispatch])

    useEffect(() => {
        if (selectedMachine.machine_id) {
            dispatch(getMachineDetails(selectedMachine.machine_id)).unwrap().then((res: any) => {
                const spares: any[] = []
                res.main_assembly.map((main: any) => {
                    main.main_assembly_detail.map((md: any) => {
                        if (md.part) {
                            if (spares.filter((p: any) => p.id == md.part.id)?.length == 0) {
                                spares.push({
                                    type: 'part',
                                    id: md.part.id,
                                    name: md.part.part_name
                                })
                            }
                        } else if (md.bought_out) {
                            if (spares.filter((p: any) => p.id == md.bought_out.id)?.length == 0) {
                                spares.push({
                                    type: 'bought_out',
                                    id: md.bought_out.id,
                                    name: md.bought_out.bought_out_name
                                })
                            }
                        } else if (md.sub_assembly) {
                            if (spares.filter((p: any) => p.id == md.sub_assembly.id)?.length == 0) {
                                spares.push({
                                    type: 'sub_assembly',
                                    id: md.sub_assembly.id,
                                    name: md.sub_assembly.sub_assembly_name
                                })
                            }
                        }
                    })
                })
                res.section_assembly.map((section: any) => {
                    section.section_assembly_detail.map((md: any) => {
                        if (md.part) {
                            if (spares.filter((p: any) => p.id == md.part.id)?.length == 0) {
                                spares.push({
                                    type: 'part',
                                    id: md.part.id,
                                    name: md.part.part_name
                                })
                            }
                        } else if (md.bought_out) {
                            if (spares.filter((p: any) => p.id == md.bought_out.id)?.length == 0) {
                                spares.push({
                                    type: 'bought_out',
                                    id: md.bought_out.id,
                                    name: md.bought_out.bought_out_name
                                })
                            }
                        } else if (md.sub_assembly) {
                            if (spares.filter((p: any) => p.id == md.sub_assembly.id)?.length == 0) {
                                spares.push({
                                    type: 'sub_assembly',
                                    id: md.sub_assembly.id,
                                    name: md.sub_assembly.sub_assembly_name
                                })
                            }
                        } else if (md.main_assembly) {
                            if (spares.filter((p: any) => p.id == md.main_assembly.id)?.length == 0) {
                                spares.push({
                                    type: 'main_assembly',
                                    id: md.main_assembly.id,
                                    name: md.main_assembly.main_assembly_name
                                })
                            }
                        }
                    })
                })
                setMachineSpares(spares)
            })
        }
    }, [selectedMachine])

    const handleSearch = () => {

    }

    const clearValues = () => {
        setFormData({
            quotation_id: '',
            quotation_no: '',
            quotation_date: '',
            machine_id: '',
            machine_name: '',
            customer_id: '',
            customer_name: '',
            reminder_date: '',
            qty: '',
            user_id: '',
            user_name: '',
            cost: '',
            remarks: '',
            type: ''
        })
        setSparesFormData({
            quotation_id: '',
            quotation_no: '',
            quotation_date: '',
            spares: [],
            customer_id: '',
            machine_id: '',
            customer_name: '',
            reminder_date: '',
            qty: '',
            user_id: '',
            user_name: '',
            cost: '',
            remarks: '',
            type: ''
        })
        setApproveData({
            quotation_id: '',
            remarks: '',
            cost: ''
        })
        setVendorFormData({
            quotation_id: '',
            quotation_no: '',
            quotation_date: '',
            vendor_id: '',
            part_id: '',
            remarks: '',
            approvalRemarks: ''
        })
        setPartProcessList([])
        setSupplierFormData({
            quotation_id: '',
            quotation_no: '',
            quotation_date: '',
            supplier_id: '',
            bought_out_id: '',
            remarks: '',
            approvalRemarks: '',
            cost: 0,
            delivery_time: 0
        })
        setDeleteDialog({
            type: '',
            dialog: false,
            id: '',
            no: ''
        })
    }

    const validate = () => {
        setErrors({})
        const newErrors: any = {}
        if (!formData.quotation_date || formData.quotation_date?.toString().trim().length == 0) newErrors.quotation_date = 'Quotation Date is required'
        if (!formData.qty || formData.qty?.toString().trim().length == 0) newErrors.qty = 'Qty is required'
        if (!formData.reminder_date || formData.reminder_date?.toString().trim().length == 0) newErrors.reminder_date = 'Reminder Date is required'
        if (!formData.machine_id) newErrors.machine_id = 'Select Machine'
        if (!formData.customer_id) newErrors.customer_id = 'Select Customer'
        if (!formData.user_id) newErrors.user_id = 'Select Followup user'
        if (!formData.cost || formData.cost?.trim().length == 0) newErrors.qty = 'Cost is required'
        return newErrors
    }

    const handleApproveReject = (status: string, type: string) => {
        dispatch(approveRejectQuotation({
            status: status,
            approval_reject_remarks: type.includes('machine') ? approveData?.remarks : type.includes('vendor') ? vendorFormData.approvalRemarks : supplierFormData.approvalRemarks,
            approved_cost: type.includes('machine') ? approveData?.cost : '',
            quotation_id: type.includes('machine') ? approveData?.quotation_id : type.includes('vendor') ? vendorFormData.quotation_id : supplierFormData.quotation_id,
            quotation_type: type
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.includes('success')) {
                setApproveDialog(false)
                setIsApprove(false)
                setVendorQDialog(false)
                setSupplierQDialog(false)
                clearValues()
                if (type.includes('machine')) {
                    dispatch(fetchMachineQuotationList())
                } else if (type.includes('vendor')) {
                    dispatch(fetchVendorQuotationList())
                } else {
                    dispatch(fetchSupplierQuotationList())
                }
            }
        }).catch((err: any) => {
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
    }

    const handleNewVendorQuotation = () => {
        setErrors({})
        const newErrors: any = {}
        if (!vendorFormData.part_id || vendorFormData.part_id.length == 0) newErrors.part_id = 'Select part'
        if (!vendorFormData.vendor_id || vendorFormData.vendor_id.length == 0) newErrors.vendor_id = 'Select vendor'

        if (Object.keys(newErrors).length == 0) {
            if (partProcessList.filter((pp: any) => pp.cost == 0 || pp.delivery_time == 0).length > 0) {
                DisplaySnackbar('Enter valid cost/ delivery time', 'error', enqueueSnackbar)
            }
            const data: any = {
                quotation_id: isNew ? '' : vendorFormData.quotation_id,
                quotation_date: vendorFormData.quotation_date,
                vendor_id: vendorFormData.vendor_id,
                part_id: vendorFormData.part_id,
                remarks: vendorFormData.remarks,
                type: isNew ? 'Add' : 'Update',
                process_list: partProcessList
            }
            dispatch(createVendorQuotation(data)).unwrap().then((res: any) => {
                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                if (res.includes('success')) {
                    setIsNew(false)
                    setVendorQDialog(false)
                    clearValues()
                    setErrors({})
                    dispatch(fetchVendorQuotationList())
                }
            }).catch((err: any) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
        } else {
            setErrors(newErrors)
        }

    }

    const handleNewSupplierQuotation = () => {
        setErrors({})
        const newErrors: any = {}
        if (!supplierFormData.supplier_id || supplierFormData.supplier_id.length == 0) newErrors.part_id = 'Select Supplier'
        if (!supplierFormData.bought_out_id || supplierFormData.bought_out_id.length == 0) newErrors.vendor_id = 'Select Boughtout'
        if (!supplierFormData.cost || supplierFormData.cost.toString().length == 0 || supplierFormData.cost == 0) newErrors.part_id = 'Enter cost'
        if (!supplierFormData.cost || supplierFormData.delivery_time.toString().length == 0 || supplierFormData.delivery_time == 0) newErrors.vendor_id = 'Enter delivery time'

        if (Object.keys(newErrors).length == 0) {
            const data: any = {
                quotation_id: isNew ? '' : supplierFormData.quotation_id,
                quotation_date: supplierFormData.quotation_date,
                supplier_id: supplierFormData.supplier_id,
                bought_out_id: supplierFormData.bought_out_id,
                remarks: supplierFormData.remarks,
                type: isNew ? 'Add' : 'Update',
                cost: supplierFormData.cost,
                delivery_time: supplierFormData.delivery_time
            }
            dispatch(createSupplierQuotation(data)).unwrap().then((res: any) => {
                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                if (res.includes('success')) {
                    setIsNew(false)
                    setSupplierQDialog(false)
                    clearValues()
                    setErrors({})
                    dispatch(fetchSupplierQuotationList())
                }
            }).catch((err: any) => {
                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
        } else {
            setErrors(newErrors)
        }
    }

    const handleNewMachineQuotation = () => {
        const validated = validate()
        if (Object.keys(validated).length == 0) {
            if (formData.quotation_id.length == 0) {
                dispatch(createMachineQuotation({
                    quotation_date: formData.quotation_date,
                    reminder_date: formData.reminder_date,
                    qty: formData.qty,
                    machine_id: formData.machine_id,
                    customer_id: formData.customer_id,
                    user_id: formData.user_id,
                    cost: formData.cost,
                    remarks: formData.remarks,
                    quotation_terms: quotationTerms,
                    type: 'Add'
                })).unwrap().then((res: any) => {
                    DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                    if (res.includes('success')) {
                        setCreateDialog(false)
                        clearValues()
                        dispatch(fetchMachineQuotationList())
                        setQuotationTerms(quotation_terms)
                    }
                }).catch((err: any) => {
                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                })
            } else {
                dispatch(createMachineQuotation({
                    quotation_id: formData.quotation_id,
                    quotation_date: formData.quotation_date,
                    reminder_date: formData.reminder_date,
                    qty: formData.qty,
                    machine_id: formData.machine_id,
                    customer_id: formData.customer_id,
                    user_id: formData.user_id,
                    cost: formData.cost,
                    remarks: formData.remarks,
                    quotation_terms: quotationTerms,
                    type: 'Update'
                })).unwrap().then((res: any) => {
                    DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                    if (res.includes('success')) {
                        setQuotationTerms(quotation_terms)
                        setCreateDialog(false)
                        clearValues()
                        dispatch(fetchMachineQuotationList())
                    }
                }).catch((err: any) => {
                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                })
            }
        } else {
            setErrors(validated)
        }
    }

    const handleNewSparesQuotation = () => {
        setErrors({})
        const newErrors: any = {}
        if (!sparesFormData.quotation_date || sparesFormData.quotation_date?.toString().trim().length == 0) newErrors.quotation_date = 'Quotation Date is required'
        if (!sparesFormData.reminder_date || sparesFormData.reminder_date?.toString().trim().length == 0) newErrors.reminder_date = 'Reminder Date is required'
        if (!sparesFormData.customer_id) newErrors.customer_id = 'Select Customer'
        if (!sparesFormData.user_id) newErrors.user_id = 'Select Followup user'
        console.log("01110--", newErrors)
        if (Object.keys(newErrors).length == 0) {
            if (spareParts.length == 0){
                DisplaySnackbar('Add any one item', 'error', enqueueSnackbar)
            }else{
                console.log("0000--")
                if (sparesFormData.quotation_id.length == 0) {
                    dispatch(createSparesQuotation({
                        quotation_date: sparesFormData.quotation_date,
                        reminder_date: sparesFormData.reminder_date,
                        qty: sparesFormData.qty,
                        spares: spareParts,
                        customer_id: sparesFormData.customer_id,
                        user_id: sparesFormData.user_id,
                        cost: sparesFormData.cost,
                        remarks: sparesFormData.remarks,
                        quotation_terms: quotationTerms,
                        type: 'Add'
                    })).unwrap().then((res: any) => {
                        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                        // if (res.includes('success')) {
                        //     setCreateDialog(false)
                        //     clearValues()
                        //     dispatch(fetchMachineQuotationList())
                        //     setQuotationTerms(quotation_terms)
                        // }
                    }).catch((err: any) => {
                        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                    })
                } else {
                    // dispatch(createMachineQuotation({
                    //     quotation_id: formData.quotation_id,
                    //     quotation_date: formData.quotation_date,
                    //     reminder_date: formData.reminder_date,
                    //     qty: formData.qty,
                    //     machine_id: formData.machine_id,
                    //     customer_id: formData.customer_id,
                    //     user_id: formData.user_id,
                    //     cost: formData.cost,
                    //     remarks: formData.remarks,
                    //     quotation_terms: quotationTerms,
                    //     type: 'Update'
                    // })).unwrap().then((res: any) => {
                    //     DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                    //     if (res.includes('success')) {
                    //         setQuotationTerms(quotation_terms)
                    //         setCreateDialog(false)
                    //         clearValues()
                    //         dispatch(fetchMachineQuotationList())
                    //     }
                    // }).catch((err: any) => {
                    //     DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                    // })
                }
            }            
        }else{
            setErrors(newErrors)
        }
    }

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_quotations} />

            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
                <Grid2 size={{ xs: 6, md: 8 }}>
                    <TextField
                        placeholder='Search quotation'
                        variant="outlined"
                        size='small'
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value)
                        }}
                        onKeyDown={(ev) => {
                            if (ev.key == "Enter") {
                                handleSearch()
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
                    <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
                        if (currentTab == 2) {
                            //vendor
                            setVendorQDialog(true)
                        } else if (currentTab == 3) {
                            setSupplierQDialog(true)
                        } else if (currentTab == 1) {
                            setSpareDialog(true)
                        } else {
                            setCreateDialog(true)
                        }
                        setErrors({})
                        clearValues()
                        setIsNew(true)
                        setQuotationTerms(quotation_terms)
                    }}>
                        Add New
                    </Button>
                </Grid2>

                <Grid2 size={12}>
                    <Tabs value={currentTab} onChange={(e, newValue) => {
                        setCurrentTab(newValue)
                        if (newValue == 2) {
                            dispatch(fetchVendorQuotationList()).unwrap()
                        } else if (newValue == 3) {
                            dispatch(fetchSupplierQuotationList()).unwrap()
                        } else if(newValue == 1) {
                            dispatch(fetchSparesQuotationList()).unwrap()
                        }
                    }} variant='fullWidth'>
                        <Tab label="Machine" value={0} />
                        <Tab label="Spares" value={1} />
                        <Tab label="Vendor" value={2} />
                        <Tab label="Supplier" value={3} />
                    </Tabs>
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    {(currentTab == 0) &&
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Qoutation No</TableCell>
                                        <TableCell>Quotation Date</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Reminder Date</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Cost</TableCell>
                                        <TableCell>Followup User</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {machineQuotationList.length > 0 ? machineQuotationList.map((quotation: any) => (
                                        <TableRowStyled key={quotation.id}>
                                            <TableCell>{quotation.quotation_no}</TableCell>
                                            <TableCell>{moment(quotation.quotation_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.customer.customer_name}</TableCell>
                                            <TableCell>{quotation.machine.machine_name}</TableCell>
                                            <TableCell>{moment(quotation.reminder_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.qty}</TableCell>
                                            <TableCell>{quotation.initial_cost}</TableCell>
                                            <TableCell>{quotation.user?.emp_name}</TableCell>
                                            <TableCell>
                                                {(quotation.status.includes('Pending Approval') || quotation.status.includes('Pending Verification')) ?
                                                    <Card sx={{ bgcolor: quotation.status.includes('Pending Approval') ? '#006BFF' : '#bb0037', color: 'white', p: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                                        setFormData({
                                                            quotation_id: quotation.id,
                                                            quotation_no: quotation.quotation_no,
                                                            quotation_date: quotation.quotation_date,
                                                            machine_id: quotation.machine.id,
                                                            machine_name: quotation.machine.machine_name,
                                                            customer_id: quotation.customer.id,
                                                            customer_name: quotation.customer.customer_name,
                                                            reminder_date: quotation.reminder_date,
                                                            qty: quotation.qty,
                                                            user_id: quotation.user?.id,
                                                            cost: quotation.initial_cost,
                                                            user_name: quotation.user?.emp_name,
                                                            remarks: quotation.remarks,
                                                            type: quotation.status
                                                        })
                                                        setApproveData({
                                                            quotation_id: quotation.id,
                                                            remarks: '',
                                                            cost: quotation.approved_cost
                                                        })
                                                        setApproveDialog(true)
                                                    }}>{quotation.status}</Card>
                                                    : quotation.status.includes('Approved') ?
                                                        <Card sx={{ bgcolor: 'green', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card> :
                                                        <Card sx={{ bgcolor: '#bb0037', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card>}
                                            </TableCell>
                                            {quotation.status.includes('Pending Verification') ? <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                                                setIsNew(false)
                                                setCreateDialog(true)
                                                setQuotationTerms(quotation.quotation_terms)
                                                setFormData({
                                                    quotation_id: quotation.id,
                                                    quotation_no: quotation.quotation_no,
                                                    quotation_date: quotation.quotation_date,
                                                    machine_id: quotation.machine.id,
                                                    machine_name: quotation.machine.machine_name,
                                                    customer_id: quotation.customer.id,
                                                    customer_name: quotation.customer.customer_name,
                                                    reminder_date: quotation.reminder_date,
                                                    qty: quotation.qty,
                                                    user_id: quotation.user?.id,
                                                    cost: quotation.initial_cost,
                                                    user_name: quotation.user?.emp_name,
                                                    remarks: quotation.remarks,
                                                    type: quotation.status
                                                })
                                            }} /></TableCell> : <TableCell><MdOutlineRemoveRedEye /></TableCell>}
                                            <TableCell><MdLocalPrintshop style={{ cursor: 'pointer' }} onClick={() => {
                                                dispatch(fetchQuotationDoc({id: quotation.id, type: 'machine'})).unwrap().then((res: any) => {
                                                    setQuotatioinDoc({
                                                        dialog: true,
                                                        html: res
                                                    })
                                                })
                                            }} /></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={10} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    
                        {(currentTab == 1) &&
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Qoutation No</TableCell>
                                        <TableCell>Quotation Date</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Reminder Date</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Cost</TableCell>
                                        <TableCell>Followup User</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sparesQuotationList.length > 0 ? sparesQuotationList.map((quotation: any) => (
                                        <TableRowStyled key={quotation.id}>
                                            <TableCell>{quotation.quotation_no}</TableCell>
                                            <TableCell>{moment(quotation.quotation_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.customer.customer_name}</TableCell>
                                            <TableCell>{quotation.machine.machine_name}</TableCell>
                                            <TableCell>{moment(quotation.reminder_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.qty}</TableCell>
                                            <TableCell>{quotation.initial_cost}</TableCell>
                                            <TableCell>{quotation.user?.emp_name}</TableCell>
                                            <TableCell>
                                                {(quotation.status.includes('Pending Approval') || quotation.status.includes('Pending Verification')) ?
                                                    <Card sx={{ bgcolor: quotation.status.includes('Pending Approval') ? '#006BFF' : '#bb0037', color: 'white', p: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                                        setFormData({
                                                            quotation_id: quotation.id,
                                                            quotation_no: quotation.quotation_no,
                                                            quotation_date: quotation.quotation_date,
                                                            machine_id: quotation.machine.id,
                                                            machine_name: quotation.machine.machine_name,
                                                            customer_id: quotation.customer.id,
                                                            customer_name: quotation.customer.customer_name,
                                                            reminder_date: quotation.reminder_date,
                                                            qty: quotation.qty,
                                                            user_id: quotation.user?.id,
                                                            cost: quotation.initial_cost,
                                                            user_name: quotation.user?.emp_name,
                                                            remarks: quotation.remarks,
                                                            type: quotation.status
                                                        })
                                                        setApproveData({
                                                            quotation_id: quotation.id,
                                                            remarks: '',
                                                            cost: quotation.approved_cost
                                                        })
                                                        setApproveDialog(true)
                                                    }}>{quotation.status}</Card>
                                                    : quotation.status.includes('Approved') ?
                                                        <Card sx={{ bgcolor: 'green', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card> :
                                                        <Card sx={{ bgcolor: '#bb0037', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card>}
                                            </TableCell>
                                            {quotation.status.includes('Pending Verification') ? <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                                                setIsNew(false)
                                                setSpareDialog(true)
                                                setQuotationTerms(quotation.quotation_terms)
                                                setSparesFormData({
                                                    quotation_id: quotation.id,
                                                    quotation_no: quotation.quotation_no,
                                                    quotation_date: quotation.quotation_date,
                                                    machine_id: quotation.machine.id,
                                                    customer_id: quotation.customer.id,
                                                    customer_name: quotation.customer.customer_name,
                                                    reminder_date: quotation.reminder_date,
                                                    qty: quotation.qty,
                                                    user_id: quotation.user?.id,
                                                    cost: quotation.initial_cost,
                                                    user_name: quotation.user?.emp_name,
                                                    remarks: quotation.remarks,
                                                    type: quotation.status,
                                                    spares: quotation.spares
                                                })
                                                setSpareParts(quotation.spares)
                                            }} /></TableCell> : <TableCell><MdOutlineRemoveRedEye /></TableCell>}
                                            <TableCell><MdLocalPrintshop style={{ cursor: 'pointer' }} onClick={() => {
                                                dispatch(fetchQuotationDoc({id: quotation.id, type: 'spares'})).unwrap().then((res: any) => {
                                                    setQuotatioinDoc({
                                                        dialog: true,
                                                        html: res
                                                    })
                                                })
                                            }} /></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={10} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>}

                    {(currentTab == 2) &&
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Qoutation No</TableCell>
                                        <TableCell>Quotation Date</TableCell>
                                        <TableCell>Vendor Name</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Remarks</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vendorQuotationList.list?.length > 0 ? vendorQuotationList.list?.map((quotation: any) => (
                                        <TableRowStyled key={quotation.id}>
                                            <TableCell>{quotation.quotation_no}</TableCell>
                                            <TableCell>{moment(quotation.quotation_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.vendor.vendor_name}</TableCell>
                                            <TableCell>{quotation.part.part_name}</TableCell>
                                            <TableCell>
                                                {quotation.status.includes('Pending Approval') ?
                                                    <Card sx={{ bgcolor: '#006BFF', color: 'white', p: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                                        setVendorFormData({
                                                            quotation_id: quotation.id,
                                                            quotation_no: quotation.quotation_no,
                                                            quotation_date: quotation.quotation_date,
                                                            vendor_id: quotation.vendor.id,
                                                            part_id: quotation.part.id,
                                                            remarks: quotation.remarks,
                                                            approvalRemarks: ''
                                                        })
                                                        const p_process: any = []
                                                        quotation.data?.map((js: any) => {
                                                            p_process.push({
                                                                process_id: js['process_id'],
                                                                process_name: js['process_name'],
                                                                cost: js['cost'],
                                                                delivery_time: js['delivery_time']
                                                            })
                                                        })
                                                        setPartProcessList(p_process)
                                                        setIsNew(false)
                                                        setIsApprove(true)
                                                        setVendorQDialog(true)
                                                    }}>{quotation.status}</Card>
                                                    : quotation.status.includes('Approved') ?
                                                        <Card sx={{ bgcolor: 'green', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card> :
                                                        <Card sx={{ bgcolor: '#bb0037', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card>}
                                            </TableCell>
                                            <TableCell>{quotation.remarks}</TableCell>
                                            {quotation.status.includes('Pending Approval') ? <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                                                setIsNew(false)
                                                setVendorFormData({
                                                    quotation_id: quotation.id,
                                                    quotation_no: quotation.quotation_no,
                                                    quotation_date: quotation.quotation_date,
                                                    vendor_id: quotation.vendor.id,
                                                    part_id: quotation.part.id,
                                                    remarks: quotation.remarks,
                                                    approvalRemarks: ''
                                                })
                                                const p_process: any = []
                                                quotation.data?.map((js: any) => {
                                                    p_process.push({
                                                        process_id: js['process_id'],
                                                        process_name: js['process_name'],
                                                        cost: js['cost'],
                                                        delivery_time: js['delivery_time']
                                                    })
                                                })
                                                setPartProcessList(p_process)
                                                setIsNew(false)
                                                setVendorQDialog(true)
                                            }} /></TableCell> : <TableCell><MdOutlineRemoveRedEye /></TableCell>}
                                            {quotation.status.includes('Pending Approval') ? <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    setDeleteDialog({
                                                        dialog: true,
                                                        type: 'vendor',
                                                        id: quotation.id,
                                                        no: quotation.quotation_no
                                                    })
                                                }} /></TableCell> : <TableCell></TableCell>}
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={10} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>}

                    {(currentTab == 3) &&
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Qoutation No</TableCell>
                                        <TableCell>Quotation Date</TableCell>
                                        <TableCell>Supplier Name</TableCell>
                                        <TableCell>Boughtout Name</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Remarks</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {supplierQuotationList.list?.length > 0 ? supplierQuotationList.list?.map((quotation: any) => (
                                        <TableRowStyled key={quotation.id}>
                                            <TableCell>{quotation.quotation_no}</TableCell>
                                            <TableCell>{moment(quotation.quotation_date).format('DD-MM-YYYY')}</TableCell>
                                            <TableCell>{quotation.supplier.supplier_name}</TableCell>
                                            <TableCell>{quotation.boughtout.bought_out_name}</TableCell>
                                            <TableCell>
                                                {quotation.status.includes('Pending Approval') ?
                                                    <Card sx={{ bgcolor: '#006BFF', color: 'white', p: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                                        setSupplierFormData({
                                                            quotation_id: quotation.id,
                                                            quotation_no: quotation.quotation_no,
                                                            quotation_date: quotation.quotation_date,
                                                            supplier_id: quotation.supplier.id,
                                                            bought_out_id: quotation.boughtout.id,
                                                            remarks: quotation.remarks,
                                                            approvalRemarks: '',
                                                            cost: quotation.cost,
                                                            delivery_time: quotation.delivery_time
                                                        })
                                                        setIsNew(false)
                                                        setIsApprove(true)
                                                        setSupplierQDialog(true)
                                                    }}>{quotation.status}</Card>
                                                    : quotation.status.includes('Approved') ?
                                                        <Card sx={{ bgcolor: 'green', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card> :
                                                        <Card sx={{ bgcolor: '#bb0037', color: 'white', p: 1, textAlign: 'center' }}>{quotation.status}</Card>}
                                            </TableCell>
                                            <TableCell>{quotation.remarks}</TableCell>
                                            {quotation.status.includes('Pending Approval') ? <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                                                setIsNew(false)
                                                setSupplierFormData({
                                                    quotation_id: quotation.id,
                                                    quotation_no: quotation.quotation_no,
                                                    quotation_date: quotation.quotation_date,
                                                    supplier_id: quotation.supplier.id,
                                                    bought_out_id: quotation.boughtout.id,
                                                    remarks: quotation.remarks,
                                                    approvalRemarks: '',
                                                    cost: quotation.cost,
                                                    delivery_time: quotation.delivery_time
                                                })
                                                setIsNew(false)
                                                setSupplierQDialog(true)
                                            }} /></TableCell> : <TableCell><MdOutlineRemoveRedEye /></TableCell>}
                                            {quotation.status.includes('Pending Approval') ? <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    setDeleteDialog({
                                                        dialog: true,
                                                        id: quotation.id,
                                                        no: quotation.quotation_no,
                                                        type: 'supplier'
                                                    })
                                                }} /></TableCell> : <TableCell></TableCell>}
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={10} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                </Grid2>
            </Grid2>

            <Dialog
                maxWidth={'md'}
                open={createDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setCreateDialog(false)
                }}>
                <DialogTitle>{isNew ? 'New Machine Quotation' : 'Update Machine Quotation'}</DialogTitle>
                <DialogContent>
                    {!isNew && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Quotation No"
                        name="name"
                        sx={{ mt: 1 }}
                        value={formData?.quotation_no}
                    />}

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Customer</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="Customer"
                                value={formData.customer_id}
                                error={!!errors?.customer_id}
                                onChange={(e: any) => {
                                    setFormData({ ...formData, customer_id: e.target.value })
                                }}
                            >
                                {customers && customers.list.length > 0 && customers?.list.map((customer) => {
                                    return <MenuItem value={customer.id}>{customer.customer_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.customer_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.customer_id}</FormHelperText> : <></>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2, ml: 2 }}>
                            <InputLabel id="role-select-label">Followup User</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="user_id"
                                value={formData.user_id}
                                error={!!errors?.user_id}
                                onChange={(e: any) => {
                                    setFormData({ ...formData, user_id: e.target.value })
                                }}
                            >
                                {users && users.list.length > 0 && users?.list?.map((user: any) => {
                                    return <MenuItem value={user.id}>{user.emp_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.user_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.user_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Box>


                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="role-select-label">Machine</InputLabel>
                        <Select
                            size={'small'}
                            labelId="role-select-label"
                            id="role-select"
                            label="Machine"
                            value={formData.machine_id}
                            error={!!errors?.machine_id}
                            onChange={(e: any) => {
                                const mac = machines.find((m: any) => m.id == e.target.value)
                                setFormData({ ...formData, machine_id: e.target.value, qty: mac.min_spindles })
                                setSelectedMachine({
                                    machine_id: e.target.value,
                                    min_spindles: mac.min_spindles,
                                    max_spindles: mac.max_spindles,
                                    spindles: mac.spindles
                                })
                            }}
                        >
                            {machines && machines.length > 0 && machines?.map((machine) => {
                                return <MenuItem value={machine.id}>{machine.machine_name}</MenuItem>
                            })}
                        </Select>
                        {errors?.machine_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.machine_id}</FormHelperText> : <></>}
                    </FormControl>

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Quotation Date"
                                sx={{ mt: 2, width: '100%' }}
                                value={dayjs(formData.quotation_date)}
                                onChange={(e: any) => {
                                    setFormData({ ...formData, quotation_date: e })
                                }}
                                slotProps={{
                                    textField: {
                                        error: !!errors?.quotation_date,
                                        helperText: errors?.quotation_date
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker label="Reminder Date" sx={{ mt: 2, width: '100%', ml: 2 }}
                                value={dayjs(formData.reminder_date)}
                                onChange={(e: any) => {
                                    setFormData({ ...formData, reminder_date: e })
                                }}
                                slotProps={{
                                    textField: {
                                        error: !!errors?.reminder_date,
                                        helperText: errors?.reminder_date
                                    }
                                }} />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Qty"
                            name="name"
                            type='number'
                            required
                            inputProps={{ min: selectedMachine?.spindles, step: selectedMachine?.spindles, max: selectedMachine?.max_spindles }}
                            onChange={(e: any) => {
                                setFormData({ ...formData, qty: e.target.value })
                            }}
                            value={formData?.qty}
                            error={!!errors?.qty}
                            helperText={errors?.qty}
                            sx={{ mt: 2 }}
                        />

                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Cost"
                            name="name"
                            required
                            onChange={(e: any) => {
                                setFormData({ ...formData, cost: e.target.value })
                            }}
                            value={formData?.cost}
                            error={!!errors?.cost}
                            helperText={errors?.cost}
                            sx={{ mt: 2, ml: 2 }}
                        />
                    </Box>

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Remarks"
                        name="remarks"
                        onChange={(e: any) => {
                            setFormData({ ...formData, remarks: e.target.value })
                        }}
                        value={formData?.remarks}
                        sx={{ mt: 2 }}
                    />

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

                    {isExpand && quotationTerms.map((term: string, index: number) => {
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
                    <Button onClick={() => {
                        setCreateDialog(false)
                        clearValues()
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button onClick={handleNewMachineQuotation} variant="contained">{formData.quotation_id.length == 0 ? 'Save' : 'Update'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                maxWidth={'sm'}
                open={approveDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setApproveDialog(false)
                    clearValues()
                }}>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <h5 style={{ flexGrow: '1' }}>{formData.type == 'Pending Approval' ? 'Approve/Reject Quotation' : 'Verify Quotation'} </h5>
                        <CloseSharp style={{ cursor: 'pointer' }} onClick={() => {
                            setApproveDialog(false)
                            clearValues()
                        }} />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '50vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Quotation No</Typography>
                            <Typography variant='subtitle1'>{formData?.quotation_no}</Typography>
                        </Box>

                        <Box sx={{ width: '50vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Machine Name</Typography>
                            <Typography variant='subtitle1'>{formData?.machine_name}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                        <Box sx={{ width: '50vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Customer Name</Typography>
                            <Typography variant='subtitle1'>{formData?.customer_name}</Typography>
                        </Box>

                        <Box sx={{ width: '50vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Followup User</Typography>
                            <Typography variant='subtitle1'>{formData?.user_name}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                        <Box sx={{ width: '25vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Quotation Date</Typography>
                            <Typography variant='subtitle1'>{moment(formData.quotation_date).format('DD-MM-YYYY')}</Typography>
                        </Box>
                        <Box sx={{ width: '25vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Reminder Date</Typography>
                            <Typography variant='subtitle1'>{moment(formData.reminder_date).format('DD-MM-YYYY')}</Typography>
                        </Box>
                        <Box sx={{ width: '25vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Qty</Typography>
                            <Typography variant='subtitle1'>{formData.qty}</Typography>
                        </Box>

                        <Box sx={{ width: '25vw' }}>
                            <Typography variant='subtitle2' color={'grey'}>Cost</Typography>
                            <Typography variant='subtitle1'>{formData.cost}</Typography>
                        </Box>
                    </Box>

                    <Typography variant='subtitle2' color={'grey'}>Remarks</Typography>
                    <Typography variant='subtitle1'>{formData.remarks}</Typography>

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label={formData.type == "Pending Approval" ? "Approval/Rejection Remarks" : "Verification Remarks"}
                        name="approva_remarks"
                        onChange={(e: any) => {
                            setApproveData({ ...approveData, remarks: e.target.value })
                        }}
                        value={approveData?.remarks}
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Approved Cost"
                        name="name"
                        required
                        value={approveData?.cost}
                        onChange={(e: any) => {
                            setApproveData({ ...approveData, cost: e.target.value })
                        }}
                        sx={{ mt: 2 }}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleApproveReject(formData.type == "Pending Approval" ? "Approved" : "Verified", 'machine')} variant="contained">{formData.type == "Pending Approval" ? "Approve" : "Verify"}</Button>
                    <Button onClick={() => handleApproveReject('Rejected', 'machine')} sx={{ backgroundColor: '#bb0037' }} variant="contained">Reject</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                maxWidth={'sm'}
                open={vendorQDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setVendorQDialog(false)
                }}>
                <DialogTitle>{isApprove ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <h5 style={{ flexGrow: '1' }}>Approve/Reject Quotation</h5>
                    <CloseSharp style={{ cursor: 'pointer' }} onClick={() => {
                        setIsApprove(false)
                        setVendorQDialog(false)
                        clearValues()
                    }} />
                </Box>
                    : isNew ? 'New Vendor Quotation' : 'Update Vendor Quotation'}</DialogTitle>
                <DialogContent>
                    {!isNew && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Quotation No"
                        name="name"
                        sx={{ mt: 1 }}
                        value={vendorFormData?.quotation_no}
                    />}

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Vendor</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="Vendor"
                                value={vendorFormData.vendor_id}
                                error={!!errors?.vendor_id}
                                disabled={isApprove}
                                onChange={(e: any) => {
                                    setVendorFormData({ ...vendorFormData, vendor_id: e.target.value })
                                }}
                            >
                                {vendors && vendors.list.length > 0 && vendors?.list.map((vendor) => {
                                    return <MenuItem value={vendor.id}>{vendor.vendor_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.vendor_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.vendor_id}</FormHelperText> : <></>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2, ml: 2 }}>
                            <InputLabel id="role-select-label">Part</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="user_id"
                                value={vendorFormData.part_id}
                                error={!!errors?.part_id}
                                disabled={isApprove}
                                onChange={(e: any) => {
                                    if (isNew) {
                                        setVendorFormData({ ...vendorFormData, part_id: e.target.value })
                                        dispatch(fetchPartDetail(e.target.value)).unwrap().then((res: any) => {
                                            const p_process: any = []
                                            res?.part_detail?.part_process_list?.map((process: any) => {
                                                p_process.push({
                                                    process_id: process.process.id,
                                                    process_name: process.process.process_name,
                                                    cost: 0,
                                                    delivery_time: 0
                                                })
                                            })
                                            setPartProcessList(p_process)
                                        })
                                    }
                                }}
                            >
                                {parts && parts.list.length > 0 && parts?.list?.map((part: any) => {
                                    return <MenuItem value={part.id}>{part.part_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.part_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.part_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Quotation Date"
                            sx={{ mt: 2, width: '100%' }}
                            value={dayjs(vendorFormData.quotation_date)}
                            disabled={isApprove}
                            onChange={(e: any) => {
                                setVendorFormData({ ...vendorFormData, quotation_date: e })
                            }}
                            slotProps={{
                                textField: {
                                    error: !!errors?.quotation_date,
                                    helperText: errors?.quotation_date
                                }
                            }}
                        />
                    </LocalizationProvider>

                    {partProcessList && partProcessList.length > 0 && partProcessList.map((pp: any) => {
                        return (
                            <Box>
                                <Card sx={{ textAlign: 'center', p: 0.5, fontWeight: 'bold', backgroundColor: 'lightskyblue', mt: 1 }}>Process Name: {pp.process_name}</Card>
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Cost"
                                    name="name"
                                    type='number'
                                    disabled={isApprove}
                                    required
                                    onChange={(e: any) => {
                                        setPartProcessList(
                                            partProcessList.map((p: any) => {
                                                return p.process_name == pp.process_name ? {
                                                    process_name: p.process_name,
                                                    process_id: p.process_id,
                                                    cost: e.target.value,
                                                    delivery_time: p.delivery_time
                                                } : p
                                            })
                                        )
                                    }}
                                    value={pp?.cost}
                                    sx={{ mt: 2 }}
                                />

                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Delivery Time"
                                    name="name"
                                    required
                                    disabled={isApprove}
                                    onChange={(e: any) => {
                                        setPartProcessList(
                                            partProcessList.map((p: any) => {
                                                return p.process_name == pp.process_name ? {
                                                    process_name: p.process_name,
                                                    process_id: p.process_id,
                                                    cost: p.cost,
                                                    delivery_time: e.target.value
                                                } : p
                                            })
                                        )
                                    }}
                                    value={pp?.delivery_time}
                                    sx={{ mt: 2 }}
                                />
                            </Box>
                        )
                    })}

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Remarks"
                        name="remarks"
                        disabled={isApprove}
                        onChange={(e: any) => {
                            setVendorFormData({ ...vendorFormData, remarks: e.target.value })
                        }}
                        value={vendorFormData?.remarks}
                        sx={{ mt: 2 }}
                    />

                    {isApprove && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Approval Remarks"
                        name="remarks"
                        onChange={(e: any) => {
                            setVendorFormData({ ...vendorFormData, approvalRemarks: e.target.value })
                        }}
                        value={vendorFormData?.approvalRemarks}
                        sx={{ mt: 2 }}
                    />}

                </DialogContent>
                {isApprove && <DialogActions>
                    <Button onClick={() => handleApproveReject('Approved', 'vendor')} variant="contained">Approve</Button>
                    <Button onClick={() => handleApproveReject('Rejected', 'vendor')} sx={{ backgroundColor: '#bb0037' }} variant="contained">Reject</Button>
                </DialogActions>}

                {!isApprove && <DialogActions>
                    <Button onClick={() => {
                        setVendorQDialog(false)
                        clearValues()
                        setErrors({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button onClick={handleNewVendorQuotation} variant="contained">{formData.quotation_id.length == 0 ? 'Save' : 'Update'}</Button>
                </DialogActions>}
            </Dialog>

            <Dialog
                maxWidth={'sm'}
                open={deleteDialog.dialog}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <h6>Are you sure, you want to delete Quotation - {deleteDialog.no}?</h6>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeleteDialog({
                            dialog: false, no: '', id: '', type: ''
                        })
                    }} sx={{ color: '#bb0037' }}>No</Button>
                    <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
                        onClick={() => {
                            dispatch(deleteQuotation({ type: deleteDialog.type, id: deleteDialog.id })).unwrap().then((res: any) => {
                                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                                if (res.includes('success')) {
                                    if (deleteDialog.type == 'vendor') {
                                        dispatch(fetchVendorQuotationList())
                                    } else {
                                        dispatch(fetchSupplierQuotationList())
                                    }
                                    setDeleteDialog({
                                        dialog: false, no: '', id: '', type: ''
                                    })
                                }
                            }).catch((err: any) => {
                                DisplaySnackbar(err.message, "error", enqueueSnackbar)
                            })
                        }}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                maxWidth={'sm'}
                open={supplierQDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setSupplierQDialog(false)
                }}>
                <DialogTitle>{isApprove ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <h5 style={{ flexGrow: '1' }}>Approve/Reject Quotation</h5>
                    <CloseSharp style={{ cursor: 'pointer' }} onClick={() => {
                        setIsApprove(false)
                        setSupplierQDialog(false)
                        clearValues()
                    }} />
                </Box>
                    : isNew ? 'New Supplier Quotation' : 'Update Supplier Quotation'}</DialogTitle>
                <DialogContent>
                    {!isNew && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Quotation No"
                        name="name"
                        sx={{ mt: 1 }}
                        value={supplierFormData?.quotation_no}
                    />}

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Supplier</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="Vendor"
                                value={supplierFormData.supplier_id}
                                error={!!errors?.supplier_id}
                                disabled={isApprove}
                                onChange={(e: any) => {
                                    setSupplierFormData({ ...supplierFormData, supplier_id: e.target.value })
                                }}
                            >
                                {suppliers && suppliers.list.length > 0 && suppliers?.list.map((supplier) => {
                                    return <MenuItem value={supplier.id}>{supplier.supplier_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.supplier_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.supplier_id}</FormHelperText> : <></>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2, ml: 2 }}>
                            <InputLabel id="role-select-label">Boughtout</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="user_id"
                                value={supplierFormData.bought_out_id}
                                error={!!errors?.bought_out_id}
                                disabled={isApprove}
                                onChange={(e: any) => {
                                    if (isNew) {
                                        setSupplierFormData({ ...supplierFormData, bought_out_id: e.target.value })
                                    }
                                }}
                            >
                                {boughtOuts && boughtOuts.length > 0 && boughtOuts?.map((boughtOut: any) => {
                                    return <MenuItem value={boughtOut.id}>{boughtOut.bought_out_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.bought_out_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.bought_out_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Quotation Date"
                            sx={{ mt: 2, width: '100%' }}
                            value={dayjs(supplierFormData.quotation_date)}
                            disabled={isApprove}
                            onChange={(e: any) => {
                                setSupplierFormData({ ...supplierFormData, quotation_date: e })
                            }}
                            slotProps={{
                                textField: {
                                    error: !!errors?.quotation_date,
                                    helperText: errors?.quotation_date
                                }
                            }}
                        />
                    </LocalizationProvider>

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Cost"
                        name="name"
                        type='number'
                        disabled={isApprove}
                        error={!!errors?.cost}
                        helperText={errors?.cost}
                        required
                        onChange={(e: any) => {
                            setSupplierFormData({ ...supplierFormData, cost: e.target.value })
                        }}
                        value={supplierFormData.cost}
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Delivery Time"
                        name="name"
                        required
                        disabled={isApprove}
                        value={supplierFormData.delivery_time}
                        error={!!errors?.delivery_time}
                        helperText={errors?.delivery_time}
                        onChange={(e: any) => {
                            setSupplierFormData({ ...supplierFormData, delivery_time: e.target.value })
                        }}
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Remarks"
                        name="remarks"
                        disabled={isApprove}
                        onChange={(e: any) => {
                            setSupplierFormData({ ...supplierFormData, remarks: e.target.value })
                        }}
                        value={supplierFormData?.remarks}
                        sx={{ mt: 2 }}
                    />

                    {isApprove && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Approval Remarks"
                        name="remarks"
                        onChange={(e: any) => {
                            setSupplierFormData({ ...supplierFormData, approvalRemarks: e.target.value })
                        }}
                        value={supplierFormData?.approvalRemarks}
                        sx={{ mt: 2 }}
                    />}

                </DialogContent>
                {isApprove && <DialogActions>
                    <Button onClick={() => handleApproveReject('Approved', 'supplier')} variant="contained">Approve</Button>
                    <Button onClick={() => handleApproveReject('Rejected', 'supplier')} sx={{ backgroundColor: '#bb0037' }} variant="contained">Reject</Button>
                </DialogActions>}

                {!isApprove && <DialogActions>
                    <Button onClick={() => {
                        setSupplierQDialog(false)
                        clearValues()
                        setErrors({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button onClick={handleNewSupplierQuotation} variant="contained">{supplierFormData.quotation_id.length == 0 ? 'Save' : 'Update'}</Button>
                </DialogActions>}
            </Dialog>

            <Dialog
                maxWidth={'md'}
                open={quotationDoc.dialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setQuotatioinDoc({
                        dialog: false,
                        html: ''
                    })
                }}>
                <DialogTitle>Quotation</DialogTitle>
                <DialogContent>
                    <Box>
                        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: quotationDoc.html }} />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setQuotatioinDoc({
                            dialog: false, html: ''
                        })
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" onClick={() => reactToPrintFn()}>Print</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for spares quotation */}

            <Dialog
                maxWidth={'xl'}
                open={spareDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setSpareDialog(false)
                }}>
                <DialogTitle>{isNew ? 'New Spares Quotation' : 'Update Spares Quotation'}</DialogTitle>
                <DialogContent>
                    {!isNew && <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Quotation No"
                        name="name"
                        sx={{ mt: 1 }}
                        value={sparesFormData?.quotation_no}
                    />}

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="role-select-label">Customer</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="Customer"
                                value={sparesFormData.customer_id}
                                error={!!errors?.customer_id}
                                onChange={(e: any) => {
                                    setSparesFormData({ ...sparesFormData, customer_id: e.target.value })
                                }}
                            >
                                {customers && customers.list.length > 0 && customers?.list.map((customer) => {
                                    return <MenuItem value={customer.id}>{customer.customer_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.customer_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.customer_id}</FormHelperText> : <></>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2, ml: 2 }}>
                            <InputLabel id="role-select-label">Followup User</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="user_id"
                                value={sparesFormData.user_id}
                                error={!!errors?.user_id}
                                onChange={(e: any) => {
                                    setSparesFormData({ ...sparesFormData, user_id: e.target.value })
                                }}
                            >
                                {users && users.list.length > 0 && users?.list?.map((user: any) => {
                                    return <MenuItem value={user.id}>{user.emp_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.user_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.user_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Box>


                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="role-select-label">Machine</InputLabel>
                        <Select
                            size={'small'}
                            labelId="role-select-label"
                            id="role-select"
                            label="Machine"
                            value={sparesFormData.machine_id}
                            error={!!errors?.machine_id}
                            onChange={(e: any) => {
                                const mac = machines.find((m: any) => m.id == e.target.value)
                                setSparesFormData({ ...sparesFormData, machine_id: e.target.value })
                                setSelectedMachine({
                                    machine_id: e.target.value,
                                    min_spindles: mac.min_spindles,
                                    max_spindles: mac.max_spindles,
                                    spindles: mac.spindles
                                })
                            }}
                        >
                            {machines && machines.length > 0 && machines?.map((machine) => {
                                return <MenuItem value={machine.id}>{machine.machine_name}</MenuItem>
                            })}
                        </Select>
                        {errors?.machine_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.machine_id}</FormHelperText> : <></>}
                    </FormControl>

                    {spareParts.map((sap, index) => {
                        return (<Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="role-select-label">Part</InputLabel>
                                <Select
                                    size={'small'}
                                    labelId="role-select-label"
                                    id="role-select"
                                    label="Vendor"
                                    value={sap.spare_id}
                                    onChange={(e: any) => {
                                        setSpareParts(
                                            spareParts.map((sub) => {
                                                return (sub.id == sap.id) ? {
                                                    id: sub.id,
                                                    spare_id: e.target.value,
                                                    spare_name: machineSpares.find((p) => p.id == e.target.value).name,
                                                    spare_type: machineSpares.find((p) => p.id == e.target.value).type,
                                                    spare_qty: sub.spare_qty,
                                                    spare_cost: sub.spare_cost
                                                } : sub
                                            })
                                        )                                      
                                    }}
                                >
                                    {machineSpares.map((part) => {
                                        return <MenuItem value={part.id}>{part.name}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>

                            <TextField
                                sx={{ ml: 1 }}
                                size='small'
                                variant="outlined"
                                fullWidth
                                required
                                inputMode='numeric'
                                label="Qty"
                                name="serial_no"
                                value={sap.spare_qty}
                                onChange={(e: any) => {
                                    setSpareParts(
                                        spareParts.map((sub) => {
                                            return (sub.id == sap.id) ? {
                                                id: sub.id,
                                                spare_id: sub.spare_id,
                                                spare_name: sub.spare_name,
                                                spare_type: sub.spare_type,
                                                spare_qty: e.target.value,
                                                spare_cost: sub.spare_cost
                                            } : sub
                                        })
                                    )
                                }}
                            />

                            <TextField
                                sx={{ ml: 1 }}
                                size='small'
                                variant="outlined"
                                fullWidth
                                required
                                inputMode='numeric'
                                label="Cost"
                                name="cost"
                                value={sap.spare_cost}
                                onChange={(e: any) => {
                                    setSpareParts(
                                        spareParts.map((sub) => {
                                            return (sub.id == sap.id) ? {
                                                id: sub.id,
                                                spare_id: sub.spare_id,
                                                spare_name: sub.spare_name,
                                                spare_type: sub.spare_type,
                                                spare_qty: sub.spare_qty,
                                                spare_cost: e.target.value
                                            } : sub
                                        })
                                    )
                                }}
                            />

                            <IoMdCloseCircle color='red' size={'40px'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => {
                                setSpareParts(spareParts.filter((sub) => sub.id != sap.id))
                            }} />
                        </Box>)

                    })}

                    <Button onClick={() => {
                        setSpareParts([...spareParts, {
                            id: new Date().getTime(),
                            spare_id: new Date().getTime(), spare_name: '', spare_type: '', spare_qty: 0,
                            spare_cost: 0
                        }])
                    }}>Add Item</Button>

                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Quotation Date"
                                sx={{ mt: 2, width: '100%' }}
                                value={dayjs(sparesFormData.quotation_date)}
                                onChange={(e: any) => {
                                    setSparesFormData({ ...sparesFormData, quotation_date: e })
                                }}
                                slotProps={{
                                    textField: {
                                        error: !!errors?.quotation_date,
                                        helperText: errors?.quotation_date
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker label="Reminder Date" sx={{ mt: 2, width: '100%', ml: 2 }}
                                value={dayjs(sparesFormData.reminder_date)}
                                onChange={(e: any) => {
                                    setSparesFormData({ ...sparesFormData, reminder_date: e })
                                }}
                                slotProps={{
                                    textField: {
                                        error: !!errors?.reminder_date,
                                        helperText: errors?.reminder_date
                                    }
                                }} />
                        </LocalizationProvider>
                    </Box>

                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        label="Remarks"
                        name="remarks"
                        onChange={(e: any) => {
                            setSparesFormData({ ...sparesFormData, remarks: e.target.value })
                        }}
                        value={sparesFormData?.remarks}
                        sx={{ mt: 2 }}
                    />

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

                    {isExpand && quotationTerms.map((term: string, index: number) => {
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
                    <Button onClick={() => {
                        setSpareDialog(false)
                        clearValues()
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button onClick={handleNewSparesQuotation} variant="contained">{sparesFormData.quotation_id.length == 0 ? 'Save' : 'Update'}</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
