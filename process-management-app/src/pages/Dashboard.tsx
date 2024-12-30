import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Card, CardContent, Typography, List, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import moment from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';
import { nav_dashboard, TableRowStyled } from '../constants';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { closeOrder, fetchDashboardDetail, fetchDeliveryDateList, fetchOrderParts, fetchPartsInStores, fetchPendingDeliveryBOs, fetchPendingDeliveryParts, fetchPendingPaymentBOs, fetchReminderDateList, fetchReminderQuotations, updateBoughtoutPayment } from '../slices/dashboardSlice';
import SidebarNav from './SidebarNav';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { AdminRole, getPermission, getRole, StoreRole, SuperAdminRole } from '../utils/Permissions';
import { SiApplearcade } from 'react-icons/si';
import { GrInProgress } from "react-icons/gr";
import { FaUsersLine } from 'react-icons/fa6';
import { HiServer } from "react-icons/hi";
import { SiTicktick } from "react-icons/si";
import { deliverProductionMachineBO, deliverProductionMachinePart, fetchOrdersList, moveBoughtoutToAssembly, movePartToAssembly } from '../slices/quotationSlice';
import { PieChart } from '@mui/x-charts/PieChart';
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const Dashboard = () => {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const { dashboardDetail } = useAppSelector(
        (state) => state.dashboard
    );

    const [pendingPaymentItem, setPendingPaymentItem] = useState<any>()
    const [updatePaymentDialog, setUpdatePaymentDialog] = useState(false)
    const [pendingPaymentsList, setPendingPaymentsList] = useState<any[]>()

    const [pendingDeliveryItem, setPendingDeliveryItem] = useState<any>()
    const [assemblyItem, setAssemblyItem] = useState<any>()

    const [updateDeliveryDialog, setUpdateDeliveryDialog] = useState(false)
    const [updateAssemblyDialog, setUpdateAssemblyDialog] = useState(false)
    const [updateDeliveryBODialog, setUpdateDeliveryBODialog] = useState(false)
    const [updateAssemblyBODialog, setUpdateAssemblyBODialog] = useState(false)

    const [pendingDeliveryList, setPendingDeliveryList] = useState<any[]>()
    const [pendingDeliveryBOList, setPendingDeliveryBOList] = useState<any[]>()

    const [reminderDateList, setReminderDateList] = useState<any[]>()
    const [deliveryDateList, setDeliveryDateList] = useState<any[]>()
    const [ordersCloseList, setOrdersCloseList] = useState<any[]>()

    const [currentRole, setCurrentRole] = useState()

    const [quotationReminderList, setQuotationReminderList] = useState<any[]>()
    const [pendingOrderParts, setPendingOrderParts] = useState<any[]>([])
    const [pendingOrderBOs, setPendingOrderBOs] = useState<any[]>()

    const [partGraph, setPartGraph] = useState<any[]>([])
    const [boughtoutGraph, setBoughtoutGraph] = useState<any[]>([])
    const [currentGraphData, setCurrentGraphData] = useState<any>()
    const [currentGraphIndex, setCurrentGraphIndex] = useState(0)

    const [totalGraphData, setTotalGraphData] = useState(0)
    const [totalGraphBOData, setTotalGraphBOData] = useState(0)
    const [ordersFilter, setOrdersFilter] = useState("In-Progress")

    const [partReminderDate, setPartReminderDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
    const [partDeliverDate, setPartDeliveryDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
    const [boughtoutReminderDate, setBoughtReminderDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
    const [boughtoutDeliveryDate, setBoughtoutDeliveryDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
    const [quotationReminderDate, setQuotationReminderDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))

    const [closeOrderDialog, setCloseOrderDialog] = useState(false)

    const [datePickerDialog, setDatePickerDialog] = useState<any>({
        dialog: false,
        type: ''
    })

    const valueFormatter = (item: { value: number }) => `${item.value}%`;

    useEffect(() => {
        setCurrentRole(getRole())
    }, [])

    const [pending, setPendingStatus] = useState(['pending', 'move to vendor'])
    const [vendorProgress, setVendorProgressStatus] = useState(['vendor acceptance pending', 'vendor in-progress', 'vendor process completed'])
    const [assemblyProgress, setAssemblyProgress] = useState(['in-stores', 'assembly in-progress',])

    useEffect(() => {
        let ps: any[] = []
        if (dashboardDetail?.partArray?.length > 0) {
            const total = dashboardDetail.partArray[currentGraphIndex].values.reduce((accum: any, item: any) => Number(accum) + Number(item.count), 0)
            setTotalGraphData(dashboardDetail?.partArray?.length)
            setCurrentGraphData({
                index: currentGraphIndex,
                machineName: dashboardDetail.partArray[currentGraphIndex].machine,
                order: dashboardDetail.partArray[currentGraphIndex].order,
                quotation: dashboardDetail.partArray[currentGraphIndex].quotation_no
            })
            dashboardDetail.partArray[currentGraphIndex].values.map((m: any) => {
                let status = m.status
                let color = '#568203'
                if (pending.includes(m.status.toLowerCase())) {
                    status = 'Pending'
                    color = '#F2003C'
                } else if (vendorProgress.includes(m.status)) {
                    status = 'Vendor In-Progress'
                    color = '#007FFF'
                } else if (assemblyProgress.includes(m.status)) {
                    status = 'Assembly In-Progress'
                    color = '#B53389'
                }
                let currentItem = ps.find((p: any) => p.label === status)
                if (currentItem) {
                    ps = ps.map((od: any) => {
                        return (od.label == status) ? {
                            ...od,
                            value: ((((Number(currentItem.value) / 100) * total) + Number(m.count)) / total) * 100
                            // value: Number(currentItem.value) + Number(m.count)
                        } : od
                    })
                } else {
                    ps.push({
                        label: status,
                        value: (m.count / total) * 100,
                        color: color
                    })
                }
            })
            setPartGraph(ps)
        }
    }, [dashboardDetail.partArray, currentGraphIndex])

    useEffect(() => {
        let ps: any[] = []
        if (dashboardDetail?.BOArray?.length > 0) {
            const total = dashboardDetail.BOArray[currentGraphIndex].values.reduce((accum: any, item: any) => Number(accum) + Number(item.count), 0)
            setTotalGraphBOData(dashboardDetail?.BOArray?.length)
            setCurrentGraphData({
                index: currentGraphIndex,
                machineName: dashboardDetail.partArray[currentGraphIndex].machine,
                order: dashboardDetail.partArray[currentGraphIndex].order,
                quotation: dashboardDetail.partArray[currentGraphIndex].quotation_no
            })
            dashboardDetail.BOArray[currentGraphIndex].values.map((m: any) => {
                let status = m.status
                if (pending.includes(m.status.toLowerCase())) {
                    status = 'Pending'
                } else if (m.status.toLowerCase() == 'in-progress') {
                    status = 'Supplier In-Progress'
                } else if (assemblyProgress.includes(m.status)) {
                    status = 'Assembly In-Progress'
                }
                let currentItem = ps.find((p: any) => p.label === status)
                if (currentItem) {
                    ps = ps.map((od: any) => {
                        return (od.label == status) ? {
                            ...od,
                            value: ((((Number(currentItem.value) / 100) * total) + Number(m.count)) / total) * 100
                            // value: Number(currentItem.value) + Number(m.count)
                        } : od
                    })
                } else {
                    ps.push({
                        label: status,
                        value: (m.count / total) * 100
                    })
                }
            })
            setBoughtoutGraph(ps)
        }
    }, [dashboardDetail.BOArray, currentGraphIndex])

    useEffect(() => {
        if (currentRole === SuperAdminRole || currentRole === AdminRole) {
            dispatch(fetchPendingPaymentBOs()).unwrap().then((res: any) => {
                setPendingPaymentsList(res?.list)
            })
            dispatch(fetchOrdersList(ordersFilter)).unwrap().then((res:any) => {
                setOrdersCloseList(res)
            })
        }

        if (currentRole == SuperAdminRole || currentRole == StoreRole) {
            dispatch(fetchPendingDeliveryParts()).unwrap().then((res: any) => {
                setPendingDeliveryList(res)
            })
            dispatch(fetchPendingDeliveryBOs()).unwrap().then((res: any) => {
                setPendingDeliveryBOList(res)
            })
        }

        if (currentRole == SuperAdminRole) {
            dispatch(fetchDashboardDetail())

            dispatch(fetchReminderDateList({
                from_date: moment(new Date()).format('DD-MM-YYYY'),
                to_date: moment(new Date()).format('DD-MM-YYYY')
            })).unwrap().then((res: any) => {
                setReminderDateList(res)
            })

            dispatch(fetchDeliveryDateList({
                from_date: moment(new Date()).format('DD-MM-YYYY'),
                to_date: moment(new Date()).format('DD-MM-YYYY')
            })).unwrap().then((res: any) => {
                setDeliveryDateList(res)
            })

            dispatch(fetchReminderQuotations({
                date: moment(new Date()).format('DD-MM-YYYY')
            })).unwrap().then((res: any) => {
                setQuotationReminderList(res.list)
            })

            dispatch(fetchOrderParts()).unwrap().then((res: any) => {
                setPendingOrderParts(res.parts)
                setPendingOrderBOs(res.bo)
            })
        }
    }, [currentRole])

    return (
        <>
            <Box sx={{ display: 'flex', direction: 'column', backgroundColor: '#F5F5F5' }}>
                <SidebarNav currentPage={nav_dashboard} />

                <Grid2 container sx={{ mt: 12, ml: 3 }}>

                    {currentRole == SuperAdminRole && <Grid2 size={2}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#0D92F4', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Machines</Typography>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{ marginTop: 'auto', marginRight: 'auto' }}>{dashboardDetail.machines || 0}</Typography>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                                        backgroundColor: 'white', marginLeft: 'auto', marginTop: 'auto',
                                        marginRight: '10px', marginBottom: '10px', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <SiApplearcade color='#0D92F4' style={{ width: '30px', height: '30px' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Grid2>}
                    {currentRole == SuperAdminRole && <Grid2 size={2} sx={{ ml: 2 }}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#F72C5B', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Customers</Typography>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{ marginTop: 'auto', marginRight: 'auto' }}>{dashboardDetail.customers || 0}</Typography>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                                        backgroundColor: 'white', marginLeft: 'auto', marginTop: 'auto',
                                        marginRight: '10px', marginBottom: '10px', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FaUsersLine color='#F72C5B' style={{ width: '30px', height: '30px' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Grid2>}
                    {currentRole == SuperAdminRole && <Grid2 size={2} sx={{ ml: 2 }}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#118B50', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Orders Pending</Typography>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{ marginTop: 'auto', marginRight: 'auto' }}>{dashboardDetail.customers || 0}</Typography>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                                        backgroundColor: 'white', marginLeft: 'auto', marginTop: 'auto',
                                        marginRight: '10px', marginBottom: '10px', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <GrInProgress color='#118B50' style={{ width: '30px', height: '30px' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Grid2>}
                    {currentRole == SuperAdminRole && <Grid2 size={2} sx={{ ml: 2 }}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#640D5F', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Vendors</Typography>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{ marginTop: 'auto', marginRight: 'auto' }}>{dashboardDetail.customers || 0}</Typography>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                                        backgroundColor: 'white', marginLeft: 'auto', marginTop: 'auto',
                                        marginRight: '10px', marginBottom: '10px', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <HiServer color='#640D5F' style={{ width: '30px', height: '30px' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={2} sx={{ ml: 2 }}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#C7571F', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Completed Orders</Typography>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{ marginTop: 'auto', marginRight: 'auto' }}>{dashboardDetail.completedOrders || 0}</Typography>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
                                        backgroundColor: 'white', marginLeft: 'auto', marginTop: 'auto',
                                        marginRight: '10px', marginBottom: '10px', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <SiTicktick color='#C7571F' style={{ width: '30px', height: '30px' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ padding: 1, mt: 2, mr: 3 }}>
                        <Card sx={{ borderRadius: '5px', width: '100%', height: '360px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ padding: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
                                    <IoArrowBackCircleSharp style={{ width: '30px', height: '30px', color: 'green', cursor: 'pointer' }} onClick={() => {
                                        if (currentGraphIndex - 1 >= 0) {
                                            setCurrentGraphIndex(currentGraphIndex - 1)
                                        }
                                    }} />
                                    <Typography sx={{ flexGrow: 1, textAlign: 'center', fontSize: '16px' }}><b>Parts Progress</b></Typography>
                                    <IoArrowForwardCircleSharp style={{ width: '30px', height: '30px', color: 'green', cursor: 'pointer', marginLeft: 'auto' }} onClick={() => {
                                        if (currentGraphIndex + 1 < totalGraphData) {
                                            setCurrentGraphIndex(currentGraphIndex + 1)
                                        }
                                    }} />
                                </Box>
                                <PieChart
                                    sx={{ mt: 1 }}
                                    height={250}
                                    series={[
                                        {
                                            data: partGraph,
                                            innerRadius: 60,
                                            arcLabel: (params) => params.label?.split('(')[0] ?? '',
                                            arcLabelMinAngle: 20,
                                            valueFormatter,
                                        },
                                    ]}
                                    skipAnimation={false}
                                    slotProps={{
                                        legend: {
                                            direction: 'column',
                                            position: { vertical: 'middle', horizontal: 'right' },
                                            padding: 2,
                                        },
                                    }}
                                />

                                <Box sx={{ display: 'flex', flexDirection: 'row', padding: 1, width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}>
                                        <Typography>Quotation: ({currentGraphIndex + 1}/ {totalGraphData}) </Typography>
                                        <Typography><b>{currentGraphData?.quotation}</b></Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }} style={{ marginLeft: 'auto' }}>
                                        <Typography>Machine: </Typography>
                                        <Typography><b>{currentGraphData?.machineName}</b></Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={5} sx={{ padding: 1, mt: 2 }}>
                        <Card sx={{ borderRadius: '5px', width: '100%', height: '360px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ padding: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
                                    <IoArrowBackCircleSharp style={{ width: '30px', height: '30px', color: 'green', cursor: 'pointer' }} onClick={() => {
                                        if (currentGraphIndex - 1 >= 0) {
                                            setCurrentGraphIndex(currentGraphIndex - 1)
                                        }
                                    }} />
                                    <Typography sx={{ flexGrow: 1, textAlign: 'center', fontSize: '16px' }}><b>Boughtout Progress</b></Typography>
                                    <IoArrowForwardCircleSharp style={{ width: '30px', height: '30px', color: 'green', cursor: 'pointer', marginLeft: 'auto' }} onClick={() => {
                                        if (currentGraphIndex + 1 < totalGraphData) {
                                            setCurrentGraphIndex(currentGraphIndex + 1)
                                        }
                                    }} />
                                </Box>
                                <PieChart
                                    sx={{ mt: 1 }}
                                    height={250}
                                    series={[
                                        {
                                            data: boughtoutGraph,
                                            innerRadius: 60,
                                            arcLabel: (params) => params.label?.split('(')[0] ?? '',
                                            arcLabelMinAngle: 20,
                                            valueFormatter,
                                        },
                                    ]}
                                    skipAnimation={false}
                                    slotProps={{
                                        legend: {
                                            direction: 'column',
                                            position: { vertical: 'middle', horizontal: 'right' },
                                            padding: 2,
                                        },
                                    }}
                                />

                                <Box sx={{ display: 'flex', flexDirection: 'row', padding: 1, width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}>
                                        <Typography>Quotation: ({currentGraphIndex + 1}/ {totalGraphData}) </Typography>
                                        <Typography><b>{currentGraphData?.quotation}</b></Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }} style={{ marginLeft: 'auto' }}>
                                        <Typography>Machine: </Typography>
                                        <Typography><b>{currentGraphData?.machineName}</b></Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid2>}

                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={6} sx={{ mt: 3, mr: 3 }}><h5>Pending Parts to Assembly</h5></Grid2>}
                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={5} sx={{ mt: 3, mr: 3 }}><h5>Pending Boughtouts to Assembly</h5></Grid2>}

                    {/* Move parts to assembly */}
                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper} sx={{ height: '300px' }}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Vendor</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingOrderParts && pendingOrderParts?.length > 0 ? pendingOrderParts?.map((row: any, index: number) => (
                                        <TableRowStyled key={row?.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row?.o_machine_name}</TableCell>
                                            <TableCell>{row?.q_quotation_no}</TableCell>
                                            <TableCell>{row?.pm_part_name}</TableCell>
                                            <TableCell>{row?.pm_order_qty}</TableCell>
                                            <TableCell>{row?.pm_vendor_name}</TableCell>
                                            <TableCell onClick={(e: any) => {
                                                setUpdateAssemblyDialog(true)
                                                setAssemblyItem(row)
                                            }}><Box sx={{
                                                borderColor: '#F95454',
                                                color: '#F95454',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                textAlign: 'center',
                                                borderRadius: '4px', cursor: 'pointer',
                                                ":hover": {
                                                    backgroundColor: '#006BFF',
                                                    color: 'white'
                                                }
                                            }}>Move to Assembly</Box></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* Move boughtouts to Assembly */}
                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={5} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper} sx={{ height: '300px' }}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Boughtout Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Supplier</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingOrderBOs && pendingOrderBOs?.length > 0 ? pendingOrderBOs?.map((row: any, index: number) => (
                                        <TableRowStyled key={row?.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row?.o_machine_name}</TableCell>
                                            <TableCell>{row?.q_quotation_no}</TableCell>
                                            <TableCell>{row?.bo_bought_out_name}</TableCell>
                                            <TableCell>{row?.bo_order_qty}</TableCell>
                                            <TableCell>{row?.bo_supplier_name}</TableCell>
                                            <TableCell onClick={() => {
                                                setUpdateAssemblyBODialog(true)
                                                setAssemblyItem(row)
                                            }}><Box sx={{
                                                borderColor: '#F95454',
                                                color: '#F95454',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                textAlign: 'center',
                                                borderRadius: '4px', cursor: 'pointer',
                                                ":hover": {
                                                    backgroundColor: '#006BFF',
                                                    color: 'white'
                                                }
                                            }}>Move to Assembly</Box></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* For Admin Role */}
                    {(currentRole === SuperAdminRole || currentRole == AdminRole) && <Grid2 size={10} sx={{ mt: 3 }}><h5>Pending Payments for Suppliers</h5></Grid2>}
                    {(currentRole === SuperAdminRole || currentRole == AdminRole) && <Grid2 size={11} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Order No</TableCell>
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
                                    {pendingPaymentsList && pendingPaymentsList?.length > 0 ? pendingPaymentsList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.order.machine_name}</TableCell>
                                            <TableCell>{row.order.quotation.quotation_no}</TableCell>
                                            <TableCell>{row.bought_out_name}</TableCell>
                                            <TableCell>{row.order_qty}</TableCell>
                                            <TableCell>{row.supplier_name}</TableCell>
                                            <TableCell>{row.cost}</TableCell>
                                            <TableCell>{row.delivery_date ? moment(row.delivery_date).format('DD-MM-YYYY') : ''}</TableCell>
                                            <TableCell>{row.reminder_date ? moment(row.reminder_date).format('DD-MM-YYYY') : ''}</TableCell>
                                            <TableCell><Box sx={{
                                                borderColor: row?.status.includes('Pending') ? '#F95454' : row?.status.includes('Progress') ? '#006BFF' : '#347928',
                                                color: row?.status.includes('Pending') ? '#F95454' : row?.status.includes('Progress') ? '#006BFF' : '#347928',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                textAlign: 'center',
                                                borderRadius: '4px', cursor: row?.status.includes('Progress') ? 'pointer' : 'default',
                                                ":hover": {
                                                    backgroundColor: row?.status.includes('Progress') ? '#006BFF' : 'white',
                                                    color: row?.status.includes('Progress') ? 'white' :
                                                        row?.status.includes('Pending') ? '#F95454' : '#347928'
                                                }
                                            }} onClick={() => {
                                                setPendingPaymentItem(row)
                                                setUpdatePaymentDialog(true)
                                            }}>{row.status}</Box></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* List orders to close */}
                    {(currentRole === SuperAdminRole || currentRole == AdminRole) && <Grid2 size={11} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <h5>Orders</h5>
                            <Box sx={{marginLeft: 'auto', display: 'flex', flexDirection:'row'}}>
                            <Box sx={{
                                borderColor: '#FF0800',
                                color: ordersFilter == 'Assembly Completed' ? 'white' : '#FF0800',
                                padding: '5px',
                                borderStyle: 'solid', borderWidth: 'thin',
                                textAlign: 'center',
                                borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: ordersFilter == 'Assembly Completed' ? '#FF0800' : 'white',
                                ":hover": {
                                    backgroundColor: '#FF0800',
                                    borderColor: 'white',
                                    color: 'white'
                                }
                            }} onClick={() => {
                                setOrdersFilter('Assembly Completed')
                                dispatch(fetchOrdersList('Assembly Completed')).unwrap().then((res:any) => {
                                    setOrdersCloseList(res)
                                })
                            }}>Orders to Close</Box>
                            <Box sx={{
                                borderColor: '#007FFF',
                                color: ordersFilter == 'In-Progress' ? 'white' : '#007FFF',
                                padding: '5px',
                                ml: 1,
                                borderStyle: 'solid', borderWidth: 'thin',
                                textAlign: 'center',
                                borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: ordersFilter == 'In-Progress' ? '#007FFF' : 'white',
                                ":hover": {
                                    backgroundColor: '#007FFF',
                                    borderColor: 'white',
                                    color: 'white'
                                }
                            }} onClick={() => {
                                setOrdersFilter('In-Progress')
                                dispatch(fetchOrdersList('In-Progress')).unwrap().then((res:any) => {
                                    setOrdersCloseList(res)
                                })
                            }}>In-Progress</Box>
                            <Box sx={{
                                borderColor: '#03C03C',
                                color: ordersFilter == 'Closed' ? 'white' : '#03C03C',
                                padding: '5px',
                                ml: 1,
                                borderStyle: 'solid', borderWidth: 'thin',
                                textAlign: 'center',
                                borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: ordersFilter == 'Closed' ? '#03C03C' : 'white',
                                ":hover": {
                                    backgroundColor: '#03C03C',
                                    borderColor: 'white',
                                    color: 'white'
                                }
                            }} onClick={() => {
                                setOrdersFilter('Closed')
                                dispatch(fetchOrdersList('Closed')).unwrap().then((res:any) => {
                                    setOrdersCloseList(res)
                                })
                            }}>Closed Orders</Box>
                            </Box>
                        </Box>
                    </Grid2>}
                    {(currentRole === SuperAdminRole || currentRole == AdminRole) && <Grid2 size={11} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>Status</TableCell>
                                        {ordersFilter == 'Assembly Completed' && <TableCell>Action</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ordersCloseList && ordersCloseList?.length > 0 ? ordersCloseList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row?.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.quotation?.quotation_no}</TableCell>
                                            <TableCell>{row?.machine_name}</TableCell>
                                            <TableCell>{row.customer?.customer_name}</TableCell>
                                            <TableCell>{row?.status}</TableCell>
                                            {ordersFilter == 'Assembly Completed' && <TableCell><Box sx={{
                                                borderColor: row?.status.includes('Pending') ? '#F95454' : row?.status.includes('Progress') ? '#006BFF' : '#347928',
                                                color: row?.status.includes('Pending') ? '#F95454' : row?.status.includes('Progress') ? '#006BFF' : '#347928',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                borderRadius: '4px', 
                                                ":hover": {
                                                    backgroundColor: row?.status.includes('Progress') ? '#006BFF' : 'white',
                                                    color: row?.status.includes('Progress') ? 'white' :
                                                        row?.status.includes('Pending') ? '#F95454' : '#347928'
                                                }
                                            }} onClick={() => {
                                                setAssemblyItem(row)
                                                setCloseOrderDialog(true) 
                                            }}>Close Order</Box></TableCell>}
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* For Store Role */}
                    {/* To move parts from vendor to store */}
                    {(currentRole == StoreRole || currentRole == SuperAdminRole) && <Grid2 size={6} sx={{ mt: 3, mr: 3 }}><h5>Pending Delivery Parts</h5></Grid2>}
                    {(currentRole == StoreRole || currentRole == SuperAdminRole) && <Grid2 size={5} sx={{ mt: 3 }}><h5>Pending Delivery Boughtouts</h5></Grid2>}

                    {(currentRole == StoreRole || currentRole == SuperAdminRole) && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingDeliveryList && pendingDeliveryList?.length > 0 ? pendingDeliveryList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.o_machine_name}</TableCell>
                                            <TableCell>{row.q_quotation_no}</TableCell>
                                            <TableCell>{row.pm_part_name}</TableCell>
                                            <TableCell>{row.pm_order_qty}</TableCell>
                                            <TableCell>Vendor process completed</TableCell>
                                            <TableCell><Box sx={{
                                                borderColor: '#F95454',
                                                color: '#F95454',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                textAlign: 'center',
                                                borderRadius: '4px', cursor: 'pointer',
                                                ":hover": {
                                                    backgroundColor: '#006BFF',
                                                    color: 'white'
                                                }
                                            }} onClick={() => {
                                                setPendingDeliveryItem(row)
                                                setUpdateDeliveryDialog(true)
                                            }}>Accept Delivery</Box></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {(currentRole == StoreRole || currentRole == SuperAdminRole) && <Grid2 size={5} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Boughtout Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingDeliveryBOList && pendingDeliveryBOList?.length > 0 ? pendingDeliveryBOList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.o_machine_name}</TableCell>
                                            <TableCell>{row.q_quotation_no}</TableCell>
                                            <TableCell>{row.bo_bought_out_name}</TableCell>
                                            <TableCell>{row.bo_order_qty}</TableCell>
                                            <TableCell>In-Progress</TableCell>
                                            <TableCell><Box sx={{
                                                borderColor: '#F95454',
                                                color: '#F95454',
                                                borderStyle: 'solid', borderWidth: 'thin',
                                                textAlign: 'center',
                                                borderRadius: '4px', cursor: 'pointer',
                                                ":hover": {
                                                    backgroundColor: '#006BFF',
                                                    color: 'white'
                                                }
                                            }} onClick={() => {
                                                setPendingDeliveryItem(row)
                                                setUpdateDeliveryBODialog(true)
                                            }}>Accept Delivery</Box></TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* For Reminder list */}
                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 3, mr: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <h5>Reminder for Parts</h5>
                            <Box sx={{
                                marginLeft: 'auto',
                                borderColor: '#640D5F',
                                color: 'white',
                                padding: '5px',
                                borderStyle: 'solid', borderWidth: 'thin',
                                textAlign: 'center',
                                borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: '#640D5F',
                                ":hover": {
                                    backgroundColor: '#640D5F',
                                    borderColor: 'white',
                                    color: 'white'
                                }
                            }} onClick={() => {
                                setDatePickerDialog({
                                    dialog: true,
                                    type: 'partReminder'
                                })
                            }}>{dayjs(partReminderDate).format('DD-MM-YYYY')}</Box>
                        </Box>
                    </Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={5} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <h5>Parts Delivery</h5>
                            <Box sx={{
                                marginLeft: 'auto',
                                borderColor: '#640D5F',
                                color: 'white',
                                padding: '5px',
                                borderStyle: 'solid', borderWidth: 'thin',
                                textAlign: 'center',
                                borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: '#640D5F',
                                ":hover": {
                                    backgroundColor: '#640D5F',
                                    borderColor: 'white',
                                    color: 'white'
                                }
                            }} onClick={() => {
                                setDatePickerDialog({
                                    dialog: true,
                                    type: 'partDelivery'
                                })
                            }}>{dayjs(partDeliverDate).format('DD-MM-YYYY')}</Box>
                        </Box>
                    </Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Vendor</TableCell>
                                        <TableCell>Mobile No</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reminderDateList && reminderDateList?.length > 0 ? reminderDateList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.o_machine_name}</TableCell>
                                            <TableCell>{row.pm_part_name}</TableCell>
                                            <TableCell>{row.pm_order_qty}</TableCell>
                                            <TableCell>{row.pm_vendor_name}</TableCell>
                                            <TableCell>{row.v_vendor_mobile_no1}</TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}
                    {/* For delivery list */}
                    {currentRole == SuperAdminRole && <Grid2 size={5} sx={{ mt: 1 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Vendor</TableCell>
                                        <TableCell>Mobile No</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deliveryDateList && deliveryDateList?.length > 0 ? deliveryDateList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.o_machine_name}</TableCell>
                                            <TableCell>{row.pm_part_name}</TableCell>
                                            <TableCell>{row.pm_order_qty}</TableCell>
                                            <TableCell>{row.pm_vendor_name}</TableCell>
                                            <TableCell>{row.v_vendor_mobile_no1}</TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* For quotation reminder list */}
                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 3 }}><Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <h5>Quotation Reminder</h5>
                        <Box sx={{
                            marginLeft: 'auto',
                            borderColor: '#640D5F',
                            color: 'white',
                            padding: '5px',
                            borderStyle: 'solid', borderWidth: 'thin',
                            textAlign: 'center',
                            borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: '#640D5F',
                            ":hover": {
                                backgroundColor: '#640D5F',
                                borderColor: 'white',
                                color: 'white'
                            }
                        }} onClick={() => {
                            setDatePickerDialog({
                                dialog: true,
                                type: 'quotationReminder'
                            })
                        }}>{dayjs(quotationReminderDate).format('DD-MM-YYYY')}</Box>
                    </Box></Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>Machine Name</TableCell>
                                        <TableCell>Employee</TableCell>
                                        <TableCell>Cost</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {quotationReminderList && quotationReminderList?.length > 0 ? quotationReminderList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.customer.customer_name}</TableCell>
                                            <TableCell>{row.machine.machine_name}</TableCell>
                                            <TableCell>{row.user.emp_name}</TableCell>
                                            <TableCell>{row.initial_cost}</TableCell>
                                            <TableCell>{row.qty}</TableCell>
                                            <TableCell>{row.status}</TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}
                </Grid2>


                {/* Dialog to update boughtout payment */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={updatePaymentDialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setUpdatePaymentDialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Update Payment status for {pendingPaymentItem?.supplier_name}</DialogTitle>
                    <DialogContent>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Paid Amount"
                            name="paid_amount"
                            sx={{ mt: 1 }}
                            value={pendingPaymentItem?.paidAmount ? pendingPaymentItem?.paidAmount : ""}
                            onChange={(e: any) => {
                                setPendingPaymentItem({ ...pendingPaymentItem, paidAmount: e.target.value })
                            }}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Payment Remarks"
                            multiline
                            rows={4}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={pendingPaymentItem?.paymentRemarks ? pendingPaymentItem?.paymentRemarks : ""}
                            onChange={(e: any) => {
                                setPendingPaymentItem({ ...pendingPaymentItem, paymentRemarks: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdatePaymentDialog(false)
                            setPendingPaymentItem({})
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            dispatch(updateBoughtoutPayment({
                                production_part_id: pendingPaymentItem.id,
                                remarks: pendingPaymentItem.paymentRemarks,
                                status: 'In-Progress',
                                paid_amount: pendingPaymentItem.paidAmount
                            })).unwrap().then((res: any) => {
                                if (res.includes('success')) {
                                    DisplaySnackbar(res, ' success', enqueueSnackbar)
                                    setPendingPaymentsList(
                                        pendingPaymentsList?.map((od: any) => {
                                            return (od.id == pendingPaymentItem.id) ? {
                                                ...od,
                                                status: 'Payment Completed'
                                            } : od
                                        })
                                    )
                                    setUpdatePaymentDialog(false)
                                    setPendingPaymentItem({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }}>
                            Paid
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog to deliver items */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={updateDeliveryDialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setUpdateDeliveryDialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Update Delivery status for {pendingDeliveryItem?.pm_part_name}</DialogTitle>
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
                            value={pendingDeliveryItem?.deliveryRemarks ? pendingDeliveryItem?.deliveryRemarks : ""}
                            onChange={(e: any) => {
                                setPendingDeliveryItem({ ...pendingDeliveryItem, deliveryRemarks: e.target.value })
                            }}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Ordered Qty"
                            disabled={true}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={pendingDeliveryItem?.pm_order_qty ? pendingDeliveryItem?.pm_order_qty : "0"}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Delivered Qty"
                            name="delivered_qty"
                            sx={{ mt: 1 }}
                            value={pendingDeliveryItem?.delivered_qty ? pendingDeliveryItem?.delivered_qty : ""}
                            onChange={(e: any) => {
                                setPendingDeliveryItem({ ...pendingDeliveryItem, delivered_qty: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdateDeliveryDialog(false)
                            setPendingDeliveryItem({})
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            if (pendingDeliveryItem?.delivered_qty?.length > 0) {
                                dispatch(deliverProductionMachinePart({
                                    order_id: pendingDeliveryItem.pm_order_id,
                                    part_name: pendingDeliveryItem.pm_part_name,
                                    remarks: pendingDeliveryItem.deliveryRemarks,
                                    delivered_qty: pendingDeliveryItem.delivered_qty
                                })).unwrap().then((res: any) => {
                                    if (res.message.includes('success')) {
                                        DisplaySnackbar(res, ' success', enqueueSnackbar)
                                        setUpdateDeliveryDialog(false)
                                        setPendingDeliveryItem({})
                                        dispatch(fetchOrderParts()).unwrap().then((result: any) => {
                                            setPendingOrderParts(result.parts)
                                            setPendingOrderBOs(result.bo)
                                        })
                                        dispatch(fetchPendingDeliveryParts()).unwrap().then((result: any) => {
                                            setPendingDeliveryList(result)
                                        })
                                    } else {
                                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    }
                                })
                            }
                        }}>
                            Delivered
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog to deliver BOs */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={updateDeliveryBODialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setUpdateDeliveryBODialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Update Delivery status for {pendingDeliveryItem?.bo_bought_out_name}</DialogTitle>
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
                            value={pendingDeliveryItem?.deliveryRemarks ? pendingDeliveryItem?.deliveryRemarks : ""}
                            onChange={(e: any) => {
                                setPendingDeliveryItem({ ...pendingDeliveryItem, deliveryRemarks: e.target.value })
                            }}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Ordered Qty"
                            disabled={true}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={pendingDeliveryItem?.bo_order_qty ? pendingDeliveryItem?.bo_order_qty : "0"}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Delivered Qty"
                            name="delivered_qty"
                            sx={{ mt: 1 }}
                            value={pendingDeliveryItem?.delivered_qty ? pendingDeliveryItem?.delivered_qty : ""}
                            onChange={(e: any) => {
                                setPendingDeliveryItem({ ...pendingDeliveryItem, delivered_qty: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdateDeliveryBODialog(false)
                            setPendingDeliveryItem({})
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            if (pendingDeliveryItem?.delivered_qty?.length > 0) {
                                dispatch(deliverProductionMachineBO({
                                    production_boughtout_id: pendingDeliveryItem.bo_id,
                                    order_id: pendingDeliveryItem.bo_order_id,
                                    bought_out_name: pendingDeliveryItem.pm_part_name,
                                    remarks: pendingDeliveryItem.deliveryRemarks,
                                    delivered_qty: pendingDeliveryItem.delivered_qty
                                })).unwrap().then((res: any) => {
                                    if (res.message.includes('success')) {
                                        DisplaySnackbar(res, ' success', enqueueSnackbar)
                                        setUpdateDeliveryBODialog(false)
                                        setPendingDeliveryItem({})
                                        dispatch(fetchOrderParts()).unwrap().then((result: any) => {
                                            setPendingOrderParts(result.parts)
                                            setPendingOrderBOs(result.bo)
                                        })
                                        dispatch(fetchPendingDeliveryBOs()).unwrap().then((result: any) => {
                                            setPendingDeliveryBOList(result)
                                        })
                                    } else {
                                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    }
                                })
                            }
                        }}>
                            Delivered
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog to move to assembly */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={updateAssemblyDialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setUpdateAssemblyDialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Move {assemblyItem?.pm_part_name} to Assembly</DialogTitle>
                    <DialogContent>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Stores Remarks"
                            multiline
                            rows={4}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.remarks ? assemblyItem?.remarks : ""}
                            onChange={(e: any) => {
                                setAssemblyItem({ ...assemblyItem, remarks: e.target.value })
                            }}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Available Qty"
                            disabled={true}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.p_available_aty ? assemblyItem?.p_available_aty : "0"}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Required Qty"
                            disabled={true}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.pm_required_qty ? assemblyItem?.pm_required_qty : "0"}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Qty"
                            name="qty"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.assembly_qty ? assemblyItem?.assembly_qty : ""}
                            onChange={(e: any) => {
                                setAssemblyItem({ ...assemblyItem, assembly_qty: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdateAssemblyDialog(false)
                            setAssemblyItem({})
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            if (assemblyItem?.assembly_qty?.length > 0) {
                                dispatch(movePartToAssembly({
                                    order_id: assemblyItem.pm_order_id,
                                    part_name: assemblyItem.pm_part_name,
                                    remarks: assemblyItem.remarks,
                                    assembly_qty: assemblyItem.assembly_qty
                                })).unwrap().then((res: any) => {
                                    if (res.message.includes('success')) {
                                        DisplaySnackbar(res, ' success', enqueueSnackbar)
                                        setUpdateAssemblyDialog(false)
                                        setAssemblyItem({})
                                        dispatch(fetchOrderParts()).unwrap().then((result: any) => {
                                            setPendingOrderParts(result.parts)
                                            setPendingOrderBOs(result.bo)
                                        })
                                    } else {
                                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    }
                                })
                            }
                        }}>
                            Move to Assembly
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog to move boughtout to assembly */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={updateAssemblyBODialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setUpdateAssemblyBODialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Move {assemblyItem?.bo_bought_out_name} to Assembly</DialogTitle>
                    <DialogContent>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Stores Remarks"
                            multiline
                            rows={4}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.remarks ? assemblyItem?.remarks : ""}
                            onChange={(e: any) => {
                                setAssemblyItem({ ...assemblyItem, remarks: e.target.value })
                            }}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Required Qty"
                            disabled={true}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.bo_order_qty ? assemblyItem?.bo_order_qty : "0"}
                        />
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Qty"
                            name="qty"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.assembly_qty ? assemblyItem?.assembly_qty : ""}
                            onChange={(e: any) => {
                                setAssemblyItem({ ...assemblyItem, assembly_qty: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdateAssemblyBODialog(false)
                            setAssemblyItem({})
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            if (assemblyItem?.assembly_qty?.length > 0) {
                                dispatch(moveBoughtoutToAssembly({
                                    production_boughtout_id: assemblyItem.bo_id,
                                    order_id: assemblyItem.bo_id,
                                    bought_out_name: assemblyItem.bo_bought_out_name,
                                    remarks: assemblyItem.remarks,
                                    assembly_qty: assemblyItem.assembly_qty
                                })).unwrap().then((res: any) => {
                                    if (res.message.includes('success')) {
                                        DisplaySnackbar(res, ' success', enqueueSnackbar)
                                        setUpdateAssemblyBODialog(false)
                                        setAssemblyItem({})
                                        dispatch(fetchOrderParts()).unwrap().then((result: any) => {
                                            setPendingOrderParts(result.parts)
                                            setPendingOrderBOs(result.bo)
                                        })
                                    } else {
                                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                    }
                                })
                            }
                        }}>
                            Move to Assembly
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Change date for filter */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={datePickerDialog.dialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setDatePickerDialog({
                            dialog: false,
                            type: ''
                        })
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Move {assemblyItem?.bo_bought_out_name} to Assembly</DialogTitle>
                    <DialogContent>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar value={dayjs(new Date(partReminderDate))} onChange={(newValue) => {
                                if (datePickerDialog.type === "partReminder") {
                                    setPartReminderDate(dayjs(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
                                    setDatePickerDialog({
                                        dialog: false,
                                        type: ''
                                    })
                                    dispatch(fetchReminderDateList({
                                        from_date: moment(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('DD-MM-YYYY'),
                                        to_date: moment(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('DD-MM-YYYY')
                                    })).unwrap().then((res: any) => {
                                        setReminderDateList(res)
                                    })
                                } else if (datePickerDialog.type === "partDelivery") {
                                    setPartDeliveryDate(dayjs(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
                                    setDatePickerDialog({
                                        dialog: false,
                                        type: ''
                                    })
                                    dispatch(fetchDeliveryDateList({
                                        from_date: moment(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('DD-MM-YYYY'),
                                        to_date: moment(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('DD-MM-YYYY')
                                    })).unwrap().then((res: any) => {
                                        setDeliveryDateList(res)
                                    })
                                } else if (datePickerDialog.type === "boughtoutReminder") {
                                    setBoughtReminderDate(dayjs(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
                                    setDatePickerDialog({
                                        dialog: false,
                                        type: ''
                                    })
                                } else if (datePickerDialog.type === "boughtoutDelivery") {
                                    setBoughtoutDeliveryDate(dayjs(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
                                    setDatePickerDialog({
                                        dialog: false,
                                        type: ''
                                    })
                                } else if (datePickerDialog.type === "quotationReminder") {
                                    setQuotationReminderDate(dayjs(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
                                    setDatePickerDialog({
                                        dialog: false,
                                        type: ''
                                    })
                                    dispatch(fetchReminderQuotations({
                                        date: moment(new Date(dayjs(new Date(newValue)).format('YYYY-MM-DD'))).format('DD-MM-YYYY')
                                    })).unwrap().then((res: any) => {
                                        setQuotationReminderList(res.list)
                                    })
                                }

                            }} />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setDatePickerDialog({
                                dialog: false,
                                type: ''
                            })
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog to close order */}
                <Dialog
                    PaperProps={{
                        sx: {
                            width: "100%",
                            maxWidth: "30vw!important",
                        },
                    }}
                    open={closeOrderDialog}
                    onClose={(event, reason) => {
                        if (reason == "backdropClick") {
                            return
                        }
                        setCloseOrderDialog(false)
                    }}>
                    <DialogTitle sx={{ fontSize: '14px' }}>Do to want to Close Order - {assemblyItem?.quotation?.quotation_no}</DialogTitle>
                    <DialogContent>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Remarks"
                            multiline
                            rows={4}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={assemblyItem?.remarks ? assemblyItem?.remarks : ""}
                            onChange={(e: any) => {
                                setAssemblyItem({ ...assemblyItem, remarks: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setCloseOrderDialog(false)
                        }} sx={{ color: '#bb0037' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => {
                            dispatch(closeOrder({
                                order_id: assemblyItem.id,
                                remarks: assemblyItem.remarks
                            })).unwrap().then((res:any) => {
                                if(res.message.includes('success')){
                                    DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                                    setAssemblyItem({})
                                    setCloseOrderDialog(false)
                                    dispatch(fetchOrdersList('Assembly Completed')).unwrap().then((res:any) => {
                                        setOrdersCloseList(res)
                                    })
                                }else{
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }}>
                            Close Order
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </>
    )
}

export default Dashboard;