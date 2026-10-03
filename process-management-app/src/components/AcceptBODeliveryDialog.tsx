import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../hooks/redux-hooks';
import { recordBoughtoutPayment } from '../slices/dashboardSlice';
import { deliverProductionMachineBO } from '../slices/quotationSlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';

interface AcceptBODeliveryDialogProps {
    open: boolean;
    item: any;
    onClose: () => void;
    onAccepted: () => void;
}

export default function AcceptBODeliveryDialog({ open, item, onClose, onAccepted }: AcceptBODeliveryDialogProps) {
    const dispatch = useAppDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [deliveryRemarks, setDeliveryRemarks] = useState('');
    const [deliveredQty, setDeliveredQty] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);

    useEffect(() => {
        if (open) {
            setDeliveryRemarks('');
            setDeliveredQty('');
            setPaidAmount(Number(item?.bo_paid_amount) || 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item]);

    const pendingAmount = Math.max(0, (Number(item?.bo_cost) || 0) - paidAmount);

    const handleMarkAsPaid = () => {
        dispatch(recordBoughtoutPayment({
            production_boughtout_id: item.bo_id,
            paid_amount: pendingAmount,
            mode: 'Cash',
            remarks: 'Settled at delivery acceptance',
        })).unwrap().then((res: any) => {
            if (res?.message?.includes('success')) {
                DisplaySnackbar(res.message, 'success', enqueueSnackbar);
                setPaidAmount(Number(item?.bo_cost) || 0);
            } else {
                DisplaySnackbar('Unable to record payment', 'error', enqueueSnackbar);
            }
        });
    };

    const handleAccept = () => {
        if (!deliveredQty) return;
        dispatch(deliverProductionMachineBO({
            production_boughtout_id: item.bo_id,
            order_id: item.bo_order_id,
            bought_out_name: item.bo_bought_out_name,
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
            PaperProps={{ sx: { width: '100%', maxWidth: '30vw!important' } }}
            open={open}
            onClose={(_event, reason) => { if (reason !== 'backdropClick') onClose(); }}
        >
            <DialogTitle sx={{ fontSize: '14px' }}>Update Delivery status for {item?.bo_bought_out_name}</DialogTitle>
            <DialogContent>
                <TextField size="small" variant="outlined" fullWidth disabled label="Pending Amount" sx={{ mt: 1 }} value={pendingAmount} />
                {pendingAmount > 0 && (
                    <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={handleMarkAsPaid}>
                        Mark as Paid
                    </Button>
                )}
                <TextField
                    size="small" variant="outlined" fullWidth label="Delivery Remarks" multiline rows={4} sx={{ mt: 2 }}
                    value={deliveryRemarks} onChange={(e) => setDeliveryRemarks(e.target.value)}
                />
                <TextField size="small" variant="outlined" fullWidth label="Ordered Qty" disabled sx={{ mt: 1 }} value={item?.bo_order_qty || '0'} />
                <TextField
                    size="small" variant="outlined" fullWidth label="Delivered Qty" sx={{ mt: 1 }}
                    value={deliveredQty} onChange={(e) => setDeliveredQty(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: '#bb0037' }}>Cancel</Button>
                <Button variant="contained" disabled={pendingAmount > 0} onClick={handleAccept}>
                    Delivered
                </Button>
            </DialogActions>
        </Dialog>
    );
}
