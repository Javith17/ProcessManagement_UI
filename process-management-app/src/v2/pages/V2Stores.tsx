import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Grid2, InputAdornment, Paper, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { Search } from '@mui/icons-material';
import RefreshButton from '../../components/RefreshButton';
import { useSnackbar } from 'notistack';
import { fetchPartsInStores } from '../../slices/dashboardSlice';
import V2PageShell from '../components/V2PageShell';
import { V2TableRowStyled, v2MonoCellSx } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Stores.tsx. Known bug reproduced verbatim:
// - pressing Enter in the search box calls handleSearch(), which dispatches
//   fetchPartsInStores({searchText}) but does NOT chain a .then() to update
//   the local partsInStoresList state, so the visible table does not actually
//   refresh from an Enter-key search. Only the Refresh icon button's handler
//   sets local state from the dispatch result.
export default function V2Stores() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const [searchText, setSearchText] = useState("")
  const [partsInStoresList, setPartsInStoresList] = useState<any[]>()

  const [pageNo, setPageNo] = useState(1)

  useEffect(() => {
    dispatch(fetchPartsInStores()).unwrap().then((res: any) => {
      setPartsInStoresList(res?.list)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchPartsInStores({ searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchPartsInStores({ searchText })).unwrap().then((res: any) => {
      setPartsInStoresList(res?.list)
    })
  }

  return (
    <V2PageShell currentPage="stores">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search in stores'
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
                  <TableCell>S.No</TableCell>
                  <TableCell>Part Code</TableCell>
                  <TableCell>Part Name</TableCell>
                  <TableCell>Available Qty</TableCell>
                  <TableCell>Minimum Stock Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partsInStoresList && partsInStoresList?.length > 0 ? partsInStoresList?.map((row: any, index: number) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={v2MonoCellSx}>{row.part_code}</TableCell>
                    <TableCell>{row.part_name}</TableCell>
                    <TableCell sx={v2MonoCellSx}>{row.available_aty}</TableCell>
                    <TableCell sx={v2MonoCellSx}>{row.minimum_stock_qty}</TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={9} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>

    </V2PageShell>
  );
}
