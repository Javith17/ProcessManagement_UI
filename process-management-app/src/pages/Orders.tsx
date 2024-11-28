import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { createNewMachine, fetchBoughtOutList, fetchMachineList } from '../slices/machineSlice';
import { nav_boughtouts, nav_machines, nav_orders, TableRowStyled } from '../constants';
import { useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { fetchOrdersDetail, fetchOrdersList } from '../slices/quotationSlice';


export default function Orders() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { ordersList } = useAppSelector(
    (state) => state.quotation
  );

  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    dispatch(fetchOrdersList()).unwrap()
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchOrdersList(searchText)).unwrap()
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_orders} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search orders'
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
        
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Quotation No</TableCell>
                  <TableCell>Machine Name</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersList.length > 0 ? ordersList.map((row:any) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.quotation.quotation_no}</TableCell>
                    <TableCell>{row.machine_name}</TableCell>
                    <TableCell>{row.customer.customer_name}</TableCell>
                    <TableCell>{row.quotation.approved_cost}</TableCell>
                    <TableCell style={{ cursor: 'pointer' }} onClick={() => {
                      
                    }}><MdOutlineRemoveRedEye onClick={()=>{
                        navigate('/orderDetail', {
                            state: {
                                order_id: row.id
                            }
                        })
                    }} /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={6} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>
    </Box>
  );
}
