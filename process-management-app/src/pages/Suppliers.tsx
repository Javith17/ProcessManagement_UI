import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Card, CircularProgress, Dialog, FormControl, Grid2, Input, InputAdornment, InputLabel, Pagination, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchRoles, fetchSuppliers, fetchUsers, fetchVendors } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { Stack } from '@mui/system';
import { MdOutlineEdit } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { nav_suppliers, page_limit, TableRowStyled } from '../constants';

export default function Suppliers() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { suppliers, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const[pageNo, setPageNo] = React.useState(1)

  useEffect(()=> {
    dispatch(fetchSuppliers({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchSuppliers({searchText})).unwrap()
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_suppliers} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search by supplier or boughtout'
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
            navigate('/suppliers/newSupplier')
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda", fontWeight:'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Supplier Contact No</TableCell>
                  <TableCell>Supplier Address</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.list.length > 0 ? suppliers.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.supplier_name}</TableCell>
                    <TableCell>{row.supplier_mobile_no1}</TableCell>
                    <TableCell>{`${row.supplier_address1}\n${row.supplier_address2}\n${row.supplier_city}\n${row.supplier_state}\n${row.supplier_pincode}`}</TableCell>
                    <TableCell><MdOutlineEdit style={{cursor:'pointer'}} onClick={()=>{
                      navigate('/suppliers/newSupplier', {
                        state: {
                          supplier_id: row.id
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

          <Pagination count={suppliers.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchSuppliers({limit: page_limit, page: value}))
          }}/>
        </Grid2>
      </Grid2>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
          <CircularProgress color='success' sx={{m:3}} />
      </Dialog>
    </Box>
  );
}
