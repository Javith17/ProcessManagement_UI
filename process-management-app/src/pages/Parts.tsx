import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, InputAdornment, Pagination, Paper, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchProcessList, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { fetchPartsList } from '../slices/machineSlice';
import { useNavigate } from 'react-router-dom';
import { nav_parts, page_limit, TableRowStyled } from '../constants';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';

export default function Parts() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { parts, machineStatus } = useAppSelector(
    (state) => state.machine
  );

  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const [vendorProcessDialog, setVendorProcessDialog] = React.useState({
    dialog: false,
    list: [],
    part_name: ''
  })
  const[pageNo, setPageNo] = React.useState(1)

  useEffect(()=> {
    dispatch(fetchPartsList({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  useEffect(() => {
    setLoadingDialog(machineStatus.includes('loading'))
  }, [machineStatus])

  const handleSearch = () => {
    dispatch(fetchPartsList({searchText})).unwrap()
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_parts} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search parts'
            variant="outlined"
            size='small'
            value={searchText}
            onChange={(e)=>{
              setSearchText(e.target.value)
            }}
            onKeyDown={(ev)=>{
              if(ev.key == "Enter"){
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
          <Button variant="contained" startIcon={<Add />} size="small" onClick={()=>{
            navigate('/parts/newPart')
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda" , fontWeight:'bold'} }}>
              <TableHead>
                <TableRow>
                  <TableCell>Part Name</TableCell>
                  <TableCell>Min. Stock Qty</TableCell>
                  <TableCell>Avail. Stock Qty</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.list.length > 0 ? parts.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.part_name}</TableCell>
                    <TableCell>{row.minimum_stock_qty}</TableCell>
                    <TableCell>{row.available_aty}</TableCell>
                    {/* <TableCell>{row.part_process_list.map((p:any)=> {
                      return (<Chip label={p.process.process_name} sx={{ ml: 1 }} color={'primary'} />)
                    })}</TableCell> */}
                    {/* <TableCell>{row.part_process_list.map((p:any) => Number(p.process_time)).reduce((a: any, c: any) => { return a + c })}</TableCell> */}
                    <TableCell>{row.days}</TableCell>
                    <TableCell><MdOutlineRemoveRedEye style={{width:'20px', height:'20px', cursor:'pointer', textAlign:'center'}} onClick={() => {
                      setVendorProcessDialog({
                        dialog: true,
                        list: row.part_process_list.map((p:any) => p.process.process_name),
                        part_name: row.part_name
                      })
                    }} /></TableCell>
                    <TableCell><MdOutlineEdit style={{cursor:'pointer'}} onClick={()=>{
                      navigate('/parts/editPart', {
                        state: {
                          id: row.id
                        }
                      })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                      <TableCell colSpan={4} align='center'>No Data</TableCell>
                    </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={parts.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchPartsList({limit: page_limit, page: value}))
          }}/>

        </Grid2>
      </Grid2>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
          <CircularProgress color='success' sx={{m:3}} />
      </Dialog>
      
      {/* View Parts Process list */}

      <Dialog
        maxWidth={'md'}
        open={vendorProcessDialog.dialog}>
        <DialogTitle>Process List for {vendorProcessDialog.part_name}</DialogTitle>
        <DialogContent>
          {vendorProcessDialog.list.length > 0 &&
            <CTable small striped style={{ marginTop: '5px' }}>
              <CTableHead color='danger'>
                <CTableRow>
                  <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Process Name</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {vendorProcessDialog.list.map((process: any) => {
                  return <CTableRow>
                    <CTableDataCell style={{ fontWeight: 'initial' }}>{process}</CTableDataCell>
                  </CTableRow>
                })}
              </CTableBody>
            </CTable>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setVendorProcessDialog({ dialog: false, part_name: '', list: [] })
          }} sx={{ color: '#bb0037' }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
