import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, Grid2, FormControl, InputAdornment, InputLabel, TextField, CircularProgress, Pagination, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { createNewUser, deleteUser, fetchRoles, fetchUsers, updateUser } from '../../slices/adminSlice';
import { Add, Search } from '@mui/icons-material';
import { MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import { page_limit } from '../../constants';
import RefreshButton from '../../components/RefreshButton';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { FormLabel } from 'react-bootstrap';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/Users.tsx. Known bugs reproduced verbatim:
// - the create/edit dialog's DialogTitle is hardcoded to "Create New User"
//   always, even when editing an existing row (selectedId is set)
// - "Add New" only opens the dialog; it does not clear employeeName/
//   employeeCode/contactNo/dob/gender/address/aadhar/bloodGroup/insuranceNo/
//   insuranceExpiry/salary/role/selectedId first, so a prior edit's values
//   can leak into a subsequent create
// - password: employeeCode is sent on every save, including updates, which
//   silently resets the user's password to their employee code on edit
// - the "Upload Image" file input's onChange is commented out; picking a
//   file does nothing
// - no client-side required-field validation before dispatching save
// - the save catch paths use plain enqueueSnackbar (no DisplaySnackbar,
//   default styling, not the error-tinted snackbar)
// - Pagination count is `users.count / page_limit` (no Math.ceil)
// - delete-success refetch uses {limit, page: pageNo} only, dropping any
//   active search filter
export default function V2Users() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const { users, roles, status } = useAppSelector(
    (state) => state.admin
  );
  const [searchText, setSearchText] = React.useState("")
  const [createDialog, setCreateDialog] = React.useState(false)
  const [loadingDialog, setLoadingDialog] = React.useState(true)
  const [pageNo, setPageNo] = React.useState(1)

  const [deleteDialog, setDeleteDialog] = React.useState({ dialog: false, id: '', name: '' })

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

  useEffect(() => {
    dispatch(fetchRoles())
    dispatch(fetchUsers({ limit: page_limit, page: pageNo })).unwrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchUsers({ searchText: searchText })).unwrap()
  }

  const handleRefresh = () => {
    dispatch(fetchUsers({ limit: page_limit, page: pageNo, searchText: searchText })).unwrap()
  }

  const handleNewUser = () => {
    // selectedId?.length > 0 ? 'Update' : 'Save'
    if (selectedId?.length > 0) {
      dispatch(updateUser({
        id: selectedId,
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
      })).unwrap().then((res) => {
        setCreateDialog(false)
        DisplaySnackbar('User updated successfully', 'success', enqueueSnackbar)
        setEmployeeCode("")
        setEmployeeName("")
        setRole("")
        setSelectedId("")
        dispatch(fetchUsers({ limit: page_limit, page: pageNo }))
      }).catch((err) => {
        enqueueSnackbar('Unable to update user', { variant: 'error' });
      })
    } else {
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
      })).unwrap().then((res) => {
        setCreateDialog(false)
        DisplaySnackbar('User created successfully', 'success', enqueueSnackbar)
        setEmployeeCode("")
        setEmployeeName("")
        setRole("")
        dispatch(fetchUsers({ limit: page_limit, page: pageNo }))
      }).catch((err) => {
        enqueueSnackbar('Unable to create user', { variant: 'error' });
      })
    }
  }

  return (
    <V2PageShell currentPage="users">
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search user'
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
              setCreateDialog(true)
            }}>
              Add New
            </Button>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper} sx={{ border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: v2Colors.primaryTint, fontWeight: 'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Code</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Contact No</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.list.length > 0 ? users.list.map((row) => (
                  <V2TableRowStyled key={row.id}>
                    <TableCell>{row.emp_code}</TableCell>
                    <TableCell>{row.emp_name}</TableCell>
                    <TableCell>{row?.role_name}</TableCell>
                    <TableCell>{row.details ? JSON.parse(row.details).contact_no : ''}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
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
                    <TableCell><MdDeleteOutline style={{ cursor: 'pointer' }} onClick={() => {
                      setDeleteDialog({ dialog: true, id: row.id, name: row.emp_name })
                    }} /></TableCell>
                  </V2TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={3} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={Math.ceil(users.count / page_limit)} shape="rounded" sx={{
            '& > .MuiPagination-ul': {
              justifyContent: 'center',
            }, mt: 2
          }} onChange={(e: any, value: number) => {
            dispatch(fetchUsers({ limit: page_limit, page: value }))
          }} />

        </Grid2>
      </Grid2>

      <V2Drawer
        width={720}
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        title="Create New User"
        actions={<>
          <Button variant='text' onClick={() => setCreateDialog(false)} sx={{ color: v2Colors.primary }}>
            Cancel
          </Button>
          <Button onClick={handleNewUser} variant="contained">
            {selectedId && selectedId?.length > 0 ? 'Update' : 'Save'}
          </Button>
        </>}
      >
          <Grid2 container spacing={2}>

            <Grid2 size={12}>
              <Typography variant="h6">
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
      </V2Drawer>


      <Dialog maxWidth={'md'}
        open={status.includes('loading')}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

      <Dialog
        maxWidth={'sm'}
        open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialog({ dialog: false, id: '', name: '' })
          }} sx={{ color: v2Colors.primary }}>No</Button>
          <Button variant="contained" size="small" onClick={() => {
            dispatch(deleteUser({ id: deleteDialog.id })).unwrap().then((res: any) => {
              setDeleteDialog({ dialog: false, id: '', name: '' })
              DisplaySnackbar(res, res.includes('success') ? 'success' : 'error', enqueueSnackbar)
              dispatch(fetchUsers({ limit: page_limit, page: pageNo }))
            }).catch((err: any) => {
              enqueueSnackbar('Unable to delete user', { variant: 'error' });
            })
          }}>Yes</Button>
        </DialogActions>
      </Dialog>

    </V2PageShell>
  );
}
