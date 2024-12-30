import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText, Alert, CircularProgress, Pagination } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewRole, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { nav_roles, nav_stores, page_limit, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import loader from '../assets/image/loader.gif'
import { fetchPartsInStores } from '../slices/dashboardSlice';

export default function Stores() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const [searchText, setSearchText] = useState("")
  const [partsInStoresList, setPartsInStoresList] = useState<any[]>()

  const [pageNo, setPageNo] = useState(1)

  useEffect(() => {
    dispatch(fetchPartsInStores()).unwrap().then((res: any) => {
      setPartsInStoresList(res?.list)
    })
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchPartsInStores({searchText})).unwrap()
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_stores} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
        <Grid2 size={{ xs: 6, md: 8 }}>
        <TextField
            placeholder='Search in stores'
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

        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight: 'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Part Name</TableCell>
                  <TableCell>Available Qty</TableCell>
                  <TableCell>Minimum Stock Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partsInStoresList && partsInStoresList?.length > 0 ? partsInStoresList?.map((row: any, index: number) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.part_name}</TableCell>
                    <TableCell>{row.available_aty}</TableCell>
                    <TableCell>{row.minimum_stock_qty}</TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={9} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>

    </Box>
  );
}
