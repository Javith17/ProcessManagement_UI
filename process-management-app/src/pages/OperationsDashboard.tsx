import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Grid2, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Button, TextField,
} from '@mui/material';
import { CloseSharp } from '@mui/icons-material';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { useSnackbar } from 'notistack';
import moment from 'moment';
import SidebarNav from './SidebarNav';
import RefreshButton from '../components/RefreshButton';
import StatTile from '../components/StatTile';
import StatusBarChart from '../components/StatusBarChart';
import BucketTable from '../components/BucketTable';
import LowStockTable from '../components/LowStockTable';
import OrderProgressRow from '../components/OrderProgressRow';
import AcceptPartDeliveryDialog from '../components/AcceptPartDeliveryDialog';
import AcceptBODeliveryDialog from '../components/AcceptBODeliveryDialog';
import { dashboardColors, enquiryStatusColors, orderStatusColors, assemblyStatusColors } from '../components/dashboardColors';
import { nav_operations_dashboard, TableRowStyled } from '../constants';
import { useAppDispatch } from '../hooks/redux-hooks';
import { getRole, SuperAdminRole, AdminRole, StoreRole, EngineerRole, FollowupRole } from '../utils/Permissions';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { fetchEnquiries } from '../slices/adminSlice';
import { fetchOrdersList, fetchOrdersDetail, movePartToAssembly, moveBoughtoutToAssembly } from '../slices/quotationSlice';
import {
    fetchDashboardDetail, fetchOrderParts, fetchPartsInStores, fetchPendingDeliveryBOs, fetchPendingDeliveryParts,
    fetchPendingPaymentBOs, fetchVendorsWithPendingPayment,
} from '../slices/dashboardSlice';
import { getMachineMainAssembly, getMachineSectionAssembly, getMachineSubAssembly } from '../slices/assemblySlice';

const ASSEMBLY_STAGES = ['Sourcing', 'Sub-Assembly', 'Section Assembly', 'Main Assembly', 'Assembly Completed'];
const ENQUIRY_STATUSES = ['Open', 'In Progress', 'Approved', 'Rejected'];

function currentUserId(): string | undefined {
    const raw = localStorage.getItem('userDetail');
    return raw ? JSON.parse(raw)?.user?.userId : undefined;
}

function bucketByField(rows: any[], field: string): { label: string, value: number }[] {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
        const key = r[field] || 'Unknown';
        map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({ label: k, value: map[k] })).sort((a, b) => b.value - a.value);
}

function bucketSumByField(rows: any[], groupField: string, sumField?: string): { label: string, value: number }[] {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
        const key = r[groupField] || 'Unknown';
        map[key] = (map[key] || 0) + (sumField ? (Number(r[sumField]) || 0) : 1);
    });
    return Object.keys(map).map((k) => ({ label: k, value: map[k] })).sort((a, b) => b.value - a.value);
}

type StatusCount = { status: string, count: number | string };
type AssemblyItems = { subAssembly: any[], mainAssembly: any[], sectionAssembly: any[] };

function statusTotal(values?: StatusCount[]): number {
    return (values || []).reduce((s, v) => s + (Number(v.count) || 0), 0);
}

function statusCount(values: StatusCount[] | undefined, status: string): number {
    return Number(values?.find((v) => v.status === status)?.count) || 0;
}

// Order progress = share of all parts + boughtouts + sub/main/section-assembly items
// that have reached "Assembly Completed" — this mirrors the backend's own closeAssembly()
// completeness check (order.service.ts), which marks an order done only once every
// sub/main/section-assembly row AND every part/boughtout row carries that exact status.
function orderProgressPercent(order: any, partValues?: StatusCount[], boValues?: StatusCount[], items?: AssemblyItems): number {
    const subItems = items?.subAssembly || [];
    const mainItems = items?.mainAssembly || [];
    const sectionItems = items?.sectionAssembly || [];
    const completedCount = (arr: any[]) => arr.filter((i) => i.status === 'Assembly Completed').length;

    const total = statusTotal(partValues) + statusTotal(boValues) + subItems.length + mainItems.length + sectionItems.length;
    const completed = statusCount(partValues, 'Assembly Completed') + statusCount(boValues, 'Assembly Completed')
        + completedCount(subItems) + completedCount(mainItems) + completedCount(sectionItems);

    if (total === 0) return ['Assembly Completed', 'Order Closed'].includes(order?.status) ? 100 : 0;
    return Math.round((completed / total) * 100);
}

function statusChartData(values?: StatusCount[]): { label: string, value: number }[] {
    return (values || []).map((v) => ({ label: v.status, value: Number(v.count) || 0 }));
}

