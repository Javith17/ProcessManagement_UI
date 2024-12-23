import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Grid2, InputAdornment, Paper, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { fetchBoughtOutList } from '../slices/machineSlice';
import { nav_boughtouts, TableRowStyled } from '../constants';
import { useNavigate } from 'react-router-dom';


export default function BoughtOuts() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { boughtOuts } = useAppSelector(
    (state) => state.machine
  );

  const [searchText, setSearchText] = React.useState("")

  useEffect(()=> {
    dispatch(fetchBoughtOutList()).unwrap()
  },[])

  const handleSearch = () => {
    dispatch(fetchBoughtOutList(searchText)).unwrap()
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_boughtouts} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search bought outs'
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
            navigate("/boughtout/newBoughtout")
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda", fontWeight:'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Bought Out Name</TableCell>
                  <TableCell>Bought Out Category</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {boughtOuts.length > 0 ? boughtOuts.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.bought_out_name}</TableCell>
                    <TableCell>{row.bought_out_category}</TableCell>
                    <TableCell>{row.days}</TableCell>
                    <TableCell><MdOutlineEdit style={{cursor:'pointer'}} onClick={()=>{
                      navigate('/boughtout/editBoughtout', {
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
        </Grid2>
      </Grid2>
    </Box>
  );
}
