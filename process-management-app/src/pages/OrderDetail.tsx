import { useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid2, Input, InputAdornment, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search, Settings } from '@mui/icons-material';
import { createNewMachine, fetchBoughtOutList, fetchMachineList, fetchVendorAttachment, getMachineDetails } from '../slices/machineSlice';
import { nav_assembly, nav_boughtouts, nav_machines, nav_orders, TableRowStyled } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from "react-icons/fa6";
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { closeAssembly, closeBoughtoutAssembly, closePartAssembly, completeProductPartProcess, deliverProductionMachinePart, fetchOrdersDetail, fetchOrdersList, moveProductionMachinePartToVendor, rescheduleProductPartProcess, updateProductionMachineBO, updateProductionMachinePart } from '../slices/quotationSlice';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import moment from 'moment';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
  } from 'material-react-table';

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
    const [assemblyCloseDialog, setAssemblyCloseDialog] = useState(false)
    const [assemblyPart, setAssemblyPart] = useState<any>()
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
            dispatch(fetchOrdersDetail({ order_id: state?.order_id, type: state?.type })).unwrap()
        }
    }, [state])

    const [errors, setErrors] = useState<any>()
    const [machineId, setMachineId] = useState("")
    const [orderId, setOrderId] = useState("")
    const [currentTab, setCurrentTab] = useState(0)
    const [viewMachineDetailDialog, setViewMachineDetailDialog] = useState(false)
    const [subAssemblyList, setSubAssemblyList] = useState<Array<{ id: string, name: string, sub_assembly_id: string, qty: number }>>([]);
    const [mainAssemblyList, setMainAssemblyList] = useState<Array<{ id: number, name: string, serial_no: string }>>([]);
    const [sectionAssemblyList, setSectionAssemblyList] = useState<Array<{ id: number, name: string, serial_no: string }>>([]);
    const [mainAssemblySub, setMainAssemblySub] = useState<Array<{ id: number, main_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
    const [mainAssemblyParts, setMainAssemblyParts] = useState<Array<{ id: number, main_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
    const [mainAssemblyBoughtouts, setMainAssemblyBoughtouts] = useState<Array<{ id: number, main_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])
    const [sectionAssemblySub, setSectionAssemblySub] = useState<Array<{ id: number, section_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
    const [sectionAssemblyParts, setSectionAssemblyParts] = useState<Array<{ id: number, section_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
    const [sectionAssemblyBoughtouts, setSectionAssemblyBoughtouts] = useState<Array<{ id: number, section_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])
    const [sectionAssemblyMain, setSectionAssemblyMain] = useState<Array<{ id: number, section_assembly_id: number, main_assembly_id: number, main_assembly_name: string, qty: number }>>([])

    const viewMachineDetail = () => {
        dispatch(getMachineDetails(machineId)).unwrap()
            .then((res) => {
                setViewMachineDetailDialog(true)
                //   setFormData({
                //     model_no: res.model_no,
                //     machine_name: res.machine_name,
                //     spindles: res.spindles,
                //     side_type: res.side_type,
                //     max_spindles: res.max_spindles,
                //     min_spindles: res.min_spindles
                //   })
                res.machine_sub_assembly?.map((sub: any) => {
                    setSubAssemblyList([...subAssemblyList, { id: sub.id, sub_assembly_id: sub.sub_assembly.id, qty: sub.qty, name: sub.sub_assembly.sub_assembly_name }])
                })
                res.main_assembly?.map((main: any) => {
                    setMainAssemblyList([...mainAssemblyList, { id: main.id, name: main.main_assembly_name, serial_no: main.serial_no }])
                    const maps: any = []
                    const bos: any = []
                    const subs: any = []
                    main.main_assembly_detail?.map((detail: any) => {
                        if (detail.part) {
                            maps.push({
                                id: detail.id,
                                main_assembly_id: main.id,
                                part_id: detail.part.id,
                                part_name: detail.part.part_name,
                                qty: detail.qty
                            })
                        } else if (detail.bought_out) {
                            bos.push({
                                id: detail.id,
                                main_assembly_id: main.id,
                                bought_out_id: detail.bought_out.id,
                                bought_out_name: detail.bought_out.bought_out_name,
                                qty: detail.qty
                            })
                        } else if (detail.sub_assembly) {
                            subs.push({
                                id: detail.id,
                                main_assembly_id: main.id,
                                sub_assembly_id: detail.sub_assembly.id,
                                sub_assembly_name: detail.sub_assembly.sub_assembly_name,
                                qty: detail.qty
                            })
                        }
                    })
                    setMainAssemblyParts(maps)
                    setMainAssemblyBoughtouts(bos)
                    setMainAssemblySub(subs)
                })

                res.section_assembly?.map((section: any) => {
                    setSectionAssemblyList([...sectionAssemblyList, { id: section.id, name: section.section_assembly_name, serial_no: section.serial_no }])
                    const maps: any = []
                    const bos: any = []
                    const subs: any = []
                    const mains: any = []
                    section.section_assembly_detail?.map((detail: any) => {
                        if (detail.part) {
                            maps.push({
                                id: detail.id,
                                section_assembly_id: section.id,
                                part_id: detail.part.id,
                                part_name: detail.part.part_name,
                                qty: detail.qty
                            })
                        } else if (detail.bought_out) {
                            bos.push({
                                id: detail.id,
                                section_assembly_id: section.id,
                                bought_out_id: detail.bought_out.id,
                                bought_out_name: detail.bought_out.bought_out_name,
                                qty: detail.qty
                            })
                        } else if (detail.sub_assembly) {
                            subs.push({
                                id: detail.id,
                                section_assembly_id: section.id,
                                sub_assembly_id: detail.sub_assembly.id,
                                sub_assembly_name: detail.sub_assembly.sub_assembly_name,
                                qty: detail.qty
                            })
                        } else if (detail.main_assembly) {
                            mains.push({
                                id: detail.id,
                                section_assembly_id: section.id,
                                main_assembly_id: detail.main_assembly.id,
                                main_assembly_name: detail.main_assembly.main_assembly_name,
                                qty: detail.qty
                            })
                        }
                    })
                    setSectionAssemblyParts(maps)
                    setSectionAssemblyBoughtouts(bos)
                    setSectionAssemblySub(subs)
                    setSectionAssemblyMain(mains)
                })
            })
    }

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        //column definitions...
        () => [
          {
            header: 'Part Name',
            accessorKey: 'part_name',
          },
          {
            header: 'Qty',
            accessorKey: 'order_qty',
          },
          {
            header: 'Process Name',
            accessorKey: 'process_name',
          },
          {
            header: 'Vendor Name',
            accessorKey: 'vendor_name',
            Cell: (row: any) => (
                <Box>
                    {row?.row?.original?.vendor_name ? row?.row?.original?.vendor_name : <div style={{
                    backgroundColor: 'teal', textAlign: 'center', color: 'white',
                    borderRadius: '4px', cursor: 'pointer'
                }} onClick={() => {
                    setSelectedPart({ id: row?.row?.original?.id, part_name: row?.row?.original?.part_name, 
                        process_name: row?.row?.original?.process_name })
                    const processVendors = orderDetail?.parts?.partVendors?.filter((pv: any) =>
                        pv.part.id == row?.row?.original?.part_id && pv.process.id == row?.row?.original?.process_id
                    )
                    if (processVendors?.length > 0) {
                        setVendorList(processVendors[0].part_process_vendor_list)
                        setEditDialog(true)
                    }
                }}>Add Vendor</div>}
                </Box>   
            )
          },
          {
            header: 'Delivery Date',
            accessorKey: 'delivery_date',
            Cell: (row:any) => (<>{row?.row?.original?.delivery_date ? moment(row?.row?.original?.delivery_date).format('DD-MM-YYYY') : ''}</>)
          },
          {
            header: 'Reminder Date',
            accessorKey: 'reminder_date',
            Cell: (row:any) => (<>{row?.row?.original?.reminder_date ? moment(row?.row?.original?.reminder_date).format('DD-MM-YYYY') : ''}</>)
          },
          {
            header: 'Status',
            accessorKey: 'status',
            Cell: ( row:any ) => (
                <Box 
                sx={{
                    borderColor: row?.row?.original?.status.includes('Pending') ? '#F95454' : row?.row?.original?.status.includes('Progress') ? '#006BFF' : '#347928',
                    color: row?.row?.original?.status.includes('Pending') ? '#F95454' : row?.row?.original?.status.includes('Progress') ? '#006BFF' : '#347928',
                    borderStyle: 'solid', borderWidth: 'thin',
                    textAlign: 'center',
                    borderRadius: '4px', cursor: row?.row?.original?.status.includes('Progress') ? 'pointer' : 'default',
                    ":hover": {
                        backgroundColor: row?.row?.original?.status.includes('Progress') ? '#006BFF' : 'white',
                        color: row?.row?.original?.status.includes('Progress') ? 'white' :
                        row?.row?.original?.status.includes('Pending') ? '#F95454' : '#347928'
                    }
                }} 
                onClick={() => {
                    if (state?.type === "order") {
                        if (row?.row?.original?.status.includes('Progress')) {
                            // setDeliveredDialog(true)
                            setCompleteDialog(true)
                            setCompleteData({ id: row?.row?.original?.id, delivery_date: row?.row?.original?.delivery_date, 
                                reminder_date: row?.row?.original?.reminder_date, part_name: row?.row?.original?.part_name, 
                                process_name: row?.row?.original?.process_name })
                            // setDeliveryPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                        } else if (row?.row?.original?.status.toLowerCase() == 'move to vendor') {
                            const processVendors = orderDetail.parts?.partVendors.filter((pv: any) =>
                                pv.part.id == row.part_id && pv.process.id == row?.row?.original?.process_id
                            )
                            if (processVendors.length > 0) {
                                const process_vendor = processVendors[0].part_process_vendor_list.find((v: any) => v.vendor.id == row.vendor_id)
                                const deliveryDate = dayjs(new Date()).add(process_vendor.part_process_vendor_delivery_time, 'days')
                                const reminderDate = deliveryDate.add(-1, 'day')
                                setSelectedPart({ id: row?.row?.original?.id, part_name: row?.row?.original?.part_name, 
                                    process_name: row?.row?.original?.process_name })
                                setSelectedVendor({
                                    id: row?.row?.original?.vendor_id, name: process_vendor.vendor.vendor_name, cost: process_vendor.part_process_vendor_price,
                                    delivery_time: process_vendor.part_process_vendor_delivery_time, mobile: process_vendor.vendor.vendor_mobile_no1,
                                    delivery_date: deliveryDate, reminder_date: reminderDate
                                })
                                setMoveToVendorData({
                                    id: row?.row?.original?.id, part_name: row?.row?.original?.part_name, process_name: row?.row?.original?.process_name,
                                    vendor_id: row?.row?.original?.vendor_id
                                })
                                setMoveToVendorDialog(true)
                            }

                        }
                    } else {
                        if(row.status.includes('Assembly In-Progress')){
                            setAssemblyCloseDialog(true)
                            setAssemblyPart({ ...row?.row?.original, type: 'part' })
                        }
                    }
                }}>{row?.row?.original?.status}</Box>
            ) 
          },
          {
            header: '',
            accessorKey: 'id',
            size: 25,
            Cell: (row: any) => (
                <FaWhatsapp color='green' onClick={() => {
                    if (row?.row?.original?.vendor_id) {
                        dispatch(fetchVendorAttachment({ vendor_id: row?.row?.original?.vendor_id, 
                            part_id: row?.row?.original?.part_id })).unwrap().then((res: any) => {
                            if (res.attachments?.length > 0) {
                                const link = res.attachments.map((att: any) => `${process.env.REACT_APP_API_URL}/machine/loadAttachment/${att.file_name}`).join(',')
                                const text = `Hi ${res.vendor.vendor_name}
                                Accept the order using following link ${process.env.REACT_APP_UI_URL}/vendorAccept?id=${row?.row?.original?.id} 
                                Get the drawings from following link ${link}`
                                console.log("-----------", text)
                                window.open(`https://wa.me/${res.vendor.vendor_mobile_no1}?text=${text}`, '_blank')?.focus()
                            } else {
                                DisplaySnackbar('No drawings available to share', 'error', enqueueSnackbar)
                            }
                        })
                    }
                }} />
            )
          }
        ],
        [],
        //end
      );

      const table = useMaterialReactTable({
        columns,
        data: orderDetailList && orderDetailList.length > 0 ? orderDetailList : [],
        enableGrouping: true,
        groupedColumnMode: 'remove',
        initialState: {
          grouping: ['part_name']
        },
        muiTableContainerProps: { sx: { maxHeight: '800px' } },
        enablePagination: false,
        enableBottomToolbar: false,
        enableTopToolbar: false,
        muiTableHeadCellProps: {
            sx: {
                backgroundColor:'#fadbda'
            }
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
            //   backgroundColor: row.index % 2 == 0 ? 'white' : '#F2F2F2',
              '&:hover': {
                    backgroundColor: 'lightskyblue',
                }
            },
          }),
      });

    useEffect(() => {
        if (orderDetail?.parts?.orderDetail) {
            setHeaderDetail({
                status: orderDetail?.parts?.orderDetail[0].order.status,
                quotationNo: orderDetail.parts?.orderDetail[0]?.order.quotation.quotation_no,
                machineName: orderDetail.parts?.orderDetail[0]?.order.machine_name,
                customerName: orderDetail.parts?.orderDetail[0]?.order.customer.customer_name,
                cost: orderDetail.parts?.orderDetail[0]?.order.quotation.approved_cost,
                qty: orderDetail.parts?.orderDetail[0]?.order.quotation.qty
            })
            setOrderDetailList(orderDetail.parts?.orderDetail)
            setOrderDetailBOList(orderDetail.boughtouts?.orderDetailBoughtout)
            setSupplierList(orderDetail.boughtouts?.boughtoutSupplier)
            setMachineId(orderDetail.parts?.orderDetail[0]?.machine_id)
            setOrderId(orderDetail.parts?.orderDetail[0]?.order.id)
        }
    }, [orderDetail])

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={state?.type === "assembly" ? nav_assembly : nav_orders} />

            <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>

                <Grid2 size={2}>
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

                <Grid2 size={1}>
                    <Typography variant='subtitle2' color={'grey'}>Cost</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.cost : ""}</Typography>
                </Grid2>

                <Grid2 size={1}>
                    <Typography variant='subtitle2' color={'grey'}>Qty</Typography>
                    <Typography variant='subtitle1'>{headerDetail ? headerDetail.qty : ""}</Typography>
                </Grid2>

                {state?.type == "assembly" && <Grid2 size={1}>
                    <Button onClick={(e: any) => {
                        viewMachineDetail()
                    }}>View Machine Detail</Button>
                </Grid2>}

                {state?.type == "assembly" && <Grid2 size={2}>
                    <Button variant='contained' onClick={(e: any) => {
                        if(headerDetail?.status !== "Assembly Completed"){
                            dispatch(closeAssembly({
                                order_id: orderId
                            })).unwrap().then((res:any) => {
                                if(res.message.includes('success')){
                                    DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                                }else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }                        
                    }}>{headerDetail?.status == "Assembly Completed" ? "Assembly Completed" : "Complete Assembly"}</Button>
                </Grid2>}

                <Grid2 size={12}>
                    <MaterialReactTable table={table} />
                </Grid2>

                <Grid2 size={{ xs: 6, md: 12 }}>
                    {/* <TableContainer component={Paper}>
                        <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Part Name</TableCell>
                                    <TableCell>Qty</TableCell>
                                    {state?.type == "order" && <TableCell>Process Name</TableCell>}
                                    {state?.type == "order" && <TableCell>Vendor Name</TableCell>}
                                    <TableCell>Cost</TableCell>
                                    {state?.type == "order" && <TableCell>Delivery Date</TableCell>}
                                    {state?.type == "order" && <TableCell>Reminder Date</TableCell>}
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                    {state?.type == "assembly" && <TableCell></TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderDetailList && orderDetailList.length > 0 ? orderDetailList.map((row: any, index: number) => (
                                    <TableRowStyled key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.part_name}</TableCell>
                                        <TableCell>{row.order_qty}</TableCell>
                                        {state?.type == "order" && <TableCell>{row.process_name}</TableCell>}
                                        {state?.type == "order" && <TableCell>
                                            {row?.vendor_name ? row.vendor_name : <div style={{
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
                                        </TableCell>}
                                        <TableCell>{row.cost}</TableCell>
                                        {state?.type == "order" && <TableCell>{row.delivery_date ? moment(row.delivery_date).format('DD-MM-YYYY') : ''}</TableCell>}
                                        {state?.type == "order" && <TableCell>{row.reminder_date ? moment(row.reminder_date).format('DD-MM-YYYY') : ''}</TableCell>}
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
                                            if (state?.type === "order") {
                                                if (row.status.includes('Progress')) {
                                                    // setDeliveredDialog(true)
                                                    setCompleteDialog(true)
                                                    setCompleteData({ id: row.id, delivery_date: row.delivery_date, reminder_date: row.reminder_date, part_name: row.part_name, process_name: row.process_name })
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
                                            } else {
                                                if(row.status.includes('Assembly In-Progress')){
                                                    setAssemblyCloseDialog(true)
                                                    setAssemblyPart({ ...row, type: 'part' })
                                                }
                                            }
                                        }}>{row.status}</Box></TableCell>
                                        {state?.type == "order" && <TableCell><FaWhatsapp color='green' onClick={() => {
                                            if (row.vendor_id) {
                                                dispatch(fetchVendorAttachment({ vendor_id: row.vendor_id, part_id: row.part_id })).unwrap().then((res: any) => {
                                                    if (res.attachments?.length > 0) {
                                                        const link = res.attachments.map((att: any) => `${process.env.REACT_APP_API_URL}/machine/loadAttachment/${att.file_name}`).join(',')
                                                        const text = `Hi ${res.vendor.vendor_name}
                                                        Accept the order using following link ${process.env.REACT_APP_UI_URL}/vendorAccept?id=${row.id} 
                                                        Get the drawings from following link ${link}`
                                                        console.log("-----------", text)
                                                        window.open(`https://wa.me/${res.vendor.vendor_mobile_no1}?text=${text}`, '_blank')?.focus()
                                                        console.log(res)
                                                    } else {
                                                        DisplaySnackbar('No drawings available to share', 'error', enqueueSnackbar)
                                                    }
                                                })
                                            }
                                        }} /></TableCell>}
                                        {state?.type == "assembly" && <TableCell></TableCell>}
                                        {state?.type == "assembly" && <TableCell>View Part Diagrams</TableCell>}
                                    </TableRowStyled>
                                )) : <TableRow key={0}>
                                    <TableCell colSpan={9} align='center'>No Data</TableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer> */}
                </Grid2>

                {/* Boughtout supplier */}

                <Grid2 size={{ xs: 6, md: 12 }} sx={{ mt: 3 }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Boughtout Name</TableCell>
                                    <TableCell>Qty</TableCell>
                                    {state?.type == "order" && <TableCell>Supplier Name</TableCell>}
                                    <TableCell>Cost</TableCell>
                                    {state?.type == "order" && <TableCell>Delivery Date</TableCell>}
                                    {state?.type == "order" && <TableCell>Reminder Date</TableCell>}
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                    {state?.type == "assembly" && <TableCell></TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderDetailBOList && orderDetailBOList.length > 0 ? orderDetailBOList.map((row: any, index: number) => (
                                    <TableRowStyled key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.bought_out_name}</TableCell>
                                        <TableCell>{row.order_qty}</TableCell>
                                        {state?.type == "order" && <TableCell>
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
                                        </TableCell>}
                                        <TableCell>{row.cost}</TableCell>
                                        {state?.type == "order" && <TableCell>{row.delivery_date ? moment(row.delivery_date).format('DD-MM-YYYY') : ''}</TableCell>}
                                        {state?.type == "order" && <TableCell>{row.reminder_date ? moment(row.reminder_date).format('DD-MM-YYYY') : ''}</TableCell>}
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
                                            if (state?.type === "order") {
                                                if (row.status.includes('Progress')) {
                                                    // setDeliveredDialog(true)
                                                    setCompleteDialog(true)
                                                    setCompleteData({ id: row.id })
                                                    // setDeliveryPart({ id: row.id, part_name: row.part_name, process_name: row.process_name })
                                                } else if (row.status.toLowerCase() == 'move to vendor') {
                                                    const processVendors = orderDetail.parts?.orderDetail?.partVendors.filter((pv: any) =>
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
                                            } else {
                                                if(row.status.includes('Assembly In-Progress')){
                                                    setAssemblyCloseDialog(true)
                                                    setAssemblyPart({ ...row, type: 'boughtout' })
                                                }
                                            }
                                        }}>{row.status}</Box></TableCell>
                                        {state?.type == "assembly" && <TableCell></TableCell>}
                                        {state?.type == "assembly" && <TableCell>View Part Diagrams</TableCell>}
                                        {state?.type == "order" && <TableCell><FaWhatsapp color='green' onClick={() => {
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
                                        }} /></TableCell>}
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
                <DialogTitle>Update {completeData?.part_name} - {completeData?.process_name} Status</DialogTitle>
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
                                        })).unwrap().then((res: any) => {
                                            DisplaySnackbar(res, 'success', enqueueSnackbar)
                                            setOrderDetailList(
                                                orderDetailList.map((od: any) => {
                                                    return (od.id == completeData.id) ? {
                                                        ...od,
                                                        status: 'Vendor process completed'
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
                                    })).unwrap().then((res: any) => {
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
                                            {supplierList && supplierList.filter((bs: any) => bs.bought_out.id == selectedBO?.bought_out_id).map((s: any) => (
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
                                                            id: s.supplier.id, name: s.supplier.supplier_name, cost: s.cost
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

            {/* Dialog for machine detail */}
            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "60vw!important",
                    },
                }}
                open={viewMachineDetailDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setViewMachineDetailDialog(false)
                }}>
                <DialogTitle>Machine Detail</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Tabs value={currentTab} orientation="vertical" onChange={(e, newValue) => {
                            setCurrentTab(newValue)
                        }} variant='fullWidth'>
                            <Tab label="Sub Assembly" value={0} />
                            <Tab label="Main Assembly" value={1} />
                            <Tab label="Section Assembly" value={2} />
                        </Tabs>

                        {/* Sub Assembly Tab */}
                        {currentTab == 0 && <Box>
                            {subAssemblyList && subAssemblyList.map((sa) => {
                                return (
                                    <Grid2 container sx={{ mt: 2 }}>
                                        <Grid2 size={3}>
                                            <TextField
                                                sx={{ ml: 1 }}
                                                size='small'
                                                variant="outlined"
                                                fullWidth
                                                required
                                                label="Sub Assembly"
                                                name="serial_no"
                                                value={sa.name}
                                            />
                                        </Grid2>
                                        <Grid2 size={3} sx={{ ml: 2 }}>
                                            <TextField
                                                sx={{ ml: 1 }}
                                                size='small'
                                                variant="outlined"
                                                fullWidth
                                                required
                                                label="Qty"
                                                name="serial_no"
                                                value={sa.qty}
                                            />
                                        </Grid2>

                                        <Grid2 size={3} sx={{ ml: 2 }}>

                                        </Grid2>
                                    </Grid2>
                                )
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    setErrors({})
                                }}>
                                Add New Sub Assembly
                            </Button>
                        </Box>}

                        {/* Main Assembly Tab */}
                        {currentTab == 1 && <Box>
                            {mainAssemblyList && mainAssemblyList.map((sa) => {
                                return (
                                    <Card sx={{ padding: 3, mt: 1 }}>
                                        <Grid2 container>
                                            <Grid2 size={10}>
                                                <Card sx={{ display: 'flex', flexDirection: 'row', padding: 1, backgroundColor: '#3A6D8C' }}>
                                                    <h6 style={{ marginTop: 'auto', marginBottom: 'auto', color: 'white' }}>Name: <b>{sa.name}</b></h6>
                                                    <h6 style={{ margin: 'auto', color: 'white' }}>Serial No: <b>{sa.serial_no}</b></h6>
                                                </Card>
                                            </Grid2>

                                            <Grid2 size={10} sx={{ mt: 1 }}>
                                                {mainAssemblyParts.filter((sap: any) => sap.main_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='primary'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {mainAssemblyParts.filter((sap: any) => sap.main_assembly_id == sa.id)?.map((part) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{part.part_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{part.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={10}>
                                                {mainAssemblyBoughtouts.filter((sab: any) => sab.main_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='success'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {mainAssemblyBoughtouts.filter((sab: any) => sab.main_assembly_id == sa.id)?.map((boughtout) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{boughtout.bought_out_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{boughtout.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={10}>
                                                {mainAssemblySub.filter((sab: any) => sab.main_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='danger'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {mainAssemblySub.filter((sab: any) => sab.main_assembly_id == sa.id)?.map((sub) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{sub.sub_assembly_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{sub.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={4} sx={{ ml: 3, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>

                                            </Grid2>
                                        </Grid2>
                                    </Card>)
                            })}
                        </Box>}

                        {/* Section Assembly Tab */}
                        {currentTab == 2 && <Box>
                            {sectionAssemblyList && sectionAssemblyList.map((sa) => {
                                return (
                                    <Card sx={{ padding: 3, mt: 1 }}>
                                        <Grid2 container>
                                            <Grid2 size={10}>
                                                <Card sx={{ display: 'flex', flexDirection: 'row', padding: 1, backgroundColor: '#664343' }}>
                                                    <h6 style={{ marginTop: 'auto', marginBottom: 'auto', color: 'white' }}>Name: <b>{sa.name}</b></h6>
                                                    <h6 style={{ margin: 'auto', color: 'white' }}>Serial No: <b>{sa.serial_no}</b></h6>
                                                </Card>
                                            </Grid2>

                                            <Grid2 size={10} sx={{ mt: 1 }}>
                                                {sectionAssemblyParts.filter((sap: any) => sap.section_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='primary'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {sectionAssemblyParts.filter((sap: any) => sap.section_assembly_id == sa.id)?.map((part) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{part.part_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{part.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={10}>
                                                {sectionAssemblyBoughtouts.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='success'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {sectionAssemblyBoughtouts.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((boughtout) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{boughtout.bought_out_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{boughtout.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={10}>
                                                {sectionAssemblySub.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='danger'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {sectionAssemblySub.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((sub) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{sub.sub_assembly_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{sub.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>

                                            <Grid2 size={10}>
                                                {sectionAssemblyMain.filter((sab: any) => sab.section_assembly_id == sa.id)?.length > 0 &&
                                                    <CTable small striped>
                                                        <CTableHead color='warning'>
                                                            <CTableRow>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Main Assembly Name</CTableHeaderCell>
                                                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                                            </CTableRow>
                                                        </CTableHead>
                                                        <CTableBody>
                                                            {sectionAssemblyMain.filter((sab: any) => sab.section_assembly_id == sa.id)?.map((main) => {
                                                                return (<CTableRow>
                                                                    <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{main.main_assembly_name}</CTableDataCell>
                                                                    <CTableDataCell style={{ width: '20%' }}>{main.qty}</CTableDataCell>
                                                                </CTableRow>)
                                                            })}
                                                        </CTableBody>
                                                    </CTable>}
                                            </Grid2>
                                        </Grid2>
                                    </Card>)
                            })}
                        </Box>}
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setViewMachineDetailDialog(false)
                    }} sx={{ color: '#bb0037' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Assembly close dialog */}
            <Dialog
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: "30vw!important",
                    },
                }}
                open={assemblyCloseDialog}
                onClose={(event, reason) => {
                    if (reason == "backdropClick") {
                        return
                    }
                    setAssemblyCloseDialog(false)
                }}>
                <DialogTitle>Assemble Part/ Boughtout</DialogTitle>
                <DialogContent>
                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        label="Assembly Remarks"
                        multiline
                        rows={4}
                        name="remarks"
                        sx={{ mt: 1 }}
                        value={assemblyPart?.remarks ? assemblyPart?.remarks : ""}
                        onChange={(e: any) => {
                            setAssemblyPart({ ...assemblyPart, remarks: e.target.value })
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAssemblyCloseDialog(false)
                        setErrors({})
                        setAssemblyPart({})
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (assemblyPart.type === "part") {
                            dispatch(closePartAssembly({
                                order_id: orderId,
                                part_name: assemblyPart.part_name,
                                remarks: assemblyPart.remarks
                            })).unwrap().then((res: any) => {
                                if (res.message.includes('success')) {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    setOrderDetailList(
                                        orderDetailList.map((od: any) => {
                                            return (od.id == assemblyPart.id) ? {
                                                ...od,
                                                status: 'Assembly closed'
                                            } : od
                                        })
                                    )
                                    setAssemblyCloseDialog(false)
                                    setErrors({})
                                    setAssemblyPart({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        } else {
                            dispatch(closeBoughtoutAssembly({
                                order_id: orderId,
                                production_boughtout_id: assemblyPart.id,
                                bought_out_name: assemblyPart.bought_out_name,
                                remarks: assemblyPart.remarks
                            })).unwrap().then((res: any) => {
                                if (res.message.includes('success')) {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    setOrderDetailBOList(
                                        orderDetailBOList.map((od: any) => {
                                            return (od.id == assemblyPart.id) ? {
                                                ...od,
                                                status: 'Assembly Closed'
                                            } : od
                                        })
                                    )
                                    setAssemblyCloseDialog(false)
                                    setErrors({})
                                    setAssemblyPart({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }
                    }}>
                        Close Assembly
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
