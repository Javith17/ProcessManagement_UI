import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Card, FormControl, Grid2, Input, InputAdornment, InputLabel, Alert, TextField, CircularProgress, Pagination, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
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
import { FormLabel } from 'react-bootstrap';

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

  const [selectedId, setSelectedId] = React.useState("");
  const [employeeName, setEmployeeName] = React.useState("")
  const [employeeCode, setEmployeeCode] = React.useState("")
  
  const [contactNo, setContactNo] = React.useState("")
  const [dob, setDob] = React.useState("")
  const [gender, setGender] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [aadhar, setAadhar] = React.useState("")
  const [bloodGroup, setBloodGroup] = React.useState("")
  const [insuranceNo, setInsuranceNo] = React.useState("")
  const [insuranceExpiry, setInsuranceExpiry] = React.useState("")
  const [salary, setSalary] = React.useState("")
  
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
      role_id: role,
      salary: salary,
      details: {
        contact_no: contactNo,
        gender: gender,
        dob: dob,
        address: address,
        aadhar_no: aadhar,
        blood_group: bloodGroup
      },
      insurance_details: {
        insurance_no: insuranceNo,
        insurance_expiry: insuranceExpiry
      }
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
                  <TableCell>Role</TableCell>
                  <TableCell>Contact No</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.list.length > 0 ? users.list.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.emp_code}</TableCell>
                    <TableCell>{row.emp_name}</TableCell>
                    <TableCell>{row?.role_name}</TableCell>
                    <TableCell>{row.details ? JSON.parse(row.details).contact_no : ''}</TableCell>
                    <TableCell><MdOutlineEdit onClick={() => {
                      setCreateDialog(true);
                      setSelectedId(row.id);
                      setEmployeeName(row.emp_name);
                      setEmployeeCode(row.emp_code);
                      setContactNo(row.details ? JSON.parse(row.details).contact_no : '');
                      setDob(row.details ? JSON.parse(row.details).dob : '');
                      setGender(row.details ? JSON.parse(row.details).gender : '');
                      setAddress(row.details ? JSON.parse(row.details).address : '');
                      setAadhar(row.details ? JSON.parse(row.details).aadhar : '');
                      setBloodGroup(row.details ? JSON.parse(row.details).blood_group : '');
                      setInsuranceNo(row.insurance_details ? JSON.parse(row.insurance_details).insurance_no : '');
                      setInsuranceExpiry(row.insurance_details ? JSON.parse(row.insurance_details).insurance_expiry : '');
                      setSalary(row.salary);
                      setRole(row.role_id);
                    }} /></TableCell>
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
        maxWidth="md"
        fullWidth
        open={createDialog}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          setCreateDialog(false);
        }}
      >
        <DialogTitle>Create New User</DialogTitle>

        <DialogContent>
          <Grid2 container spacing={2}>

            <Grid2 size={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                User Details
              </Typography>
            </Grid2>

            {/* LEFT COLUMN */}
            <Grid2 size={6} container spacing={2}>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Employee Code"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                />
              </Grid2>

              <Grid2 size={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={role}
                    label="Role"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roles?.list?.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.role_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                />
              </Grid2>

              
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
                />
              </Grid2>
            </Grid2>

            {/* RIGHT COLUMN */}
            <Grid2 size={6} container spacing={2}>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </Grid2>

              <Grid2 size={12}>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    row
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
              </Grid2>
            </Grid2>

            {/* INSURANCE SECTION */}
            <Grid2 size={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Insurance Details
              </Typography>
            </Grid2>

            <Grid2 size={6}>
              <TextField
                fullWidth
                label="Insurance Number"
                value={insuranceNo}
                onChange={(e) => setInsuranceNo(e.target.value)}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                fullWidth
                type="date"
                label="Insurance Expiry"
                InputLabelProps={{ shrink: true }}
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
              />
            </Grid2>

            {/* EXTRA FIELDS (Salary + Image) */}
            <Grid2 size={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </Grid2>

            <Grid2 size={6}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Image
                <input
                  type="file"
                  hidden
                  // onChange={(e) => setImage(e.target.files[0])}
                />
              </Button>
            </Grid2>

          </Grid2>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: "#bb0037" }}>
            Cancel
          </Button>
          <Button onClick={handleNewUser} variant="contained">
            {selectedId && selectedId?.length > 0 ? 'Update' : 'Save'} 
          </Button>
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