function assemblyStageIndex(items?: AssemblyItems): number {
    const subItems = items?.subAssembly || [];
    const mainItems = items?.mainAssembly || [];
    const sectionItems = items?.sectionAssembly || [];
    const started = (arr: any[]) => arr.some((i) => i.status === 'Assembly In-Progress' || i.status === 'Assembly Completed');
    if (mainItems.length > 0 && mainItems.every((i) => i.status === 'Assembly Completed')) return 4;
    if (started(sectionItems)) return 3;
    if (started(subItems)) return 2;
    return 1;
}

export default function OperationsDashboard() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [currentRole, setCurrentRole] = useState<string>();

    useEffect(() => {
        setCurrentRole(getRole());
    }, []);

    // ---- Super Admin state ----
    const [enquiriesByStatus, setEnquiriesByStatus] = useState<Record<string, any[]>>({});
    const [activeEnquiryStatus, setActiveEnquiryStatus] = useState<string | null>(null);

    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [inProgressOrders, setInProgressOrders] = useState<any[]>([]);
    const [activeOrderStatus, setActiveOrderStatus] = useState<string | null>(null);
    const [dashboardDetail, setDashboardDetail] = useState<{ partArray?: any[], BOArray?: any[] }>({});
    const [assemblyItemsByOrderId, setAssemblyItemsByOrderId] = useState<Record<string, AssemblyItems>>({});

    const [pendingParts, setPendingParts] = useState<any[]>([]);
    const [pendingBOs, setPendingBOs] = useState<any[]>([]);
    const [activeSupplierBO, setActiveSupplierBO] = useState<string | null>(null);

    const [vendorDues, setVendorDues] = useState<any[]>([]);
    const [supplierDues, setSupplierDues] = useState<any[]>([]);
    const [lowStockParts, setLowStockParts] = useState<any[]>([]);

    const [orderDialog, setOrderDialog] = useState<{ open: boolean, order?: any }>({ open: false });
    const [orderDetailsPopup, setOrderDetailsPopup] = useState<{ open: boolean, order?: any }>({ open: false });
    const [orderDetailsCache, setOrderDetailsCache] = useState<Record<string, { parts: any[], boughtouts: any[] }>>({});

    // ---- Follow-up state ----
    const [followupEnquiries, setFollowupEnquiries] = useState<any[]>([]);

    // ---- Stores state ----
    const [storesPendingParts, setStoresPendingParts] = useState<any[]>([]);
    const [storesPendingBOs, setStoresPendingBOs] = useState<any[]>([]);
    const [storesParts, setStoresParts] = useState<any[]>([]);
    const [pendingAssemblyParts, setPendingAssemblyParts] = useState<any[]>([]);
    const [pendingAssemblyBOs, setPendingAssemblyBOs] = useState<any[]>([]);
    const [acceptPartDialog, setAcceptPartDialog] = useState<{ open: boolean, item?: any }>({ open: false });
    const [acceptBODialog, setAcceptBODialog] = useState<{ open: boolean, item?: any }>({ open: false });
    const [assemblyItem, setAssemblyItem] = useState<any>({});
    const [moveToAssemblyDialog, setMoveToAssemblyDialog] = useState(false);
    const [moveToAssemblyBODialog, setMoveToAssemblyBODialog] = useState(false);

    const refreshStoresPending = () => {
        dispatch(fetchPendingDeliveryParts({})).unwrap().then((res: any) => setStoresPendingParts(res || []));
        dispatch(fetchPendingDeliveryBOs({})).unwrap().then((res: any) => setStoresPendingBOs(res || []));
    };

    const refreshPendingAssembly = () => {
        dispatch(fetchOrderParts()).unwrap().then((res: any) => {
            setPendingAssemblyParts(res?.parts || []);
            setPendingAssemblyBOs(res?.bo || []);
        });
    };

    // ---- Engineer state ----
    const [engineerOrders, setEngineerOrders] = useState<any[]>([]);

    const refreshRef = React.useRef(0);
    const handleRefresh = () => { refreshRef.current += 1; setCurrentRole((r) => r); };

    // For every order shown on a progress board, pull its sub/main/section-assembly
    // item statuses (no bulk endpoint exists for these — one call per assembly type per order).
    const loadAssemblyItems = (orders: any[]) => {
        Promise.all(orders.map((o: any) =>
            Promise.all([
                dispatch(getMachineSubAssembly({ machineId: o.machine?.id, orderId: o.id })).unwrap().catch(() => []),
                dispatch(getMachineMainAssembly({ machineId: o.machine?.id, orderId: o.id })).unwrap().catch(() => []),
                dispatch(getMachineSectionAssembly({ machineId: o.machine?.id, orderId: o.id })).unwrap().catch(() => []),
            ]).then(([subAssembly, mainAssembly, sectionAssembly]): [string, AssemblyItems] => [
                o.id, { subAssembly: subAssembly || [], mainAssembly: mainAssembly || [], sectionAssembly: sectionAssembly || [] }
            ])
        )).then((entries) => setAssemblyItemsByOrderId(Object.fromEntries(entries)));
    };

    useEffect(() => {
        if (!currentRole) return;

        if (currentRole === SuperAdminRole || currentRole === AdminRole) {
            Promise.all(ENQUIRY_STATUSES.map((s) =>
                dispatch(fetchEnquiries({ status: s })).unwrap().then((res: any): [string, any[]] => [s, res?.list || []])
            )).then((entries) => setEnquiriesByStatus(Object.fromEntries(entries)));

            dispatch(fetchOrdersList({})).unwrap().then((res: any) => setAllOrders(res || []));
            dispatch(fetchOrdersList({ search_list: ['In-Progress', 'Assembly Completed'] })).unwrap().then((res: any) => {
                setInProgressOrders(res || []);
                loadAssemblyItems(res || []);
            });
            dispatch(fetchDashboardDetail()).unwrap().then((res: any) => setDashboardDetail(res || {}));

            dispatch(fetchPendingDeliveryParts({})).unwrap().then((res: any) => setPendingParts(res || []));
            dispatch(fetchPendingDeliveryBOs({})).unwrap().then((res: any) => setPendingBOs(res || []));

            dispatch(fetchVendorsWithPendingPayment({})).unwrap().then((res: any) => setVendorDues(res?.list || []));
            dispatch(fetchPendingPaymentBOs({})).unwrap().then((res: any) => setSupplierDues(res?.list || []));

            dispatch(fetchPartsInStores({})).unwrap().then((res: any) => setLowStockParts(res?.list || []));
        }

        if (currentRole === FollowupRole) {
            dispatch(fetchEnquiries({ status: 'In Progress' })).unwrap().then((res: any) => {
                const uid = currentUserId();
                setFollowupEnquiries((res?.list || []).filter((e: any) => e.level2_user?.id === uid));
            });
        }

        if (currentRole === StoreRole) {
            dispatch(fetchPendingDeliveryParts({})).unwrap().then((res: any) => setStoresPendingParts(res || []));
            dispatch(fetchPendingDeliveryBOs({})).unwrap().then((res: any) => setStoresPendingBOs(res || []));
            dispatch(fetchPartsInStores({})).unwrap().then((res: any) => setStoresParts(res?.list || []));
            dispatch(fetchOrderParts()).unwrap().then((res: any) => {
                setPendingAssemblyParts(res?.parts || []);
                setPendingAssemblyBOs(res?.bo || []);
            });
        }

        if (currentRole === EngineerRole) {
            dispatch(fetchOrdersList({ search_list: ['In-Progress'] })).unwrap().then((res: any) => {
                setEngineerOrders(res || []);
                loadAssemblyItems(res || []);
            });
            dispatch(fetchDashboardDetail()).unwrap().then((res: any) => setDashboardDetail(res || {}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRole, refreshRef.current]);

    const openOrderDialog = (order: any) => setOrderDialog({ open: true, order });
    const closeOrderDialog = () => setOrderDialog({ open: false });

    const scrollToId = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Full parts/boughtouts list for an order (used by both the details popup and the
    // per-row pie charts) — fetched once per order id and cached, since neither the
    // pending-delivery lists nor dashboardDetail's status counts carry every row/column needed.
    const ensureOrderDetails = (orderId: string) => {
        if (orderDetailsCache[orderId]) return;
        dispatch(fetchOrdersDetail({ order_id: orderId, type: 'order' })).unwrap().then((res: any) => {
            setOrderDetailsCache((prev) => ({
                ...prev,
                [orderId]: { parts: res?.parts?.orderDetail || [], boughtouts: res?.boughtouts?.orderDetailBoughtout || [] },
            }));
        });
    };

    const openOrderDetailsPopup = (order: any) => {
        setOrderDetailsPopup({ open: true, order });
        ensureOrderDetails(order.id);
    };
    const closeOrderDetailsPopup = () => setOrderDetailsPopup({ open: false });

    const renderOrderDialog = () => {
        const { order } = orderDialog;
        if (!order) return null;
        const items = assemblyItemsByOrderId[order.id];
        const partValues = dashboardDetail.partArray?.find((p) => p.order === order.id)?.values;
        const boValues = dashboardDetail.BOArray?.find((b) => b.order === order.id)?.values;
        const stage = assemblyStageIndex(items);
        const orderParts = pendingParts.filter((p) => p.pm_order_id === order.id);
        const orderBOs = pendingBOs.filter((b) => b.bo_order_id === order.id);
        return (
            <Dialog open={orderDialog.open} onClose={closeOrderDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>{order.machine_name}</Typography>
                        <IconButton onClick={closeOrderDialog}><CloseSharp /></IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {order.customer?.customer_name} — {order.quotation?.quotation_no || order.spares_quotation?.quotation_no}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Assembly stage — {orderProgressPercent(order, partValues, boValues, items)}% complete</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {ASSEMBLY_STAGES.map((name, idx) => (
                            <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    size="small"
                                    label={idx < stage ? 'Done' : idx === stage ? 'Current' : 'Pending'}
                                    sx={{
                                        backgroundColor: idx < stage ? dashboardColors.good : idx === stage ? dashboardColors.info : dashboardColors.slate,
                                        color: 'white',
                                        minWidth: 70,
                                    }}
                                />
                                <Typography variant="body2">{name}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Grid2 container spacing={2} sx={{ mt: 1 }}>
                        <Grid2 size={6}>
                            <Typography variant="subtitle2">Parts by status</Typography>
                            <StatusBarChart data={statusChartData(partValues)} height={160} color={dashboardColors.info} />
                        </Grid2>
                        <Grid2 size={6}>
                            <Typography variant="subtitle2">Boughtouts by status</Typography>
                            <StatusBarChart data={statusChartData(boValues)} height={160} color={dashboardColors.info} />
                        </Grid2>
                    </Grid2>

                    {orderParts.length > 0 && (
                        <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Pending parts ({orderParts.length})</Typography>
                            <Table size="small">
                                <TableBody>
                                    {orderParts.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{p.pm_part_name}</TableCell>
                                            <TableCell>{p.pm_vendor_name}</TableCell>
                                            <TableCell align="right">{p.pm_order_qty}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}

                    {orderBOs.length > 0 && (
                        <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Pending boughtouts ({orderBOs.length})</Typography>
                            <Table size="small">
                                <TableBody>
                                    {orderBOs.map((b, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{b.bo_bought_out_name}</TableCell>
                                            <TableCell>{b.bo_supplier_name}</TableCell>
                                            <TableCell align="right">{b.bo_order_qty}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}

                    {orderParts.length === 0 && orderBOs.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            No pending deliveries for this order.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        );
    };

    const renderOrderDetailsPopup = () => {
        const { order } = orderDetailsPopup;
        if (!order) return null;
        const details = orderDetailsCache[order.id] || { parts: [], boughtouts: [] };
        return (
            <Dialog open={orderDetailsPopup.open} onClose={closeOrderDetailsPopup} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>{order.machine_name}</Typography>
                        <IconButton onClick={closeOrderDetailsPopup}><CloseSharp /></IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {order.customer?.customer_name} — {order.quotation?.quotation_no || order.spares_quotation?.quotation_no}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Parts / processes ({details.parts.length})</Typography>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table size="small" sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Part</TableCell>
                                    <TableCell>Process</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell>Delivery Date</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.parts.length > 0 ? details.parts.map((p: any, i: number) => (
                                    <TableRowStyled key={p.id || i}>
                                        <TableCell>{p.part_name}</TableCell>
                                        <TableCell>{p.process_name}</TableCell>
                                        <TableCell>{p.vendor_name || '—'}</TableCell>
                                        <TableCell align="right">{p.order_qty}</TableCell>
                                        <TableCell>{p.delivery_date ? moment(p.delivery_date).format('DD-MM-YYYY') : '—'}</TableCell>
                                        <TableCell>{p.status}</TableCell>
                                    </TableRowStyled>
                                )) : <TableRow><TableCell colSpan={6} align="center">No Data</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="subtitle2">Boughtouts ({details.boughtouts.length})</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small" sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Boughtout</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.boughtouts.length > 0 ? details.boughtouts.map((b: any, i: number) => (
                                    <TableRowStyled key={b.id || i}>
                                        <TableCell>{b.bought_out_name}</TableCell>
                                        <TableCell>{b.supplier_name || '—'}</TableCell>
                                        <TableCell align="right">{b.order_qty}</TableCell>
                                        <TableCell>{b.status}</TableCell>
                                    </TableRowStyled>
                                )) : <TableRow><TableCell colSpan={4} align="center">No Data</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeOrderDetailsPopup}>Close</Button>
                    <Button variant="contained" onClick={() => {
                        closeOrderDetailsPopup();
                        navigate('/orderDetail', { state: { order_id: order.id, type: 'order' } });
                    }}>
                        View
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderSuperAdminSection = () => {
        const lowStock = lowStockParts.filter((p) => Number(p.available_aty) < Number(p.minimum_stock_qty));
        const inProgressEnquiries = enquiriesByStatus['In Progress'] || [];
        const enquiryBuckets = ENQUIRY_STATUSES.map((s) => ({ label: s, value: (enquiriesByStatus[s] || []).length, color: enquiryStatusColors[s] }));
        const orderBuckets = bucketByField(allOrders, 'status').map((b) => ({ ...b, color: orderStatusColors[b.label] }));
        // Vendor is per-process (a part can have several processes, each with its own vendor),
        // so flatten each pending part's processes into one row per vendor/process assignment.
        const partProcessRows = pendingParts.flatMap((p: any) => (p.processes || []).map((proc: any) => ({
            vendor_name: proc.vendor_name || 'Unassigned',
            part_name: p.pm_part_name,
            process_name: proc.process_name,
            quantity: proc.order_qty ?? p.pm_order_qty,
        })));
        const supplierBOBuckets = bucketSumByField(pendingBOs, 'bo_supplier_name');
        const vendorDueBuckets = vendorDues.map((v) => ({ label: v.name, value: Number(v.pending_payment) || 0 }));
        const supplierDueBuckets = bucketSumByField(
            supplierDues.map((s) => ({ ...s, pending_amount: Math.max(0, (Number(s.cost) || 0) - (Number(s.paid_amount) || 0)) })),
            'supplier_name', 'pending_amount'
        );

        const filteredEnquiries = activeEnquiryStatus ? (enquiriesByStatus[activeEnquiryStatus] || []) : inProgressEnquiries;
        const filteredOrders = activeOrderStatus ? allOrders.filter((o) => o.status === activeOrderStatus) : inProgressOrders;
        const filteredSupplierBOs = activeSupplierBO ? pendingBOs.filter((b) => b.bo_supplier_name === activeSupplierBO) : [];

        return (
            <>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 6, md: 2.4 }}><StatTile label="In-progress orders" value={inProgressOrders.length} color={dashboardColors.warn} onClick={() => scrollToId('orders-section')} /></Grid2>
                    <Grid2 size={{ xs: 6, md: 2.4 }}><StatTile label="In-progress enquiries" value={inProgressEnquiries.length} color={dashboardColors.info} onClick={() => scrollToId('enquiries-section')} /></Grid2>
                    <Grid2 size={{ xs: 6, md: 2.4 }}><StatTile label="Pending parts" value={pendingParts.length} color={dashboardColors.info} onClick={() => scrollToId('parts-section')} /></Grid2>
                    <Grid2 size={{ xs: 6, md: 2.4 }}><StatTile label="Pending boughtouts" value={pendingBOs.length} color={dashboardColors.warn} onClick={() => scrollToId('bos-section')} /></Grid2>
                    <Grid2 size={{ xs: 6, md: 2.4 }}><StatTile label="Low-stock parts" value={lowStock.length} color={dashboardColors.critical} onClick={() => scrollToId('lowstock-section')} /></Grid2>
                </Grid2>

                <Grid2 container spacing={2} sx={{ mt: 1 }} id="enquiries-section">
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Enquiries by status</Typography>
                            <StatusBarChart data={enquiryBuckets} onBarClick={(l) => setActiveEnquiryStatus(activeEnquiryStatus === l ? null : l)} />
                        </Card>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Orders by status</Typography>
                            <StatusBarChart data={orderBuckets} onBarClick={(l) => setActiveOrderStatus(activeOrderStatus === l ? null : l)} />
                        </Card>
                    </Grid2>
                </Grid2>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    {activeEnquiryStatus ? `Enquiries — ${activeEnquiryStatus}` : 'In-progress enquiries'}
                </Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Customer Name</TableCell>
                                <TableCell>Machine Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Follow-up User</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEnquiries.length > 0 ? filteredEnquiries.map((row: any) => (
                                <TableRowStyled key={row.id}>
                                    <TableCell>{row.customer_name}</TableCell>
                                    <TableCell>{row.machine_name}</TableCell>
                                    <TableCell>{activeEnquiryStatus || 'In Progress'}</TableCell>
                                    <TableCell>{row.level2_user?.emp_name || '—'}</TableCell>
                                    <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => navigate('/enquiries')} /></TableCell>
                                </TableRowStyled>
                            )) : <TableRow><TableCell colSpan={5} align="center">No Data</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }} id="orders-section">Order progress board</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {filteredOrders.length > 0 ? filteredOrders.map((order: any) => {
                        const items = assemblyItemsByOrderId[order.id];
                        const partValues = dashboardDetail.partArray?.find((p) => p.order === order.id)?.values;
                        const boValues = dashboardDetail.BOArray?.find((b) => b.order === order.id)?.values;
                        return (
                            <OrderProgressRow
                                key={order.id}
                                orderId={order.quotation?.quotation_no || order.spares_quotation?.quotation_no || order.id}
                                machineName={order.machine_name}
                                customerName={order.customer?.customer_name}
                                status={order.status}
                                percent={orderProgressPercent(order, partValues, boValues, items)}
                                onClick={() => openOrderDialog(order)}
                                onView={() => openOrderDetailsPopup(order)}
                            />
                        );
                    }) : <Typography variant="body2" color="text.secondary">No orders in progress.</Typography>}
                </Box>

                <Grid2 container spacing={2} sx={{ mt: 3 }}>
                    <Grid2 size={{ xs: 12, md: 6 }} id="parts-section">
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending parts by vendor</Typography>
                            <Table size="small" sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Vendor Name</TableCell>
                                        <TableCell>Part Name</TableCell>
                                        <TableCell>Process Name</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {partProcessRows.length > 0 ? partProcessRows.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{p.vendor_name}</TableCell>
                                            <TableCell>{p.part_name}</TableCell>
                                            <TableCell>{p.process_name}</TableCell>
                                            <TableCell align="right">{p.quantity}</TableCell>
                                            <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => navigate('/parts')} /></TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={5} align="center">No Data</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }} id="bos-section">
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending boughtouts by supplier</Typography>
                            <BucketTable data={supplierBOBuckets} labelHeader="Supplier" valueHeader="Pending Boughtouts" activeLabel={activeSupplierBO} onRowClick={(l) => setActiveSupplierBO(activeSupplierBO === l ? null : l)} />
                            {activeSupplierBO && (
                                <Table size="small" sx={{ mt: 1 }}>
                                    <TableBody>
                                        {filteredSupplierBOs.map((b, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{b.bo_bought_out_name}</TableCell>
                                                <TableCell>{b.o_machine_name}</TableCell>
                                                <TableCell align="right">{b.bo_order_qty}</TableCell>
                                                <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => navigate('/boughtout')} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </Grid2>
                </Grid2>

                <Grid2 container spacing={2} sx={{ mt: 1 }}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending amount — vendors</Typography>
                            <BucketTable data={vendorDueBuckets} labelHeader="Vendor" valueHeader="Pending Amount" valueFormatter={(v) => `₹${v}`} />
                        </Card>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending amount — suppliers</Typography>
                            <BucketTable data={supplierDueBuckets} labelHeader="Supplier" valueHeader="Pending Amount" valueFormatter={(v) => `₹${v}`} />
                        </Card>
                    </Grid2>
                </Grid2>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }} id="lowstock-section">Low-stock parts</Typography>
                <LowStockTable parts={lowStockParts} lowStockOnly onView={() => navigate('/parts')} />
            </>
        );
    };

    const renderFollowupSection = () => (
        <>
            <Typography variant="h6" sx={{ mb: 1 }}>Your in-progress enquiries</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Machine Name</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {followupEnquiries.length > 0 ? followupEnquiries.map((row: any) => (
                            <TableRowStyled key={row.id}>
                                <TableCell>{row.customer_name}</TableCell>
                                <TableCell>{row.machine_name}</TableCell>
                                <TableCell>In Progress</TableCell>
                            </TableRowStyled>
                        )) : <TableRow><TableCell colSpan={3} align="center">No Data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            <Card sx={{ p: 2, mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pending vendor parts / supplier boughtouts</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Scoping these to your own orders requires backend support that hasn't shipped yet
                    (a <code>followup_user_id</code> filter on the delivery-pending endpoints). This widget will
                    populate once that support is available.
                </Typography>
            </Card>
        </>
    );

    const renderStoresSection = () => (
        <>
            <Typography variant="h6" sx={{ mb: 1 }}>Pending parts to deliver</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Machine Name</TableCell>
                            <TableCell>Quotation No</TableCell>
                            <TableCell>Part Name</TableCell>
                            <TableCell>Vendor</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {storesPendingParts.length > 0 ? storesPendingParts.map((row: any, idx: number) => (
                            <TableRowStyled key={idx}>
                                <TableCell>{row.o_machine_name}</TableCell>
                                <TableCell>{row.q_quotation_no}</TableCell>
                                <TableCell>{row.pm_part_name}</TableCell>
                                <TableCell>{(row.processes || []).map((p: any) => p.vendor_name).filter(Boolean).join(', ')}</TableCell>
                                <TableCell align="right">{row.pm_order_qty}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => setAcceptPartDialog({ open: true, item: row })}>
                                        Accept Delivery
                                    </Button>
                                </TableCell>
                                <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => navigate('/parts')} /></TableCell>
                            </TableRowStyled>
                        )) : <TableRow><TableCell colSpan={7} align="center">No Data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Pending boughtouts to deliver</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Machine Name</TableCell>
                            <TableCell>Quotation No</TableCell>
                            <TableCell>Boughtout Name</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {storesPendingBOs.length > 0 ? storesPendingBOs.map((row: any, idx: number) => (
                            <TableRowStyled key={idx}>
                                <TableCell>{row.o_machine_name}</TableCell>
                                <TableCell>{row.q_quotation_no}</TableCell>
                                <TableCell>{row.bo_bought_out_name}</TableCell>
                                <TableCell>{row.bo_supplier_name}</TableCell>
                                <TableCell align="right">{row.bo_order_qty}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => setAcceptBODialog({ open: true, item: row })}>
                                        Accept Delivery
                                    </Button>
                                </TableCell>
                                <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => navigate('/boughtout')} /></TableCell>
                            </TableRowStyled>
                        )) : <TableRow><TableCell colSpan={7} align="center">No Data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Parts pending assembly</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Machine Name</TableCell>
                            <TableCell>Order No</TableCell>
                            <TableCell>Part Code</TableCell>
                            <TableCell>Part Name</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell>Vendor</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingAssemblyParts.length > 0 ? pendingAssemblyParts.map((row: any, idx: number) => (
                            <TableRowStyled key={row.id || idx}>
                                <TableCell>{row.o_machine_name}</TableCell>
                                <TableCell>{row.q_quotation_no}</TableCell>
                                <TableCell>{row.pm_part_code}</TableCell>
                                <TableCell>{row.pm_part_name}</TableCell>
                                <TableCell align="right">{row.pm_required_qty}</TableCell>
                                <TableCell>{row.pm_vendor_name || 'From Stores'}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => { setAssemblyItem(row); setMoveToAssemblyDialog(true); }}>
                                        Move to Assembly
                                    </Button>
                                </TableCell>
                            </TableRowStyled>
                        )) : <TableRow><TableCell colSpan={7} align="center">No Data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Boughtouts pending assembly</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head': { backgroundColor: '#fadbda', fontWeight: 'bold' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Machine Name</TableCell>
                            <TableCell>Order No</TableCell>
                            <TableCell>Boughtout Name</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingAssemblyBOs.length > 0 ? pendingAssemblyBOs.map((row: any, idx: number) => (
                            <TableRowStyled key={row.id || idx}>
                                <TableCell>{row.o_machine_name}</TableCell>
                                <TableCell>{row.q_quotation_no}</TableCell>
                                <TableCell>{row.bo_bought_out_name}</TableCell>
                                <TableCell align="right">{row.bo_order_qty}</TableCell>
                                <TableCell>{row.bo_supplier_name}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => { setAssemblyItem(row); setMoveToAssemblyBODialog(true); }}>
                                        Move to Assembly
                                    </Button>
                                </TableCell>
                            </TableRowStyled>
                        )) : <TableRow><TableCell colSpan={6} align="center">No Data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Parts stock</Typography>
            <LowStockTable parts={storesParts} onView={() => navigate('/parts')} />

            <AcceptPartDeliveryDialog
                open={acceptPartDialog.open}
                item={acceptPartDialog.item}
                onClose={() => setAcceptPartDialog({ open: false })}
                onAccepted={refreshStoresPending}
            />
            <AcceptBODeliveryDialog
                open={acceptBODialog.open}
                item={acceptBODialog.item}
                onClose={() => setAcceptBODialog({ open: false })}
                onAccepted={refreshStoresPending}
            />

            <Dialog
                PaperProps={{ sx: { width: '100%', maxWidth: '30vw!important' } }}
                open={moveToAssemblyDialog}
                onClose={(event, reason) => { if (reason === 'backdropClick') return; setMoveToAssemblyDialog(false); }}
            >
                <DialogTitle sx={{ fontSize: '14px' }}>
                    Move {assemblyItem?.pm_part_name} to Assembly
                    <Typography variant="body2" color="text.secondary">Part Code: {assemblyItem?.pm_part_code}</Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        size="small" variant="outlined" fullWidth multiline rows={4}
                        label="Stores Remarks" sx={{ mt: 1 }}
                        value={assemblyItem?.remarks || ''}
                        onChange={(e: any) => setAssemblyItem({ ...assemblyItem, remarks: e.target.value })}
                    />
                    <TextField
                        size="small" variant="outlined" fullWidth disabled sx={{ mt: 1 }}
                        label="Available Qty" value={assemblyItem?.p_available_aty || '0'}
                    />
                    <TextField
                        size="small" variant="outlined" fullWidth disabled sx={{ mt: 1 }}
                        label="Required Qty" value={assemblyItem?.pm_required_qty || '0'}
                    />
                    <TextField
                        size="small" variant="outlined" fullWidth sx={{ mt: 1 }}
                        label="Qty" value={assemblyItem?.assembly_qty || ''}
                        onChange={(e: any) => setAssemblyItem({ ...assemblyItem, assembly_qty: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMoveToAssemblyDialog(false); setAssemblyItem({}); }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (assemblyItem?.assembly_qty?.length > 0) {
                            dispatch(movePartToAssembly({
                                order_id: assemblyItem.pm_order_id,
                                part_name: assemblyItem.pm_part_name,
                                remarks: assemblyItem.remarks,
                                assembly_qty: assemblyItem.assembly_qty,
                            })).unwrap().then((res: any) => {
                                if (res.message?.includes('success')) {
                                    DisplaySnackbar(res, 'success', enqueueSnackbar);
                                    setMoveToAssemblyDialog(false);
                                    setAssemblyItem({});
                                    refreshPendingAssembly();
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar);
                                }
                            });
                        }
                    }}>
                        Move to Assembly
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                PaperProps={{ sx: { width: '100%', maxWidth: '30vw!important' } }}
                open={moveToAssemblyBODialog}
                onClose={(event, reason) => { if (reason === 'backdropClick') return; setMoveToAssemblyBODialog(false); }}
            >
                <DialogTitle sx={{ fontSize: '14px' }}>Move {assemblyItem?.bo_bought_out_name} to Assembly</DialogTitle>
                <DialogContent>
                    <TextField
                        size="small" variant="outlined" fullWidth multiline rows={4}
                        label="Stores Remarks" sx={{ mt: 1 }}
                        value={assemblyItem?.remarks || ''}
                        onChange={(e: any) => setAssemblyItem({ ...assemblyItem, remarks: e.target.value })}
                    />
                    <TextField
                        size="small" variant="outlined" fullWidth disabled sx={{ mt: 1 }}
                        label="Required Qty" value={assemblyItem?.bo_order_qty || '0'}
                    />
                    <TextField
                        size="small" variant="outlined" fullWidth sx={{ mt: 1 }}
                        label="Qty" value={assemblyItem?.assembly_qty || ''}
                        onChange={(e: any) => setAssemblyItem({ ...assemblyItem, assembly_qty: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMoveToAssemblyBODialog(false); setAssemblyItem({}); }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (assemblyItem?.assembly_qty?.length > 0) {
                            dispatch(moveBoughtoutToAssembly({
                                production_boughtout_id: assemblyItem.bo_id,
                                order_id: assemblyItem.bo_id,
                                bought_out_name: assemblyItem.bo_bought_out_name,
                                remarks: assemblyItem.remarks,
                                assembly_qty: assemblyItem.assembly_qty,
                            })).unwrap().then((res: any) => {
                                if (res.message?.includes('success')) {
                                    DisplaySnackbar(res, 'success', enqueueSnackbar);
                                    setMoveToAssemblyBODialog(false);
                                    setAssemblyItem({});
                                    refreshPendingAssembly();
                                } else {
                                    DisplaySnackbar(res.message, 'error', enqueueSnackbar);
                                }
                            });
                        }
                    }}>
                        Move to Assembly
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    const renderEngineerSection = () => {
        return (
            <>
                <Typography variant="h6" sx={{ mb: 1 }}>Orders in progress</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {engineerOrders.length > 0 ? engineerOrders.map((order: any) => {
                        const items = assemblyItemsByOrderId[order.id];
                        const partValues = dashboardDetail.partArray?.find((p) => p.order === order.id)?.values;
                        const boValues = dashboardDetail.BOArray?.find((b) => b.order === order.id)?.values;
                        const subItems = items?.subAssembly || [];
                        const mainItems = items?.mainAssembly || [];
                        const sectionItems = items?.sectionAssembly || [];
                        const completedCount = (arr: any[]) => arr.filter((i) => i.status === 'Assembly Completed').length;
                        const caption = items
                            ? `Sub ${completedCount(subItems)}/${subItems.length} · `
                              + `Section ${completedCount(sectionItems)}/${sectionItems.length} · `
                              + `Main ${completedCount(mainItems)}/${mainItems.length}`
                            : 'Assembly progress data unavailable';
                        return (
                            <OrderProgressRow
                                key={order.id}
                                orderId={order.quotation?.quotation_no || order.spares_quotation?.quotation_no || order.id}
                                machineName={order.machine_name}
                                customerName={order.customer?.customer_name}
                                status={order.status}
                                percent={orderProgressPercent(order, partValues, boValues, items)}
                                caption={caption}
                                onClick={() => openOrderDialog(order)}
                                onView={() => openOrderDetailsPopup(order)}
                            />
                        );
                    }) : <Typography variant="body2" color="text.secondary">No orders in progress.</Typography>}
                </Box>
            </>
        );
    };

    const renderNoDashboardFallback = () => (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary">No dashboard configured for your role.</Typography>
            <Typography variant="body2" color="text.secondary">Contact an administrator if you believe this is incorrect.</Typography>
        </Box>
    );

    const knownRoles = [SuperAdminRole, AdminRole, FollowupRole, StoreRole, EngineerRole];

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_operations_dashboard} />
            <Box sx={{ flexGrow: 1, mt: 10, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Operations Dashboard</Typography>
                    <RefreshButton onClick={handleRefresh} />
                </Box>

                {(currentRole === SuperAdminRole || currentRole === AdminRole) && renderSuperAdminSection()}
                {currentRole === FollowupRole && renderFollowupSection()}
                {currentRole === StoreRole && renderStoresSection()}
                {currentRole === EngineerRole && renderEngineerSection()}
                {currentRole && !knownRoles.includes(currentRole) && renderNoDashboardFallback()}
            </Box>
            {renderOrderDialog()}
            {renderOrderDetailsPopup()}
        </Box>
    );
}
