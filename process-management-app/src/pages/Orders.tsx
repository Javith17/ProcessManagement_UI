import { useMemo, useState } from 'react';
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
import { nav_assembly, nav_boughtouts, nav_machines, nav_orders, TableRowStyled } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { fetchOrdersList, orderHistory } from '../slices/quotationSlice';
import { MdHistory } from "react-icons/md";
import { Chrono } from "react-chrono";
import moment from 'moment';
import { configureAssembly } from '../slices/assemblySlice';

export default function Orders() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()
  const [type, setType] = useState("")
  const [historyDialog, setHistoryDialog] = useState<any>({
    dialog: false,
    order: '',
    data: []
  })
  const [items, setItems] = useState<any[]>()

  const [table, setTable] = useState<any>()

  const { ordersList } = useAppSelector(
    (state) => state.quotation
  );

  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    if (state?.type) {
      setType(state?.type)
    }
  }, [state])

  useEffect(() => {
    dispatch(fetchOrdersList({search_list: ['Initiated', 'In-Progress', 'Assembly Completed']})).unwrap()
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchOrdersList({search_list: ['Initiated', 'In-Progress', 'Assembly Completed'], searchText })).unwrap()
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={state?.type === "assembly" ? nav_assembly : nav_orders} />

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
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Quotation No</TableCell>
                  <TableCell>Machine Name</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersList.length > 0 ? ordersList.map((row: any) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.quotation? row.quotation.quotation_no : row.spares_quotation ? row.spares_quotation.quotation_no: ''}</TableCell>
                    <TableCell>{row.machine_name}</TableCell>
                    <TableCell>{row.customer.customer_name}</TableCell>
                    <TableCell>{row.quotation? row.quotation.approved_cost : row.spares_quotation ? row.spares_quotation.approved_cost: ''}</TableCell>
                    {row.status == 'Initiated' ? <TableCell>
                      <Card sx={{ bgcolor: '#bb0037', color: 'white', p: 1, textAlign: 'center', cursor:'pointer' }}
                      onClick={() => {
                        dispatch(configureAssembly({
                          machineId: row.machine.id,
                          orderId: row.id
                        })).unwrap().then((res:any)=>{
                          if(res.message.includes('success')){
                            dispatch(fetchOrdersList({search_list: ['In-Progress', 'Assembly Completed']})).unwrap()
                          }else{
                            DisplaySnackbar('Unable to configure assembly', 'error', enqueueSnackbar)
                          }
                        })
                      }} >Configure Assembly</Card>
                    </TableCell> : <TableCell>{row.status}</TableCell>}
                    <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => {
                      if(type == 'assembly'){
                        navigate('/assembly', {
                          state: {
                            order_id: row.id,
                            machine_id: row.machine.id,
                            type: row?.spares_quotation ? 'spares' : 'machine'
                          }
                        })
                      }else{
                        navigate('/orderDetail', {
                          state: {
                            order_id: row.id,
                            type
                          }
                        })
                      }                      
                    }} /></TableCell>
                    <TableCell><MdHistory style={{ cursor: 'pointer' }} onClick={() => {
                      dispatch(orderHistory(row.id))
                        .unwrap()
                        .then((res: any) => {
                          const p: any[] = []
                          if(res.length > 0){
                            res.map((r:any) => {
                              p.push({
                                title: r.to_status,
                                cardTitle: r.data.action,
                                cardSubtitle: `Status changed for ${r.type_name} from to ${r.from_status} to ${r.to_status} \n
                                at ${moment(new Date(r.created_at)).format('DD-MM-YYYY HH:mm:ss')}`,
                                cardDetailedText: r?.remarks,
                              })   
                            })
                            setHistoryDialog({
                              dialog: true,
                              order: row.quotation.quotation_no,
                              data: p
                            })
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

      <Dialog
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "65vw!important",
          },
        }}
        open={historyDialog.dialog}
        onClose={(event, reason) => {
          if (reason == "backdropClick") {
            return
          }
          setHistoryDialog({
            dialog: false,
            order: '',
            data: []
          })
        }}>
        <DialogTitle>Order History - {historyDialog.order}</DialogTitle>
        <DialogContent>
          <Chrono items={historyDialog.data} mode="VERTICAL" textDensity="LOW" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setHistoryDialog({
              dialog: false,
              order: '',
              data: []
            })
          }} sx={{ color: '#bb0037' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
