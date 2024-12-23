import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Card, FormControl, Grid2, Input, InputAdornment, InputLabel, Alert, TextField, CircularProgress, Pagination } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewUser, fetchRoles, fetchUsers } from '../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit } from 'react-icons/md';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { CustomTablePagination, nav_users, page_limit, TableRowStyled } from '../constants';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import TablePagination from '@mui/material/TablePagination';
import loader from '../assets/image/loader.gif'

export default function Users() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { users, roles, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [createDialog, setCreateDialog] = React.useState(false)
  const [loadingDialog, setLoadingDialog] = React.useState(true)
  const[pageNo, setPageNo] = React.useState(1)

  const [employeeName, setEmployeeName] = React.useState("")
  const [employeeCode, setEmployeeCode] = React.useState("")
  const [role, setRole] = React.useState("")

  useEffect(()=> {
    dispatch(fetchRoles())
    dispatch(fetchUsers({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  const handleSearch = () => {
    dispatch(fetchUsers({searchText: searchText})).unwrap()
  }

  const handleNewUser = () => {
    dispatch(createNewUser({
      emp_code: employeeCode,
      emp_name: employeeName,
      password: employeeCode,
      role_id: role
    })).unwrap().then((res)=>{
      setCreateDialog(false)
      DisplaySnackbar('User created successfully', 'success', enqueueSnackbar)
      setEmployeeCode("")
      setEmployeeName("")
      setRole("")
      dispatch(fetchUsers({limit: page_limit, page: pageNo}))
    }).catch((err)=>{
      
    })
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_users} />
      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search user'
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
            <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda", fontWeight:'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Code</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.list.length > 0 ? users.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.emp_code}</TableCell>
                    <TableCell>{row.emp_name}</TableCell>
                    <TableCell><MdOutlineEdit /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                      <TableCell colSpan={3} align='center'>No Data</TableCell>
                    </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={users.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchUsers({limit: page_limit, page: value}))
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
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <Grid2 container spacing={2}>
              <Grid2 size={4}>
                <TextField
                margin="normal"
                required
                id="email"
                label="Employee Name"
                name="email"
                value={employeeName}
                onChange={(e)=> setEmployeeName(e.target.value)}  />
              </Grid2>
              <Grid2 size={4}>
                <TextField
                margin="normal"
                required
                id="email"
                label="Employee Code"
                name="email"
                value={employeeCode}
                onChange={(e)=> setEmployeeCode(e.target.value)}  />
              </Grid2>
              <Grid2 size={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    label="Age"
                    value={role}
                    onChange={(e)=> setRole(e.target.value)}
                  >
                    {roles && roles.list?.length > 0 && roles.list?.map((role) => {
                      return <MenuItem value={role.id}>{role.role_name}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions>
          <Button onClick={()=>{
            setCreateDialog(false)
          }} sx={{color:'#bb0037'}}>Cancel</Button>
          <Button onClick={handleNewUser} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'md'}
        open={status.includes('loading')}>
          <CircularProgress color='success' sx={{m:3}} />
          {/* <img src={loader} /> */}
      </Dialog>

    </Box>
  );
}
