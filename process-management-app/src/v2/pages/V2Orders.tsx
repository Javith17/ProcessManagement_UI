import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, InputAdornment, Paper, TextField } from '@mui/material';
import V2Badge, { V2BadgeVariant } from '../components/V2Badge';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { Search } from '@mui/icons-material';
import RefreshButton from '../../components/RefreshButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { fetchOrdersList, orderHistory } from '../../slices/quotationSlice';
import { MdHistory } from "react-icons/md";
import { Chrono } from "react-chrono";
import moment from 'moment';
import { configureAssembly } from '../../slices/assemblySlice';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Orders.tsx.
export default function V2Orders() {
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
    dispatch(fetchOrdersList({ search_list: ['Initiated', 'In-Progress', 'Assembly Completed'] })).unwrap()
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchOrdersList({ search_list: ['Initiated', 'In-Progress', 'Assembly Completed'], searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchOrdersList({ search_list: ['Initiated', 'In-Progress', 'Assembly Completed'], searchText })).unwrap()
  }

  const orderStatusVariant = (status: string): V2BadgeVariant => {
    if (status === 'In-Progress') return 'info';
    if (status === 'Assembly Completed') return 'green';
    return 'muted';
  }

  return (
    <V2PageShell currentPage={state?.type === "assembly" ? "assembly" : "orders"}>
      <Grid2 container spacing={2}>
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

        <Grid2 size="grow" display="flex" alignItems="end" flexDirection="column">
          <RefreshButton onClick={handleRefresh} />
        </Grid2>

        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
            <Table>
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
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.quotation ? row.quotation.quotation_no : row.spares_quotation ? row.spares_quotation.quotation_no : ''}</TableCell>
                    <TableCell>{row.machine_name}</TableCell>
                    <TableCell>{row.customer.customer_name}</TableCell>
                    <TableCell>{row.quotation ? row.quotation.approved_cost : row.spares_quotation ? row.spares_quotation.approved_cost : ''}</TableCell>
                    {row.status == 'Initiated' ? <TableCell>
                      <V2Badge
                        label="Configure Assembly"
                        variant="action"
                        onClick={() => {
                          dispatch(configureAssembly({
                            machineId: row.machine.id,
                            orderId: row.id
                          })).unwrap().then((res: any) => {
                            if (res?.messag?.includes('success')) {
                              dispatch(fetchOrdersList({ search_list: ['In-Progress', 'Assembly Completed'] })).unwrap()
                            } else {
                              DisplaySnackbar('Unable to configure assembly', 'error', enqueueSnackbar)
                            }
                          })
                        }}
                      />
                    </TableCell> : <TableCell><V2Badge label={row.status} variant={orderStatusVariant(row.status)} /></TableCell>}
                    <TableCell style={{ cursor: 'pointer' }}><MdOutlineRemoveRedEye onClick={() => {
                      if (type == 'assembly') {
                        navigate('/v2/assembly', {
                          state: {
                            order_id: row.id,
                            machine_id: row.machine.id,
                            type: row?.spares_quotation ? 'spares' : 'machine'
                          }
                        })
                      } else {
                        navigate('/v2/orderDetail', {
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
                          if (res.length > 0) {
                            res.map((r: any) => {
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
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={6} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>

      <V2Drawer
        width={600}
        open={historyDialog.dialog}
        onClose={() => {
          setHistoryDialog({
            dialog: false,
            order: '',
            data: []
          })
        }}
        title={`Order History - ${historyDialog.order}`}
        actions={<Button variant='text' onClick={() => {
          setHistoryDialog({
            dialog: false,
            order: '',
            data: []
          })
        }} sx={{ color: v2Colors.primary }}>Close</Button>}
      >
        <Chrono items={historyDialog.data} mode="VERTICAL" textDensity="LOW" />
      </V2Drawer>
    </V2PageShell>
  );
}
