import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Grid2, InputAdornment, Paper, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { fetchBoughtOutList } from '../../slices/machineSlice';
import RefreshButton from '../../components/RefreshButton';
import { useNavigate } from 'react-router-dom';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { Button } from '@mui/material';
import V2PageShell from '../components/V2PageShell';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/BoughtOuts.tsx.
export default function V2BoughtOuts() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { boughtOuts } = useAppSelector(
    (state) => state.machine
  );

  const [searchText, setSearchText] = React.useState("")

  useEffect(() => {
    dispatch(fetchBoughtOutList()).unwrap()
  }, [])

  const handleSearch = () => {
    dispatch(fetchBoughtOutList({ searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchBoughtOutList({ searchText })).unwrap()
  }

  return (
    <V2PageShell currentPage="boughtouts">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='boughtouts or supplier'
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
              navigate("/v2/boughtout/newBoughtout")
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
                  <TableCell>Bought Out Name</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Spares</TableCell>
                  <TableCell>SPM</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {boughtOuts.length > 0 ? boughtOuts.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.bought_out_name}</TableCell>
                    <TableCell>{row.is_machine ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell>{row.is_spare ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell>{row.is_spm ? <ImCheckboxChecked color='green' /> : <IoMdClose color='red' />}</TableCell>
                    <TableCell>{row.days}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                      navigate('/v2/boughtout/editBoughtout', {
                        state: {
                          id: row.id
                        }
                      })
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={4} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>
    </V2PageShell>
  );
}
