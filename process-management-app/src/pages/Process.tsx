import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Grid2, InputAdornment, Paper, TextField, FormControl, Alert, CircularProgress, Pagination } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewProcess, fetchProcessList, fetchRoles } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { nav_process, page_limit, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';

export default function Process() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()
  
  const { processList, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = React.useState("")
  const [createDialog, setCreateDialog] = React.useState(false)
  const [processName, setProcessName] = React.useState("")
  const [loadingDialog, setLoadingDialog] = React.useState(false)
  const[pageNo, setPageNo] = React.useState(1)

  useEffect(()=> {
    dispatch(fetchProcessList({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleSearch = () => {
    dispatch(fetchProcessList({searchText})).unwrap()
  }

  const handleNewProcess = () => {
    dispatch(createNewProcess({
      process_name: processName
    })).unwrap().then((res)=>{
      setCreateDialog(false)
      DisplaySnackbar(res,res.includes('success') ? "success" : "error", enqueueSnackbar)
      setProcessName("")
      dispatch(fetchProcessList({limit: page_limit, page: pageNo})).unwrap()
    }).catch((err)=>{
      DisplaySnackbar(err.message, "error", enqueueSnackbar)
    })
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_process} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search process'
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
            setCreateDialog(true)
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Process Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processList.list.length > 0 ? processList.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.process_name}</TableCell>
                    <TableCell><MdOutlineEdit /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                      <TableCell colSpan={2} align='center'>No Data</TableCell>
                    </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={processList.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchProcessList({limit: page_limit, page: value}))
          }}/>

        </Grid2>
      </Grid2>

      <Dialog 
        maxWidth={'md'}
        open={createDialog}
        onClose={(event, reason)=> {
          if(reason == "backdropClick"){
            return
          }
          setCreateDialog(false)
        }}>
          <DialogTitle>Create New Process</DialogTitle>
          <DialogContent>
            <Grid2 container spacing={2}>
              <Grid2 size={12}>
                <TextField
                margin="normal"
                required
                id="email"
                label="Process Name"
                name="email"
                value={processName}
                onChange={(e)=> setProcessName(e.target.value)}  />
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions>
          <Button onClick={()=>{
            setCreateDialog(false)
          }} sx={{color:'#bb0037'}}>Cancel</Button>
          <Button onClick={handleNewProcess} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
          <CircularProgress color='success' sx={{m:3}} />
      </Dialog>
    </Box>
  );
}
