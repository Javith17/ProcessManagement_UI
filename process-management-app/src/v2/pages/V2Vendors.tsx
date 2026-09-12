import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { deleteVendor, fetchVendorDetail, fetchVendors, makeVendorPayment } from '../../slices/adminSlice';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, InputAdornment, InputLabel, MenuItem, Pagination, Select, TextField, Typography } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { page_limit } from '../../constants';
import RefreshButton from '../../components/RefreshButton';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Vendors.tsx. Known bug reproduced verbatim:
// - Pagination's own onChange re-dispatches fetchVendors({limit, page}) WITHOUT
//   the current searchText, unlike handleRefresh which includes it, so paging
//   silently drops any active search filter.
// - Pagination count is `vendors.count / page_limit` (no Math.ceil)
export default function V2Vendors() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { vendors, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const [vendorProcessList, setVendorProcessList] = React.useState<any[]>([])
  const [vendorProcessDialog, setVendorProcessDialog] = React.useState<{ dialog: boolean, vendorId: string, vendorName: string, pendingPayment: string }>({
    dialog: false,
    vendorId: '',
    vendorName: '',
    pendingPayment: '0'
  })
  const [vendorPaymentDialog, setVendorPaymentDialog] = React.useState(false)
  const [vendorPaymentData, setVendorPaymentData] = React.useState<{ paidAmount: string, mode: string, remarks: string }>({
    paidAmount: '', mode: 'Cash', remarks: ''
  })
  const [pageNo, setPageNo] = React.useState(1)
  const [deleteDialog, setDeleteDialog] = React.useState({ dialog: false, id: '', name: '' })

  useEffect(() => {
    dispatch(fetchVendors({ limit: page_limit, page: pageNo })).unwrap()
  }, [dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchVendors({ searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchVendors({ limit: page_limit, page: pageNo, searchText })).unwrap()
  }

  return (
    <V2PageShell currentPage="vendor">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search by vendor or process'
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <RefreshButton onClick={handleRefresh} />
            <Button variant="contained" startIcon={<Add />} size="small"
              onClick={() => {
                navigate("/v2/vendors/newVendor")
              }}>
              Add New
            </Button>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell>Vendor Contact No</TableCell>
                  <TableCell>Vendor Address</TableCell>
                  <TableCell>Vendor GST</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.list?.length > 0 ? vendors.list?.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.vendor_name}</TableCell>
                    <TableCell>{row.vendor_mobile_no1}</TableCell>
                    <TableCell>{`${row.vendor_address1}\n${row.vendor_address2}\n${row.vendor_city}\n${row.vendor_state}\n${row.vendor_pincode}`}</TableCell>
                    <TableCell>{row.vendor_gst}</TableCell>
                    <TableCell><MdOutlineRemoveRedEye style={{ cursor: 'pointer', width: '20px', height: '20px' }} onClick={() => {
                      dispatch(fetchVendorDetail(row?.id)).unwrap().then((res: any) => {
                        setVendorProcessList(res.vendorProcess?.map((vp: any) => vp.process_name))
                        setVendorProcessDialog({ dialog: true, vendorId: row.id, vendorName: row.vendor_name, pendingPayment: res.vendor?.pending_payment || '0' })
                      })
                    }} /></TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate("/v2/vendors/newVendor", {
                        state: {
                          vendor_id: row.id
                        }
                      })
                    }} /></TableCell>
                    <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }} onClick={() => {
                      setDeleteDialog({ dialog: true, id: row.id, name: row.vendor_name })
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={5} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={Math.ceil(vendors.count / page_limit)} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt: 2
          }} onChange={(e: any, value: number) => {
            dispatch(fetchVendors({ limit: page_limit, page: value }))
          }} />

        </Grid2>
      </Grid2>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

      {/* View vendor process list */}

      <V2Drawer
        open={vendorProcessDialog.dialog}
        onClose={() => setVendorProcessDialog({ dialog: false, vendorId: '', vendorName: '', pendingPayment: '0' })}
        title={`Process List for ${vendorProcessDialog.vendorName}`}
        actions={<Button variant='text' onClick={() => {
          setVendorProcessDialog({ dialog: false, vendorId: '', vendorName: '', pendingPayment: '0' })
        }} sx={{ color: v2Colors.primary }}>Close</Button>}
      >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='subtitle1'>Payable amount pending: {vendorProcessDialog.pendingPayment}</Typography>
            <Button variant='contained' size='small' onClick={() => {
              setVendorPaymentData({ paidAmount: '', mode: 'Cash', remarks: '' })
              setVendorPaymentDialog(true)
            }}>Make Payment</Button>
          </Box>
          {vendorProcessList.length > 0 &&
            <CTable small striped style={{ marginTop: '5px' }}>
              <CTableHead color='danger'>
                <CTableRow>
                  <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Process Name</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {vendorProcessList.map((process: any) => {
                  return <CTableRow>
                    <CTableDataCell style={{ fontWeight: 'initial' }}>{process}</CTableDataCell>
                  </CTableRow>
                })}
              </CTableBody>
            </CTable>}
      </V2Drawer>

      {/* Make payment against a vendor's pending balance */}

      <V2Drawer
        open={vendorPaymentDialog}
        onClose={() => setVendorPaymentDialog(false)}
        title={`Make Payment to ${vendorProcessDialog.vendorName}`}
        actions={<>
          <Button variant='text' onClick={() => {
            setVendorPaymentDialog(false)
          }} sx={{ color: v2Colors.primary }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            dispatch(makeVendorPayment({
              vendor_id: vendorProcessDialog.vendorId,
              paid_amount: Number(vendorPaymentData.paidAmount) || 0,
              mode: vendorPaymentData.mode,
              remarks: vendorPaymentData.remarks
            })).unwrap().then((res: any) => {
              if (res?.message?.includes('success')) {
                DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                const remaining = Math.max(0, Number(vendorProcessDialog.pendingPayment) - (Number(vendorPaymentData.paidAmount) || 0))
                setVendorProcessDialog({ ...vendorProcessDialog, pendingPayment: String(remaining) })
                setVendorPaymentDialog(false)
              } else {
                DisplaySnackbar('Unable to record payment', 'error', enqueueSnackbar)
              }
            })
          }}>Pay</Button>
        </>}
      >
          <TextField
            size='small'
            variant="outlined"
            fullWidth
            disabled
            label="Amount"
            value={vendorProcessDialog.pendingPayment}
          />
          <TextField
            size='small'
            variant="outlined"
            fullWidth
            type="number"
            label="Paid Amount"
            sx={{ mt: 2 }}
            value={vendorPaymentData.paidAmount}
            onChange={(e: any) => {
              setVendorPaymentData({ ...vendorPaymentData, paidAmount: e.target.value })
            }}
          />
          <FormControl fullWidth size='small' sx={{ mt: 2 }}>
            <InputLabel>Mode of Payment</InputLabel>
            <Select
              label="Mode of Payment"
              value={vendorPaymentData.mode}
              onChange={(e) => {
                setVendorPaymentData({ ...vendorPaymentData, mode: e.target.value })
              }}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size='small'
            variant="outlined"
            fullWidth
            label="Payment Remarks"
            multiline
            rows={3}
            sx={{ mt: 2 }}
            value={vendorPaymentData.remarks}
            onChange={(e: any) => {
              setVendorPaymentData({ ...vendorPaymentData, remarks: e.target.value })
            }}
          />
      </V2Drawer>

      <Dialog
        maxWidth={'sm'}
        open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialog({ dialog: false, id: '', name: '' })
          }} sx={{ color: v2Colors.primary }}>No</Button>
          <Button variant="contained" size="small" onClick={() => {
            dispatch(deleteVendor({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' })
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar)
              dispatch(fetchVendors({ limit: page_limit, page: pageNo }))
            }).catch((err: any) => {
              enqueueSnackbar('Unable to delete vendor', { variant: 'error' });
            })
          }}>Yes</Button>
        </DialogActions>
      </Dialog>

    </V2PageShell>
  );
}
