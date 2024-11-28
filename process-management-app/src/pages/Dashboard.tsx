import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import moment from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';
import { nav_dashboard, TableRowStyled } from '../constants';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { fetchPendingDeliveryParts, fetchPendingPaymentBOs, updateBoughtoutPayment } from '../slices/dashboardSlice';
import SidebarNav from './SidebarNav';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';

const Dashboard = () => {
    const dispatch = useAppDispatch()
    const { enqueueSnackbar } = useSnackbar()

    const { pendingPayments, pendingDelivery } = useAppSelector(
        (state) => state.dashboard
    );

    const [pendingPaymentItem, setPendingPaymentItem] = useState<any>()
    const [updatePaymentDialog, setUpdatePaymentDialog] = useState(false)
    const [pendingPaymentsList, setPendingPaymentsList] = useState<any[]>()

    const [pendingDeliveryItem, setPendingDeliveryItem] = useState<any>()
    const [updateDeliveryDialog, setUpdateDeliveryDialog] = useState(false)
    const [pendingDeliveryList, setPendingDeliveryList] = useState<any[]>()

    useEffect(() => {
        dispatch(fetchPendingPaymentBOs()).unwrap().then((res: any) => {
            setPendingPaymentsList(res?.list)
        })

        dispatch(fetchPendingDeliveryParts()).unwrap().then((res: any) => {
            setPendingDeliveryList(res)
        })
    }, [dispatch])

    return (
        <>
            <Box sx={{ display: 'flex', direction: 'column' }}>
                <SidebarNav currentPage={nav_dashboard} />

                <Grid2 container sx={{ mt: 12, ml: 3 }}>

                    {/* For Admin Role */}
                    <Grid2 size={12}><h5>Pending Payments for Suppliers</h5></Grid2>
                    <Grid2 size={12} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
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
                    </Grid2>

                    {/* For Store Role */}
                    <Grid2 size={12} sx={{mt:3}}><h5>Pending Delivery Parts</h5></Grid2>
                    <Grid2 size={12} sx={{ mt: 1, mr: 3 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
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