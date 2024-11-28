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
import { nav_roles, page_limit, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import loader from '../assets/image/loader.gif'

export default function Roles() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { roles, status } = useAppSelector(
    (state) => state.admin
  );

  const [searchText, setSearchText] = useState("")
  const [createDialog, setCreateDialog] = useState(false)
  const [loadingDialog, setLoadingDialog] = useState(false)
  
  const [roleName, setRoleName] = useState("")
  const [roleScreens, setRoleScreens] = useState<string[]>([])
  const[pageNo, setPageNo] = useState(1)

  useEffect(()=> {
    dispatch(fetchRoles({limit: page_limit, page: pageNo})).unwrap()
  },[dispatch])

  const handleSearch = () => {
    dispatch(fetchRoles({searchText})).unwrap()
  }

  useEffect(()=> {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleChange = (event: SelectChangeEvent<typeof roleScreens>) => {
    const {
      target: { value },
    } = event;
    setRoleScreens(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleNewRole = () => {
    dispatch(createNewRole({
      role_name: roleName,
      screens: roleScreens
    })).unwrap().then((res)=>{
      setCreateDialog(false)
      DisplaySnackbar('Role created successfully', 'success', enqueueSnackbar)
      setRoleName("")
      setRoleScreens([])
      dispatch(fetchRoles())
    }).catch((err)=>{
      DisplaySnackbar(err.message, 'error', enqueueSnackbar)
    })
  }

  return (
    <Box sx={{display:'flex', direction:'column'}}>
      <SidebarNav currentPage={nav_roles} />

      <Grid2 container spacing={2} padding={2} sx={{mt:10, flexGrow:1}}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search role'
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
                  <TableCell>Role Code</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Screens</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.list?.length > 0 ? roles.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.role_code}</TableCell>
                    <TableCell>{row.role_name}</TableCell>
                    <TableCell>{row.screens.join(",")}</TableCell>
                    <TableCell><MdOutlineEdit /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                      <TableCell colSpan={4} align='center'>No Data</TableCell>
                    </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={roles.count/page_limit} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt:2
          }} onChange={(e:any, value:number)=>{
            dispatch(fetchRoles({limit: page_limit, page: value}))
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
          <DialogTitle>Create New Role</DialogTitle>
          <DialogContent>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <TextField
                margin="normal"
                required
                id="email"
                label="Role Name"
                name="email"
                value={roleName}
                onChange={(e)=> setRoleName(e.target.value)}  />
              </Grid2>
              <Grid2 size={6}>
                <FormControl fullWidth margin="normal">
                <InputLabel id="demo-multiple-checkbox-label">Screens</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={roleScreens}
                  onChange={handleChange}
                  input={<OutlinedInput label="Tag" />}
                  renderValue={(selected) => selected.join(', ')}
                  // MenuProps={MenuProps}
                >
                  {["Dashboard","Users","Roles","Vendors","Suppliers","Customers","Parts","Boughtouts","Process"].map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={roleScreens.includes(name)} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions>
          <Button onClick={()=>{
            setCreateDialog(false)
          }} sx={{color:'#bb0037'}}>Cancel</Button>
          <Button onClick={handleNewRole} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
          <CircularProgress color='success' sx={{m:3}} />
          {/* <img src={loader} style={{margin:'5px'}} /> */}
      </Dialog>
    </Box>
  );
}
