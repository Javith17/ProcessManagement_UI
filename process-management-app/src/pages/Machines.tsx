import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { Add, Search } from '@mui/icons-material';
import { createNewMachine, fetchBoughtOutList, fetchMachineList } from '../slices/machineSlice';
import { nav_boughtouts, nav_machines, TableRowStyled } from '../constants';
import { useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';


export default function Machines() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { machines } = useAppSelector(
    (state) => state.machine
  );

  const [searchText, setSearchText] = useState("")
  const [errors, setErrors] = useState<any>();
  const [createDialog, setCreateDialog] = useState(false)
  const [machineId, setMachineId] = useState("")
  const [formData, setFormData] = useState({
    model_no: '',
    machine_name: '',
    spindles: 0,
    side_type: '',
    max_spindles: 0,
    min_spindles: 0
  });

  useEffect(() => {
    dispatch(fetchMachineList()).unwrap()
  }, [])

  const handleSearch = () => {
    dispatch(fetchMachineList(searchText)).unwrap()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.model_no) newErrors.model_no = 'Model no is required';
    if (!formData.machine_name) newErrors.machine_name = 'Machine name is required';
    if (!formData.side_type) newErrors.side_type = 'Side type is required';
    if (!formData.spindles || formData.spindles == 0) newErrors.spindles = 'Spindles is required';

    return newErrors;
  };

  const clearValues = () => {
    setFormData({
      model_no: '',
      machine_name: '',
      spindles: 0,
      side_type: '',
      max_spindles: 0,
      min_spindles: 0
    })
    setErrors({})
  }

  const handleNewMachineSubmit = () => {
     const validated = validate()
     if(Object.keys(validated).length == 0){
      dispatch(createNewMachine({
        type: machineId.length == 0 ? 'Add' : 'Edit',
        id: machineId,
        model_no: formData.model_no,
        machine_name: formData.machine_name,
        side_type: formData.side_type,
        spindles: formData.spindles,
        min_spindles: formData.min_spindles,
        max_spindles: formData.max_spindles
      })).unwrap().then((res) => {
        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
        if (res.includes('success')) {
          setCreateDialog(false)
          clearValues()
          dispatch(fetchMachineList())
        }
      }).catch((err) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
      })
     }else{
       setErrors(validated)
     }
  }

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_machines} />

      <Grid2 container spacing={2} padding={2} sx={{ mt: 10, flexGrow: 1 }}>
        <Grid2 size={{ xs: 6, md: 8 }}>
          <TextField
            placeholder='Search machines'
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
          <Button variant="contained" startIcon={<Add />} size="small" onClick={() => {
            // navigate("/machines/newMachine")
            setErrors({})
            setCreateDialog(true)
          }}>
            Add New
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 6, md: 12 }}>
          <TableContainer component={Paper}>
            <Table sx={{ '& .MuiTableCell-head': { lineHeight: 0.8, backgroundColor: "#fadbda", fontWeight:'bold' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Modle No</TableCell>
                  <TableCell>Machine Name</TableCell>
                  <TableCell>Side Type</TableCell>
                  <TableCell>Spindles</TableCell>
                  <TableCell>Max/ Min Spindles</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machines.length > 0 ? machines.map((row) => (
                  <TableRowStyled key={row.id}>
                    <TableCell>{row.model_no}</TableCell>
                    <TableCell>{row.machine_name}</TableCell>
                    <TableCell>{row.side_type}</TableCell>
                    <TableCell>{row.spindles}</TableCell>
                    <TableCell>{row.max_spindles} / {row.min_spindles}</TableCell>
                    <TableCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={()=>{
                      setCreateDialog(true)
                      setMachineId(row.id)
                      setFormData({
                        model_no: row.model_no,
                        machine_name: row.machine_name,
                        side_type: row.side_type,
                        spindles: row.spindles,
                        min_spindles: row.min_spindles,
                        max_spindles: row.max_spindles
                      })
                    }} /></TableCell>
                    <TableCell style={{ cursor: 'pointer' }} onClick={() => {
                      navigate("/machines/newMachine", {
                        state: {
                          id: row.id
                        }
                      })
                    }}><MdOutlineRemoveRedEye /></TableCell>
                  </TableRowStyled>
                )) : <TableRow key={0}>
                  <TableCell colSpan={6} align='center'>No Data</TableCell>
                </TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>

      <Dialog
        maxWidth={'sm'}
        open={createDialog}
        onClose={(event, reason) => {
          if (reason == "backdropClick") {
            return
          }
          setCreateDialog(false)
        }}>
        <DialogTitle>New Machine</DialogTitle>
        <DialogContent>
          <TextField
            size='small'
            variant="outlined"
            fullWidth
            label="Model No"
            name="model_no"
            required
            sx={{mt:1}}
            value={formData.model_no}
            onChange={handleChange}
            error={!!errors?.model_no}
            helperText={errors?.model_no}
          />

          <TextField
            size='small'
            variant="outlined"
            fullWidth
            label="Machine Name"
            name="machine_name"
            required
            sx={{mt:1}}
            value={formData.machine_name}
            onChange={handleChange}
            error={!!errors?.machine_name}
            helperText={errors?.machine_name}
          />

          <FormControl fullWidth
            error={!!errors?.side_type} sx={{mt:1}}>
            <InputLabel id="role-select-label">Side Type</InputLabel>
            <Select
              size={'small'}
              labelId="role-select-label"
              id="role-select"
              label="Side Type"
              value={formData.side_type}
              onChange={(e) => {
                setFormData({ ...formData, side_type: e.target.value })
              }}
            >
              {["Single Side", "Double Side"].map((side) => {
                return <MenuItem value={side}>{side}</MenuItem>
              })}
            </Select>
          </FormControl>

          <TextField
            size='small'
            variant="outlined"
            fullWidth
            required
            type={'number'}
            label="Spindles"
            name="spindles"
            sx={{mt:1}}
            error={!!errors?.spindles}
            helperText={errors?.spindles}
            inputProps={{ min: 0 }}
            value={formData.spindles}
            onChange={(e:any)=>{
              setFormData({...formData, spindles: e.target.value, min_spindles: e.target.value, max_spindles: e.target.value})
            }}
          />

          <TextField
            size='small'
            variant="outlined"
            fullWidth
            required
            type={'number'}
            label="Min. Spindles"
            name="min_spindles"
            sx={{mt:1}}
            disabled={formData.spindles == 0}
            inputProps={{ min: formData.spindles, step: formData.spindles }}
            value={formData.min_spindles}
            onChange={handleChange}
          />

          <TextField
            size='small'
            variant="outlined"
            fullWidth
            required
            type={'number'}
            label="Max. Spindles"
            name="max_spindles"
            sx={{mt:1}}
            disabled={formData.spindles == 0}
            inputProps={{ min: formData.spindles, step: formData.spindles }}
            value={formData.max_spindles}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false)
            clearValues()
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button onClick={handleNewMachineSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
