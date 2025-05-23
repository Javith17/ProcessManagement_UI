import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchVendorDetail, fetchVendors } from '../slices/adminSlice';
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, InputAdornment, Pagination, TextField } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { nav_vendors, page_limit, TableRowStyled } from '../constants';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';

export default function Vendors() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { vendors, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const [vendorProcessList, setVendorProcessList] = React.useState<any[]>([])
  const [vendorProcessDialog, setVendorProcessDialog] = React.useState({
    dialog: false,
    vendorName: ''
  })
  const [pageNo, setPageNo] = React.useState(1)

  useEffect(() => {
    dispatch(fetchVendors({ limit: page_limit, page: pageNo })).unwrap()
  }, [dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchVendors({ searchText })).unwrap()
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_vendors} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
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
          <Button variant="contained" startIcon={<Add />} size="small"
            onClick={() => {
              navigate("/vendors/newVendor")
            }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell>Vendor Contact No</TableCell>
                  <TableCell>Vendor Address</TableCell>
                  <TableCell>Vendor GST</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.list?.length > 0 ? vendors.list?.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.vendor_name}</TableCell>
                    <TableCell>{row.vendor_mobile_no1}</TableCell>
                    <TableCell>{`${row.vendor_address1}\n${row.vendor_address2}\n${row.vendor_city}\n${row.vendor_state}\n${row.vendor_pincode}`}</TableCell>
                    <TableCell>{row.vendor_gst}</TableCell>
                    <TableCell><MdOutlineRemoveRedEye style={{cursor:'pointer', width:'20px', height:'20px'}} onClick={() => {
                      dispatch(fetchVendorDetail(row?.id)).unwrap().then((res: any) => {
                        setVendorProcessList(res.vendorProcess?.map((vp: any) => vp.process_name))
                        setVendorProcessDialog({ dialog: true, vendorName: row.vendor_name })
                      })
                    }} /></TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate("/vendors/newVendor", {
                        state: {
                          vendor_id: row.id
                        }
                      })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={5} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={vendors.count / page_limit} shape="rounded" sx={{
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

      <Dialog
        maxWidth={'md'}
        open={vendorProcessDialog.dialog}>
        <DialogTitle>Process List for {vendorProcessDialog.vendorName}</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setVendorProcessDialog({ dialog: false, vendorName: '' })
          }} sx={{ color: '#bb0037' }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
