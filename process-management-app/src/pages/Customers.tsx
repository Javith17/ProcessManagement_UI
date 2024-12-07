import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, CircularProgress, Dialog, Grid2, InputAdornment, Pagination, Paper, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { nav_customers, page_limit, TableRowStyled } from '../constants';

export default function Customers() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { customers, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const[pageNo, setPageNo] = React.useState(1)

  useEffect(()=> {
    dispatch(fetchCustomers({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchCustomers({searchText})).unwrap()
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_customers} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search customer'
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
            navigate('/customers/newCustomer')
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Customer Mobile No</TableCell>
                  <TableCell>Customer Address</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Spares</TableCell>
                  <TableCell>SPM</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.list.length > 0 ? customers.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.customer_mobile_no1}</TableCell>
                    <TableCell>{`${row.customer_address1}\n${row.customer_address2}\n${row.customer_city}\n${row.customer_state}\n${row.customer_pincode}`}</TableCell>
                    <TableCell>{row.is_machine ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell>{row.is_spares ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell>{row.is_spm ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell><MdOutlineEdit style={{cursor:'pointer'}} onClick={()=>{
                      navigate('/customers/newCustomer', {
                        state: {
                          customer_id: row.id
                        }
                      })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                      <TableCell colSpan={7} align='center'>No Data</TableCell>
                    </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={customers.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchCustomers({limit: page_limit, page: value}))
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
