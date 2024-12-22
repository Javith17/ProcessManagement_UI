import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid2, Input, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { createNewMachine, fetchBoughtOutList, fetchMachineList, fetchVendorAttachment } from '../slices/machineSlice';
import { nav_boughtouts, nav_machines, nav_orders, TableRowStyled } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from "react-icons/fa6";
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { completeProductPartProcess, deliverProductionMachinePart, fetchOrdersDetail, fetchOrdersList, moveProductionMachinePartToVendor, rescheduleProductPartProcess, updateProductionMachineBO, updateProductionMachinePart } from '../slices/quotationSlice';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import moment from 'moment';

export default function OrderDetail() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { state } = useLocation()
    const { enqueueSnackbar } = useSnackbar()

    const { orderDetail } = useAppSelector(
        (state) => state.quotation
    );

    const [editDialog, setEditDialog] = useState(false)
    const [headerDetail, setHeaderDetail] = useState<any>()
    const [vendorList, setVendorList] = useState<any[]>()
    const [selectedVendor, setSelectedVendor] = useState<any>()
    const [selectedPart, setSelectedPart] = useState<any>()
    const [orderDetailList, setOrderDetailList] = useState<any[]>([])
    const [orderDetailBOList, setOrderDetailBOList] = useState<any[]>([])
    const [deliveredDialog, setDeliveredDialog] = useState(false)
    const [deliveryPart, setDeliveryPart] = useState<any>()
    const [moveToVendorData, setMoveToVendorData] = useState<any>()
    const [moveToVendorDialog, setMoveToVendorDialog] = useState(false)
    const [completeDialog, setCompleteDialog] = useState(false)
    const [completeData, setCompleteData] = useState<any>()

    const [selectedBO, setSelectedBO] = useState<any>()
    const [addBODialog, setAddBODialog] = useState(false)
    const [supplierList, setSupplierList] = useState<any[]>()
    const [selectedSupplier, setSelectedSupplier] = useState<any>()

    useEffect(() => {
        if (state?.order_id) {
            dispatch(fetchOrdersDetail(state?.order_id)).unwrap()
        }
    }, [state])

    const [errors, setErrors] = useState<any>()

    useEffect(() => {
        if (orderDetail?.parts?.orderDetail) {
            setHeaderDetail({
                quotationNo: orderDetail.parts?.orderDetail[0]?.order.quotation.quotation_no,
                machineName: orderDetail.parts?.orderDetail[0]?.order.machine_name,
                customerName: orderDetail.parts?.orderDetail[0]?.order.customer.customer_name,
                cost: orderDetail.parts?.orderDetail[0]?.order.quotation.approved_cost,
                qty: orderDetail.parts?.orderDetail[0]?.order.quotation.qty
            })
            setOrderDetailList(orderDetail.parts?.orderDetail)
            setOrderDetailBOList(orderDetail.boughtouts?.orderDetailBoughtout)
            setSupplierList(orderDetail.boughtouts?.boughtoutSupplier)
        }
    }, [orderDetail])
    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_orders} />

            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>

                <Grid2 size={3}>
                    <Typography variant='subtitle2' color={'grey'}>Quotation No</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.quotationNo : ""}</Typography>
                </Grid2>

                <Grid2 size={2}>
                    <Typography variant='subtitle2' color={'grey'}>Machine Name</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.machineName : ""}</Typography>
                </Grid2>

                <Grid2 size={2}>
                    <Typography variant='subtitle2' color={'grey'}>Customer Name</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.customerName : ""}</Typography>
                </Grid2>

                <Grid2 size={2}>
                    <Typography variant='subtitle2' color={'grey'}>Cost</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.cost : ""}</Typography>
                </Grid2>

                <Grid2 size={2}>
                    <Typography variant='subtitle2' color={'grey'}>Qty</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.qty : ""}</Typography>
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Part Name</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Process Name</TableCell>
                                    <TableCell>Vendor Name</TableCell>
                                    <TableCell>Cost</TableCell>
                                    <TableCell>Delivery Date</TableCell>
                                    <TableCell>Reminder Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderDetailList && orderDetailList.length > 0 ? orderDetailList.map((row: any, index: number) => (
                                    <TableRowStyled key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.part_name}</TableCell>
                                        <TableCell>{row.order_qty}</TableCell>
                                        <TableCell>{row.process_name}</TableCell>
                                        <TableCell>
                                            {row.vendor_name ? row.vendor_name : <div style={{
                                                backgroundColor: 'teal', textAlign: 'center', color: 'white',
                                                borderRadius: '4px', cursor: 'pointer'
                                            }} onClick={() => {
                                                setSelectedPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                                const processVendors = orderDetail?.parts?.partVendors?.filter((pv: any) =>
                                                    pv.part.id == row.part_id && pv.process.id == row.process_id
                                                )
                                                if (processVendors?.length > 0) {
                                                    setVendorList(processVendors[0].part_process_vendor_list)
                                                    setEditDialog(true)
                                                }
                                            }}>Add Vendor</div>}
                                        </TableCell>
                                        <TableCell>{row.cost}</TableCell>
                                        <TableCell>{row.delivery_date ? moment(row.delivery_date).format('DD-MM-YYYY') : ''}</TableCell>
                                        <TableCell>{row.reminder_date ? moment(row.reminder_date).format('DD-MM-YYYY') : ''}</TableCell>
                                        <TableCell><Box sx={{
                                            borderColor: row.status.includes('Pending') ? '#F95454' : row.status.includes('Progress') ? '#006BFF' : '#347928',
                                            color: row.status.includes('Pending') ? '#F95454' : row.status.includes('Progress') ? '#006BFF' : '#347928',
                                            borderStyle: 'solid', borderWidth: 'thin',
                                            textAlign: 'center',
                                            borderRadius: '4px', cursor: row.status.includes('Progress') ? 'pointer' : 'default',
                                            ":hover": {
                                                backgroundColor: row.status.includes('Progress') ? '#006BFF' : 'white',
                                                color: row.status.includes('Progress') ? 'white' :
                                                    row.status.includes('Pending') ? '#F95454' : '#347928'
                                            }
                                        }} onClick={() => {
                                            if (row.status.includes('Progress')) {
                                                // setDeliveredDialog(true)
                                                setCompleteDialog(true)
                                                setCompleteData({id: row.id, delivery_date: row.delivery_date, reminder_date: row.reminder_date})
                                                // setDeliveryPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                            } else if (row.status.toLowerCase() == 'move to vendor') {
                                                const processVendors = orderDetail.parts?.partVendors.filter((pv: any) =>
                                                    pv.part.id == row.part_id && pv.process.id == row.process_id
                                                )
                                                if (processVendors.length > 0) {
                                                    const process_vendor = processVendors[0].part_process_vendor_list.find((v: any) => v.vendor.id == row.vendor_id)
                                                    const deliveryDate = dayjs(new Date()).add(process_vendor.part_process_vendor_delivery_time, 'days')
                                                    const reminderDate = deliveryDate.add(-1, 'day')
                                                    setSelectedPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                                    setSelectedVendor({
                                                        id: row.vendor_id, name: process_vendor.vendor.vendor_name, cost: process_vendor.part_process_vendor_price,
                                                        delivery_time: process_vendor.part_process_vendor_delivery_time, mobile: process_vendor.vendor.vendor_mobile_no1,
                                                        delivery_date: deliveryDate, reminder_date: reminderDate
                                                    })
                                                    setMoveToVendorData({
                                                        id: row.id, part_name: row.part_name, process_name: row.process_name,
                                                        vendor_id: row.vendor_id
                                                    })
                                                    setMoveToVendorDialog(true)
                                                }

                                            }
                                        }}>{row.status}</Box></TableCell>
                                        <TableCell><FaWhatsapp color='green' onClick={() => {
                                            if (row.vendor_id) {
                                                dispatch(fetchVendorAttachment({ vendor_id: row.vendor_id, part_id: row.part_id })).unwrap().then((res: any) => {
                                                    if (res.attachments?.length > 0) {
                                                        const link = res.attachments.map((att: any) => `${process.env.REACT_APP_API_URL}/machine/loadAttachment/${att.file_name}`).join(',')
                                                        const text = `Hi ${res.vendor.vendor_name}
                                                        Accept the order using following link ${process.env.REACT_APP_UI_URL}/vendorAccept?id=${row.id} 
                                                        Get the drawings from following link ${link}`
                                                        window.open(`https://wa.me/${res.vendor.vendor_mobile_no1}?text=${text}`, '_blank')?.focus()
                                                        console.log(res)
                                                    } else {
                                                        DisplaySnackbar('No drawings available to share', 'error', enqueueSnackbar)
                                                    }
                                                })
                                            }
                                        }} /></TableCell>
                                    </TableRowStyled>
                                )) : <TableRow key={0}>
                                    <TableCell colSpan={9} align='center'>No Data</TableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid2>

                {/* Boughtout supplier */}

                <Grid2 size={{ xs: 6, md: 12 }} sx={{mt:3}}>
                    <TableContainer component={Paper}>
                        <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Boughtout Name</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Supplier Name</TableCell>
                                    <TableCell>Cost</TableCell>
                                    <TableCell>Delivery Date</TableCell>
                                    <TableCell>Reminder Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderDetailBOList && orderDetailBOList.length > 0 ? orderDetailBOList.map((row: any, index: number) => (
                                    <TableRowStyled key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.bought_out_name}</TableCell>
                                        <TableCell>{row.order_qty}</TableCell>
                                        <TableCell>
                                            {row.supplier_name ? row.supplier_name : <div style={{
                                                backgroundColor: 'teal', textAlign: 'center', color: 'white',
                                                borderRadius: '4px', cursor: 'pointer'
                                            }} onClick={() => {
                                                setSelectedBO({ id: row.id, bought_out_id: row.bought_out_id, bought_out_name: row.bought_out_name })
                                                setAddBODialog(true)
                                                // setSupplierList()
                                                // setSelectedPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                                // const processVendors = orderDetail.parts?.orderDetail?.partVendors.filter((pv: any) =>
                                                //     pv.part.id == row.part_id && pv.process.id == row.process_id
                                                // )
                                                // if (processVendors.length > 0) {
                                                //     setVendorList(processVendors[0].part_process_vendor_list)
                                                //     setEditDialog(true)
                                                // }
                                            }}>Add Supplier</div>}
                                        </TableCell>
                                        <TableCell>{row.cost}</TableCell>
                                        <TableCell>{row.delivery_date ? moment(row.delivery_date).format('DD-MM-YYYY') : ''}</TableCell>
                                        <TableCell>{row.reminder_date ? moment(row.reminder_date).format('DD-MM-YYYY') : ''}</TableCell>
                                        <TableCell><Box sx={{
                                            borderColor: row.status.includes('Pending') ? '#F95454' : row.status.includes('Progress') ? '#006BFF' : '#347928',
                                            color: row.status.includes('Pending') ? '#F95454' : row.status.includes('Progress') ? '#006BFF' : '#347928',
                                            borderStyle: 'solid', borderWidth: 'thin',
                                            textAlign: 'center',
                                            borderRadius: '4px', cursor: row.status.includes('Progress') ? 'pointer' : 'default',
                                            ":hover": {
                                                backgroundColor: row.status.includes('Progress') ? '#006BFF' : 'white',
                                                color: row.status.includes('Progress') ? 'white' :
                                                    row.status.includes('Pending') ? '#F95454' : '#347928'
                                            }
                                        }} onClick={() => {
                                            // if (row.status.includes('Progress')) {
                                            //     // setDeliveredDialog(true)
                                            //     setCompleteDialog(true)
                                            //     setCompleteData({id: row.id})
                                            //     // setDeliveryPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                            // } else if (row.status.toLowerCase() == 'move to vendor') {
                                            //     const processVendors = orderDetail.parts?.orderDetail?.partVendors.filter((pv: any) =>
                                            //         pv.part.id == row.part_id && pv.process.id == row.process_id
                                            //     )
                                            //     if (processVendors.length > 0) {
                                            //         const process_vendor = processVendors[0].part_process_vendor_list.find((v: any) => v.vendor.id == row.vendor_id)
                                            //         const deliveryDate = dayjs(new Date()).add(process_vendor.part_process_vendor_delivery_time, 'days')
                                            //         const reminderDate = deliveryDate.add(-1, 'day')
                                            //         setSelectedPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                            //         setSelectedVendor({
                                            //             id: row.vendor_id, name: process_vendor.vendor.vendor_name, cost: process_vendor.part_process_vendor_price,
                                            //             delivery_time: process_vendor.part_process_vendor_delivery_time, mobile: process_vendor.vendor.vendor_mobile_no1,
                                            //             delivery_date: deliveryDate, reminder_date: reminderDate
                                            //         })
                                            //         setMoveToVendorData({
                                            //             id: row.id, part_name: row.part_name, process_name: row.process_name,
                                            //             vendor_id: row.vendor_id
                                            //         })
                                            //         setMoveToVendorDialog(true)
                                            //     }

                                            // }
                                        }}>{row.status}</Box></TableCell>
                                        <TableCell><FaWhatsapp color='green' onClick={() => {
                                            if (row.vendor_id) {
                                                dispatch(fetchVendorAttachment({ supplier_id: row.supplier_id, part_id: row.bought_out_id })).unwrap().then((res: any) => {
                                                    if (res.attachments?.length > 0) {
                                                        const link = res.attachments.map((att: any) => `https://localhost:3000/machine/loadAttachment/${att.file_name}`).join(',')
                                                        window.open(`https://wa.me/${res.vendor.vendor_mobile_no1}?text=${link}`, '_blank')?.focus()
                                                        console.log(res)
                                                    } else {
                                                        DisplaySnackbar('No drawings available to share', 'error', enqueueSnackbar)
                                                    }
                                                })
                                            }
                                        }} /></TableCell>
                                    </TableRowStyled>
                                )) : <TableRow key={0}>
                                    <TableCell colSpan={9} align='center'>No Data</TableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid2>

            </Grid2>

            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "30vw!important",
                    },
                }}
                open={deliveredDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setDeliveredDialog(false)
                }}>
                <DialogTitle>Update Delivery status for {deliveryPart?.part_name} - {deliveryPart?.process_name}</DialogTitle>
                <DialogContent>
                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Delivery Remarks"
                        multiline
                        rows={4}
                        name="remarks"
                        sx={{ mt: 1 }}
                        value={deliveryPart?.remarks ? deliveryPart?.remarks : ""}
                        onChange={(e: any) => {
                            setDeliveryPart({ ...deliveryPart, remarks: e.target.value })
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeliveredDialog(false)
                        setErrors({})
                        setDeliveryPart({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        dispatch(deliverProductionMachinePart({
                            production_part_id: deliveryPart.id,
                            remarks: deliveryPart.remarks
                        })).unwrap().then((res: any) => {
                            if (res.message.includes('success')) {
                                DisplaySnackbar(res.message, ' success', enqueueSnackbar)
                                setOrderDetailList(
                                    orderDetailList.map((od: any) => {
                                        return (od.id == deliveryPart.id) ? {
                                            ...od,
                                            status: 'Delivered'
                                        } : od
                                    })
                                )
                                setDeliveredDialog(false)
                                setDeliveryPart({})
                            } else {
                                DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                            }
                        })
                    }}>
                        Delivered
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog to Add Vendor */}

            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "60vw!important",
                    },
                }}
                open={editDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setEditDialog(false)
                }}>
                <DialogTitle>Add vendor to {selectedPart?.part_name} - {selectedPart?.process_name}</DialogTitle>
                <DialogContent>
                    <Box>
                        <Grid2 container>
                            <Grid2 size={7}>
                                <Box>
                                    <CTable small striped >
                                        <CTableHead color='primary'>
                                            <CTableRow>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Vendor Name</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Cost</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Days</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Contact No.</CTableHeaderCell>
                                                <TableCell></TableCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {vendorList && vendorList.map((v: any) => (
                                                <TableRowStyled key={v.id}>
                                                    <TableCell>{v.vendor.vendor_name}</TableCell>
                                                    <TableCell>{v.part_process_vendor_price}</TableCell>
                                                    <TableCell>{v.part_process_vendor_delivery_time}</TableCell>
                                                    <TableCell>{v.vendor.vendor_mobile_no1}</TableCell>
                                                    <TableCell><div style={{
                                                        borderColor: 'teal', textAlign: 'center', color: 'teal',
                                                        borderRadius: '4px', cursor: 'pointer', borderWidth: 'thin', borderStyle: 'solid'
                                                    }} onClick={() => {
                                                        setSelectedVendor({
                                                            id: v.vendor.id, name: v.vendor.vendor_name, cost: v.part_process_vendor_price
                                                        })
                                                    }}>Select</div></TableCell>
                                                </TableRowStyled>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                </Box>
                            </Grid2>

                            <Grid2 size={1}>
                                <div style={{ width: '1px', backgroundColor: 'gray', height: '100%', marginLeft: 'auto', marginRight: 'auto' }}></div>
                            </Grid2>

                            <Grid2 size={4}>
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Vendor"
                                    name="vendor"
                                    required
                                    sx={{ mt: 1 }}
                                    value={selectedVendor?.name}
                                    error={!!errors?.vendor_id}
                                    helperText={errors?.vendor_id}
                                />
                                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Delivery Date"
                                        sx={{ width: '100%', height: '20px', mt: 1 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.delivery_date,
                                                helperText: errors?.delivery_date
                                            }
                                        }}
                                        value={selectedVendor ? dayjs(selectedVendor.delivery_date) : dayjs(new Date())}
                                        onChange={(e: any) => {
                                            setSelectedVendor({ ...selectedVendor, delivery_date: e })
                                        }}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Reminder Date"
                                        sx={{ width: '100%', height: '20px', mt: 3 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.reminder_date,
                                                helperText: errors?.reminder_date
                                            }
                                        }}
                                        value={selectedVendor ? dayjs(selectedVendor.reminder_date) : dayjs(new Date())}
                                        onChange={(e: any) => {
                                            setSelectedVendor({ ...selectedVendor, reminder_date: e })
                                        }}
                                    />
                                </LocalizationProvider> */}
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Cost"
                                    name="cost"
                                    required
                                    error={!!errors?.cost}
                                    helperText={errors?.cost}
                                    value={selectedVendor?.cost}
                                    sx={{ mt: 1 }}
                                    onChange={(e: any) => {
                                        setSelectedVendor({ ...selectedVendor, cost: e.target.value })
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditDialog(false)
                        setErrors({})
                        setSelectedPart({})
                        setSelectedVendor({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>

                    <Button variant="contained" onClick={() => {
                        setErrors({})
                        if (!selectedVendor?.id || selectedVendor?.id.length == 0) {
                            setErrors({ ...errors, vendor_id: 'Select vendor' })
                        } else if (!selectedVendor?.cost || selectedVendor?.cost.length == 0) {
                            setErrors({ ...errors, cost: 'Enter cost' })
                        }
                        // else if (!selectedVendor?.delivery_date || selectedVendor?.delivery_date.length == 0) {
                        //     setErrors({ ...errors, delivery_date: 'Select delivery date' })
                        // } else if (!selectedVendor?.reminder_date || selectedVendor?.reminder_date.length == 0) {
                        //     setErrors({ ...errors, reminder_date: 'Select reminder date' })
                        // } 
                        else {
                            dispatch(updateProductionMachinePart({
                                vendor_id: selectedVendor.id,
                                vendor_name: selectedVendor.name,
                                cost: selectedVendor.cost,
                                // delivery_date: selectedVendor.delivery_date,
                                // reminder_date: selectedVendor.reminder_date,
                                production_part_id: selectedPart.id,
                                status: 'Move to vendor'
                            })).unwrap().then((res: any) => {
                                if (res.message.includes('success')) {
                                    DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                                    setOrderDetailList(
                                        orderDetailList.map((od: any) => {
                                            return (od.id == selectedPart.id) ? {
                                                ...od,
                                                vendor_id: selectedVendor.id,
                                                vendor_name: selectedVendor.name,
                                                cost: selectedVendor.cost,
                                                status: 'Move to vendor'
                                                // delivery_date: moment(selectedVendor.delivery_date).format('MM-DD-YYYY'),
                                                // reminder_date: moment(selectedVendor.reminder_date).format('MM-DD-YYYY')
                                            } : od
                                        })
                                    )
                                    setEditDialog(false)
                                    setSelectedVendor({})
                                    setSelectedPart({})
                                    setErrors({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }
                        console.log(errors)
                    }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog to move to vendor */}

            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "60vw!important",
                    },
                }}
                open={moveToVendorDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setMoveToVendorDialog(false)
                }}>
                <DialogTitle>Move {moveToVendorData?.part_name} - {moveToVendorData?.process_name} to {selectedVendor?.name}</DialogTitle>
                <DialogContent>
                    <Box>
                        <Grid2 container>
                            <Grid2 size={7}>
                                <Box>
                                    <CTable small striped >
                                        <CTableHead color='primary'>
                                            <CTableRow>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Vendor Name</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Cost</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Days</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Contact No.</CTableHeaderCell>
                                                <TableCell></TableCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            <TableRowStyled>
                                                <TableCell>{selectedVendor?.name}</TableCell>
                                                <TableCell>{selectedVendor?.cost}</TableCell>
                                                <TableCell>{selectedVendor?.delivery_time}</TableCell>
                                                <TableCell>{selectedVendor?.mobile}</TableCell>
                                            </TableRowStyled>
                                        </CTableBody>
                                    </CTable>
                                </Box>
                            </Grid2>

                            <Grid2 size={1}>
                                <div style={{ width: '1px', backgroundColor: 'gray', height: '100%', marginLeft: 'auto', marginRight: 'auto' }}></div>
                            </Grid2>

                            <Grid2 size={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Delivery Date"
                                        sx={{ width: '100%', height: '20px', mt: 1 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.delivery_date,
                                                helperText: errors?.delivery_date
                                            }
                                        }}
                                        // value={selectedVendor ? dayjs(selectedVendor.delivery_date) : dayjs(new Date()).add(10, 'days')}
                                        value={selectedVendor?.delivery_date}
                                        onChange={(e: any) => {
                                            setSelectedVendor({ ...selectedVendor, delivery_date: e })
                                        }}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Reminder Date"
                                        sx={{ width: '100%', height: '20px', mt: 5 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.reminder_date,
                                                helperText: errors?.reminder_date
                                            }
                                        }}
                                        value={selectedVendor?.reminder_date}
                                        onChange={(e: any) => {
                                            setSelectedVendor({ ...selectedVendor, reminder_date: e })
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid2>
                        </Grid2>
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setMoveToVendorDialog(false)
                        setErrors({})
                        setSelectedPart({})
                        setSelectedVendor({})
                        setMoveToVendorData({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>

                    <Button variant="contained" onClick={() => {
                        setErrors({})
                        if (!selectedVendor?.id || selectedVendor?.id.length == 0) {
                            setErrors({ ...errors, vendor_id: 'Select vendor' })
                        } else if (!selectedVendor?.cost || selectedVendor?.cost.length == 0) {
                            setErrors({ ...errors, cost: 'Enter cost' })
                        }
                        // else if (!selectedVendor?.delivery_date || selectedVendor?.delivery_date.length == 0) {
                        //     setErrors({ ...errors, delivery_date: 'Select delivery date' })
                        // } else if (!selectedVendor?.reminder_date || selectedVendor?.reminder_date.length == 0) {
                        //     setErrors({ ...errors, reminder_date: 'Select reminder date' })
                        // } 
                        else {
                            dispatch(moveProductionMachinePartToVendor({
                                delivery_date: selectedVendor.delivery_date,
                                reminder_date: selectedVendor.reminder_date,
                                production_part_id: selectedPart.id,
                                status: 'Vendor acceptance pending'
                            })).unwrap().then((res: any) => {
                                if (res.message.includes('success')) {
                                    DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                                    setOrderDetailList(
                                        orderDetailList.map((od: any) => {
                                            return (od.id == selectedPart.id) ? {
                                                ...od,
                                                vendor_id: selectedVendor.id,
                                                vendor_name: selectedVendor.name,
                                                cost: selectedVendor.cost,
                                                delivery_date: selectedVendor.delivery_date,
                                                reminder_date: selectedVendor.reminder_date
                                            } : od
                                        })
                                    )
                                    setMoveToVendorDialog(false)
                                    setErrors({})
                                    setSelectedPart({})
                                    setSelectedVendor({})
                                    setMoveToVendorData({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }
                        console.log(errors)
                    }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for complete/ reschedule */}

            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "60vw!important",
                    },
                }}
                open={completeDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setCompleteDialog(false)
                }}>
                <DialogTitle>Update {moveToVendorData?.part_name} - {moveToVendorData?.process_name} Status</DialogTitle>
                <DialogContent>
                    <Box>
                        <Grid2 container>
                            <Grid2 size={5}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <TextField
                                        size='small'
                                        variant="outlined"
                                        fullWidth
                                        label="Remarks"
                                        multiline
                                        rows={4}
                                        name="remarks"
                                        sx={{ mt: 1 }}
                                        value={completeData?.remarks ? completeData?.remarks : ""}
                                        onChange={(e: any) => {
                                            setCompleteData({ ...completeData, remarks: e.target.value })
                                        }}
                                    />
                                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
                                        dispatch(completeProductPartProcess({
                                            production_part_id: completeData.id,
                                            remarks: completeData.remarks
                                        })).unwrap().then((res:any) => {
                                            DisplaySnackbar(res, 'success', enqueueSnackbar)
                                            setOrderDetailList(
                                                orderDetailList.map((od: any) => {
                                                    return (od.id == completeData.id) ? {
                                                        ...od,
                                                        status: 'Completed'
                                                    } : od
                                                })
                                            )
                                            setCompleteData({})
                                            setCompleteDialog(false)
                                        }).catch((err: any) => {
                                            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                        })
                                    }}>
                                        Complete
                                    </Button>
                                </Box>
                            </Grid2>

                            <Grid2 size={1}>
                                <div style={{ width: '1px', backgroundColor: 'gray', height: '100%', marginLeft: 'auto', marginRight: 'auto' }}></div>
                            </Grid2>

                            <Grid2 size={6}>
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Reschedule Remarks"
                                    multiline
                                    rows={4}
                                    name="remarks"
                                    sx={{ mt: 1 }}
                                    value={completeData?.scheduleRemarks ? completeData?.scheduleRemarks : ""}
                                    onChange={(e: any) => {
                                        setCompleteData({ ...completeData, scheduleRemarks: e.target.value })
                                    }}
                                />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Delivery Date"
                                        sx={{ width: '100%', height: '20px', mt: 1 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.delivery_date,
                                                helperText: errors?.delivery_date
                                            }
                                        }}
                                        value={completeData?.delivery_date ? dayjs(completeData?.delivery_date) : dayjs(new Date())}
                                        onChange={(e: any) => {
                                            setCompleteData({ ...completeData, delivery_date: e })
                                        }}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Reminder Date"
                                        sx={{ width: '100%', height: '20px', mt: 3 }}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!errors?.reminder_date,
                                                helperText: errors?.reminder_date
                                            }
                                        }}
                                        value={completeData?.reminder_date ? dayjs(completeData?.reminder_date) : dayjs(new Date())}
                                        onChange={(e: any) => {
                                            setCompleteData({ ...completeData, reminder_date: e })
                                        }}
                                    />
                                </LocalizationProvider>

                                <Button variant="contained" sx={{ mt: 4 }} onClick={() => {
                                    dispatch(rescheduleProductPartProcess({
                                        production_part_id: completeData.id,
                                        reschedule_reminder_date: completeData.reminder_date,
                                        reschedule_delivery_date: completeData.delivery_date,
                                        remarks: completeData.scheduleRemarks
                                    })).unwrap().then((res:any) => {
                                        DisplaySnackbar(res, 'success', enqueueSnackbar)
                                        setCompleteData({})
                                        setCompleteDialog(false)
                                    }).catch((err: any) => {
                                        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                    })
                                }}>
                                    Reschedule
                                </Button>
                            </Grid2>
                        </Grid2>
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setCompleteDialog(false)
                        setErrors({})
                        setCompleteData({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog to Add supplier */}

            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "60vw!important",
                    },
                }}
                open={addBODialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setAddBODialog(false)
                }}>
                <DialogTitle>Add Supplier to {selectedBO?.bought_out_name}</DialogTitle>
                <DialogContent>
                    <Box>
                        <Grid2 container>
                            <Grid2 size={7}>
                                <Box>
                                    <CTable small striped >
                                        <CTableHead color='primary'>
                                            <CTableRow>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Supplier Name</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Cost</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Days</CTableHeaderCell>
                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Contact No.</CTableHeaderCell>
                                                <TableCell></TableCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {supplierList && supplierList.filter((bs:any)=> bs.bought_out.id == selectedBO?.bought_out_id).map((s: any) => (
                                                <TableRowStyled key={s.id}>
                                                    <TableCell>{s.supplier.supplier_name}</TableCell>
                                                    <TableCell>{s.cost}</TableCell>
                                                    <TableCell>{s.delivery_time}</TableCell>
                                                    <TableCell>{s.supplier.supplier_mobile_no1}</TableCell>
                                                    <TableCell><div style={{
                                                        borderColor: 'teal', textAlign: 'center', color: 'teal',
                                                        borderRadius: '4px', cursor: 'pointer', borderWidth: 'thin', borderStyle: 'solid'
                                                    }} onClick={() => {
                                                        setSelectedSupplier({
                                                            id:s.supplier.id, name: s.supplier.supplier_name, cost: s.cost
                                                        })
                                                    }}>Select</div></TableCell>
                                                </TableRowStyled>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                </Box>
                            </Grid2>

                            <Grid2 size={1}>
                                <div style={{ width: '1px', backgroundColor: 'gray', height: '100%', marginLeft: 'auto', marginRight: 'auto' }}></div>
                            </Grid2>

                            <Grid2 size={4}>
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Supplier"
                                    name="Supplier"
                                    required
                                    sx={{ mt: 1 }}
                                    value={selectedSupplier?.name}
                                    error={!!errors?.supplier_id}
                                    helperText={errors?.supplier_id}
                                />
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Cost"
                                    name="cost"
                                    required
                                    error={!!errors?.cost}
                                    helperText={errors?.cost}
                                    value={selectedSupplier?.cost}
                                    sx={{ mt: 1 }}
                                    onChange={(e: any) => {
                                        setSelectedSupplier({ ...selectedVendor, cost: e.target.value })
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAddBODialog(false)
                        setErrors({})
                        setSelectedBO({})
                        setSelectedSupplier({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>

                    <Button variant="contained" onClick={() => {
                        setErrors({})
                        if (!selectedSupplier?.id || selectedSupplier?.id.length == 0) {
                            setErrors({ ...errors, supplier_id: 'Select supplier' })
                        } else if (!selectedSupplier?.cost || selectedSupplier?.cost.length == 0) {
                            setErrors({ ...errors, cost: 'Enter cost' })
                        }

                        else {
                            dispatch(updateProductionMachineBO({
                                supplier_id: selectedSupplier.id,
                                supplier_name: selectedSupplier.name,
                                cost: selectedSupplier.cost,
                                // delivery_date: selectedVendor.delivery_date,
                                // reminder_date: selectedVendor.reminder_date,
                                production_part_id: selectedBO.id,
                                status: 'Payment Pending'
                            })).unwrap().then((res: any) => {
                                if (res.message.includes('success')) {
                                    DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                                    setOrderDetailBOList(
                                        orderDetailBOList.map((od: any) => {
                                            return (od.id == selectedBO.id) ? {
                                                ...od,
                                                supplier_id: selectedSupplier.id,
                                                supplier_name: selectedSupplier.name,
                                                cost: selectedSupplier.cost,
                                                status: 'Payment Pending'
                                                // delivery_date: moment(selectedVendor.delivery_date).format('MM-DD-YYYY'),
                                                // reminder_date: moment(selectedVendor.reminder_date).format('MM-DD-YYYY')
                                            } : od
                                        })
                                    )
                                    setAddBODialog(false)
                                    setSelectedSupplier({})
                                    setSelectedBO({})
                                    setErrors({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }
                        console.log(errors)
                    }}>Save</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
