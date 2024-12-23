import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Card, CardContent, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import moment from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';
import { nav_dashboard, TableRowStyled } from '../constants';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { fetchDashboardDetail, fetchDeliveryDateList, fetchPartsInStores, fetchPendingDeliveryParts, fetchPendingPaymentBOs, fetchReminderDateList, fetchReminderQuotations, updateBoughtoutPayment } from '../slices/dashboardSlice';
import SidebarNav from './SidebarNav';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { AdminRole, getPermission, getRole, StoreRole, SuperAdminRole } from '../utils/Permissions';
import { SiApplearcade } from 'react-icons/si';
import { GrInProgress } from "react-icons/gr";
import { FaUsersLine } from 'react-icons/fa6';
import { HiServer } from "react-icons/hi";

const Dashboard = () => {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const { pendingPayments, pendingDelivery, dashboardDetail } = useAppSelector(
        (state) => state.dashboard
    );

    const [pendingPaymentItem, setPendingPaymentItem] = useState<any>()
    const [updatePaymentDialog, setUpdatePaymentDialog] = useState(false)
    const [pendingPaymentsList, setPendingPaymentsList] = useState<any[]>()

    const [pendingDeliveryItem, setPendingDeliveryItem] = useState<any>()
    const [updateDeliveryDialog, setUpdateDeliveryDialog] = useState(false)
    const [pendingDeliveryList, setPendingDeliveryList] = useState<any[]>()

    const [reminderDateList, setReminderDateList] = useState<any[]>()
    const [deliveryDateList, setDeliveryDateList] = useState<any[]>()
    const [partsInStoresList, setPartsInStoresList] = useState<any[]>()

    const [currentRole, setCurrentRole] = useState()

    const [quotationReminderList, setQuotationReminderList] = useState<any[]>()

    useEffect(() => {
        setCurrentRole(getRole())
    }, [])

    useEffect(() => {
        if (currentRole === SuperAdminRole || currentRole === AdminRole) {
            dispatch(fetchPendingPaymentBOs()).unwrap().then((res: any) => {
                setPendingPaymentsList(res?.list)
            })
            dispatch(fetchPartsInStores()).unwrap().then((res: any) => {
                setPartsInStoresList(res?.list)
            })
        }

        if (currentRole == SuperAdminRole || currentRole == StoreRole) {
            dispatch(fetchPendingDeliveryParts()).unwrap().then((res: any) => {
                setPendingDeliveryList(res)
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
        }
    }, [currentRole])

    return (
        <>
            <Box sx={{ display: 'flex', direction: 'column' }}>
                <SidebarNav currentPage={nav_dashboard} />

                <Grid2 container sx={{ mt: 12, ml: 3 }}>

                    {currentRole == SuperAdminRole && <Grid2 size={2}>
                        <Card sx={{ width: '100%', height: '140px', backgroundColor: '#0D92F4', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection:'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Machines</Typography>
                                <div style={{display: 'flex',marginTop: 'auto'}}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{marginTop:'auto', marginRight:'auto'}}>{dashboardDetail.machines || 0}</Typography>
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
                            <div style={{ display: 'flex', flexDirection:'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Customers</Typography>
                                <div style={{display: 'flex',marginTop: 'auto'}}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{marginTop:'auto', marginRight:'auto'}}>{dashboardDetail.customers || 0}</Typography>
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
                            <div style={{ display: 'flex', flexDirection:'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Orders Pending</Typography>
                                <div style={{display: 'flex',marginTop: 'auto'}}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{marginTop:'auto', marginRight:'auto'}}>{dashboardDetail.customers || 0}</Typography>
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
                            <div style={{ display: 'flex', flexDirection:'column', width: '100%', height: '100%' }}>
                                <Typography variant='h6' color='white' margin={2}>Vendors</Typography>
                                <div style={{display: 'flex',marginTop: 'auto'}}>
                                    <Typography variant='h5' color='white' margin={2}
                                        sx={{marginTop:'auto', marginRight:'auto'}}>{dashboardDetail.customers || 0}</Typography>
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

                    {/* For Admin Role */}
                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={12} sx={{ mt: 3 }}><h5>Pending Payments for Suppliers</h5></Grid2>}
                    {(currentRole == SuperAdminRole || currentRole == AdminRole) && <Grid2 size={12} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
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

                    {/* For Store Role */}
                    {(currentRole == SuperAdminRole || currentRole == StoreRole) && <Grid2 size={12} sx={{ mt: 3 }}><h5>Pending Delivery Parts</h5></Grid2>}
                    <Grid2 size={12} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
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
                    </Grid2>

                    {(currentRole == SuperAdminRole || currentRole == StoreRole) && <Grid2 size={12} sx={{ mt: 3 }}><h5>Parts In Stores</h5></Grid2>}
                    {(currentRole == SuperAdminRole || currentRole == StoreRole) && <Grid2 size={12} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Available Qty</TableCell>
                                        <TableCell>Minimum Stock Qty</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {partsInStoresList && partsInStoresList?.length > 0 ? partsInStoresList?.map((row: any, index: number) => (
                                        <TableRowStyled key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.part_name}</TableCell>
                                            <TableCell>{row.available_aty}</TableCell>
                                            <TableCell>{row.minimum_stock_qty}</TableCell>
                                        </TableRowStyled>
                                    )) : <TableRow key={0}>
                                        <TableCell colSpan={9} align='center'>No Data</TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>}

                    {/* For Reminder list */}
                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 3, mr: 3 }}><h5>Reminder for Parts</h5></Grid2>}
                    {currentRole == SuperAdminRole && <Grid2 size={5} sx={{ mt: 3 }}><h5>Parts Delivery</h5></Grid2>}

                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
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
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
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
                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 3 }}><h5>Quotation Reminder</h5></Grid2>}
                    {currentRole == SuperAdminRole && <Grid2 size={6} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
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
                    <DialogTitle sx={{ fontSize: '14px' }}>Update Delivery status for {pendingDeliveryItem?.part_name}</DialogTitle>
                    <DialogContent>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            label="Payment Remarks"
                            multiline
                            rows={4}
                            name="remarks"
                            sx={{ mt: 1 }}
                            value={pendingDeliveryItem?.deliveryRemarks ? pendingDeliveryItem?.deliveryRemarks : ""}
                            onChange={(e: any) => {
                                setPendingDeliveryItem({ ...pendingDeliveryItem, deliveryRemarks: e.target.value })
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUpdateDeliveryDialog(false)
                            setPendingDeliveryItem({})
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
                                    // setPendingPaymentsList(
                                    //     pendingPaymentsList?.map((od: any) => {
                                    //         return (od.id == pendingPaymentItem.id) ? {
                                    //             ...od,
                                    //             status: 'Delivered'
                                    //         } : od
                                    //     })
                                    // )
                                    setUpdateDeliveryDialog(false)
                                    setPendingDeliveryItem({})
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                                }
                            })
                        }}>
                            Delivered
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </>
    )
}

export default Dashboard;