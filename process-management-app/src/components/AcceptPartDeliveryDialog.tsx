import { useEffect, useRef, useState } from 'react';
import {
    Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Grid2, InputLabel, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../hooks/redux-hooks';
import { recordVendorProcessPayment, uploadVendorInvoice } from '../slices/dashboardSlice';
import { deliverProductionMachinePart } from '../slices/quotationSlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';

interface AcceptPartDeliveryDialogProps {
    open: boolean;
    item: any;
    onClose: () => void;
    onAccepted: () => void;
}

type ProcessPayment = { paid_amount: string, mode: string, remarks: string, paid: boolean };

export default function AcceptPartDeliveryDialog({ open, item, onClose, onAccepted }: AcceptPartDeliveryDialogProps) {
    const dispatch = useAppDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const invoiceInputRef = useRef<HTMLInputElement>(null);

    const [processPayments, setProcessPayments] = useState<Record<string, ProcessPayment>>({});
    const [invoiceFileName, setInvoiceFileName] = useState('');
    const [deliveryRemarks, setDeliveryRemarks] = useState('');
    const [deliveredQty, setDeliveredQty] = useState('');

    useEffect(() => {
        if (open) {
            const init: Record<string, ProcessPayment> = {};
            (item?.processes || []).forEach((p: any) => {
                init[p.id] = { paid_amount: '', mode: 'Cash', remarks: '', paid: false };
            });
            setProcessPayments(init);
            setInvoiceFileName('');
            setDeliveryRemarks('');
            setDeliveredQty('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item]);

    const handlePayProcess = (process: any) => {
        const payment = processPayments[process.id];
        dispatch(recordVendorProcessPayment({
            production_part_id: process.id,
            paid_amount: Number(payment?.paid_amount) || 0,
            mode: payment?.mode,
            remarks: payment?.remarks,
        })).unwrap().then((res: any) => {
            if (res?.message?.includes('success')) {
                setProcessPayments((prev) => ({ ...prev, [process.id]: { ...prev[process.id], paid: true } }));
                DisplaySnackbar(res.message, 'success', enqueueSnackbar);
            } else {
                DisplaySnackbar('Unable to record payment', 'error', enqueueSnackbar);
            }
        });
    };

    const handleInvoiceFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const firstProcess = item?.processes?.[0];
            dispatch(uploadVendorInvoice({
                file,
                order_id: item?.pm_order_id,
                part_id: firstProcess?.part_id,
                machine_id: firstProcess?.machine_id,
            })).unwrap().then((res: any) => {
                if (res?.file_name) {
                    setInvoiceFileName(res.file_name);
                    DisplaySnackbar('Invoice uploaded successfully', 'success', enqueueSnackbar);
                } else {
                    DisplaySnackbar('Unable to upload invoice', 'error', enqueueSnackbar);
                }
            });
        }
    };

    const allProcessesPaid = !item?.processes || item.processes.length === 0 ||
        item.processes.every((p: any) => processPayments[p.id]?.paid);

    const handleAccept = () => {
        if (!deliveredQty) return;
        dispatch(deliverProductionMachinePart({
            order_id: item.pm_order_id,
            part_name: item.pm_part_name,
            remarks: deliveryRemarks,
            delivered_qty: deliveredQty,
        })).unwrap().then((res: any) => {
            if (res?.message?.includes('success')) {
                DisplaySnackbar(res.message, 'success', enqueueSnackbar);
                onClose();
                onAccepted();
            } else {
                DisplaySnackbar(res?.message || 'Unable to update delivery status', 'error', enqueueSnackbar);
            }
        });
    };

    return (
        <Dialog
            PaperProps={{ sx: { width: '100%', maxWidth: '50vw!important' } }}
            open={open}
            onClose={(_event, reason) => { if (reason !== 'backdropClick') onClose(); }}
        >
            <DialogTitle sx={{ fontSize: '14px' }}>Update Delivery status for {item?.pm_part_name}</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" color="grey">Vendor Payments</Typography>
                {item?.processes?.map((process: any) => (
                    <Card key={process.id} sx={{ padding: 2, mt: 1 }}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <Typography variant="subtitle2">{process.process_name} - {process.vendor_name}</Typography>
                            </Grid2>
                            <Grid2 size={3}>
                                <TextField size="small" variant="outlined" fullWidth disabled label="Total Value" value={process.cost || '0'} />
                            </Grid2>
                            <Grid2 size={3}>
                                <TextField
                                    size="small" variant="outlined" fullWidth type="number"
                                    disabled={processPayments[process.id]?.paid}
                                    label="Paid Amount"
                                    value={processPayments[process.id]?.paid_amount || ''}
                                    onChange={(e) => setProcessPayments({ ...processPayments, [process.id]: { ...processPayments[process.id], paid_amount: e.target.value } })}
                                />
                            </Grid2>
                            <Grid2 size={3}>
                                <FormControl fullWidth size="small" disabled={processPayments[process.id]?.paid}>
                                    <InputLabel>Mode of Payment</InputLabel>
                                    <Select
                                        label="Mode of Payment"
                                        value={processPayments[process.id]?.mode || 'Cash'}
                                        onChange={(e) => setProcessPayments({ ...processPayments, [process.id]: { ...processPayments[process.id], mode: e.target.value } })}
                                    >
                                        <MenuItem value="Cash">Cash</MenuItem>
                                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                        <MenuItem value="UPI">UPI</MenuItem>
                                        <MenuItem value="Cheque">Cheque</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={3}>
                                <Button fullWidth variant="contained" disabled={processPayments[process.id]?.paid} onClick={() => handlePayProcess(process)}>
                                    {processPayments[process.id]?.paid ? 'Paid' : 'Pay'}
                                </Button>
                            </Grid2>
                            <Grid2 size={12}>
                                <TextField
                                    size="small" variant="outlined" fullWidth
                                    disabled={processPayments[process.id]?.paid}
                                    label="Payment Remarks"
                                    value={processPayments[process.id]?.remarks || ''}
                                    onChange={(e) => setProcessPayments({ ...processPayments, [process.id]: { ...processPayments[process.id], remarks: e.target.value } })}
                                />
                            </Grid2>
                        </Grid2>
                    </Card>
                ))}

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="grey">Invoice Document</Typography>
                    <input type="file" accept="image/*,application/pdf" ref={invoiceInputRef} style={{ display: 'none' }} onChange={handleInvoiceFileChange} />
                    <Button variant="outlined" sx={{ mt: 1 }} onClick={() => invoiceInputRef.current?.click()}>
                        {invoiceFileName ? 'Invoice Uploaded' : 'Upload Invoice'}
                    </Button>
                </Box>

                <TextField
                    size="small" variant="outlined" fullWidth label="Delivery Remarks" multiline rows={4} sx={{ mt: 1 }}
                    value={deliveryRemarks} onChange={(e) => setDeliveryRemarks(e.target.value)}
                />
                <TextField
                    size="small" variant="outlined" fullWidth label="Ordered Qty" disabled sx={{ mt: 1 }}
                    value={item?.pm_order_qty || '0'}
                />
                <TextField
                    size="small" variant="outlined" fullWidth label="Delivered Qty" sx={{ mt: 1 }}
                    value={deliveredQty} onChange={(e) => setDeliveredQty(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: '#bb0037' }}>Cancel</Button>
                {allProcessesPaid && (
                    <Button variant="contained" onClick={handleAccept}>Accept Delivery</Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
