import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, InputAdornment, Pagination, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { deleteSupplier, fetchSuppliers } from '../../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { page_limit } from '../../constants';
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import V2PageShell from '../components/V2PageShell';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Suppliers.tsx. Kept verbatim:
// - delete failure path uses a plain enqueueSnackbar, not DisplaySnackbar
export default function V2Suppliers() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { suppliers, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const [pageNo, setPageNo] = React.useState(1)
  const [deleteDialog, setDeleteDialog] = React.useState({ dialog: false, id: '', name: '' })

  useEffect(() => {
    dispatch(fetchSuppliers({ limit: page_limit, page: pageNo })).unwrap()
  }, [dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchSuppliers({ searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchSuppliers({ limit: page_limit, page: pageNo, searchText })).unwrap()
  }

  return (
    <V2PageShell currentPage="supplier">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search by supplier or boughtout'
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
            <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
              navigate('/v2/suppliers/newSupplier')
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
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Supplier Contact No</TableCell>
                  <TableCell>Supplier Address</TableCell>
                  <TableCell>Supplier GST</TableCell>
                  <TableCell>Pending Payment</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.list.length > 0 ? suppliers.list.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.supplier_name}</TableCell>
                    <TableCell>{row.supplier_mobile_no1}</TableCell>
                    <TableCell>{`${row.supplier_address1}\n${row.supplier_address2}\n${row.supplier_city}\n${row.supplier_state}\n${row.supplier_pincode}`}</TableCell>
                    <TableCell>{row.supplier_gst}</TableCell>
                    <TableCell>{row.pending_payment ?? '0'}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate('/v2/suppliers/newSupplier', {
                        state: {
                          supplier_id: row.id
                        }
                      })
                    }} /></TableCell>
                    <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }} onClick={() => {
                      setDeleteDialog({ dialog: true, id: row.id, name: row.supplier_name })
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={5} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={Math.ceil(suppliers.count / page_limit)} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt: 2
          }} onChange={(e: any, value: number) => {
            dispatch(fetchSuppliers({ limit: page_limit, page: value }))
          }} />
        </Grid2>
      </Grid2>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

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
            dispatch(deleteSupplier({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' })
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar)
              dispatch(fetchSuppliers({ limit: page_limit, page: pageNo }))
            }).catch((err: any) => {
              enqueueSnackbar('Unable to delete supplier', { variant: 'error' });
            })
          }}>Yes</Button>
        </DialogActions>
      </Dialog>
    </V2PageShell>
  );
}
