import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createVendor, fetchProcessList, fetchVendors } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, FormGroup, FormControlLabel, FormHelperText, Card, CardActions, Dialog, List, ListItem, ListItemButton, ListItemIcon, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { Add, ArrowBackIos, Done, Save, Settings, Store } from '@mui/icons-material';
import { Table } from 'react-bootstrap';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { createAttachment, createPart } from '../slices/machineSlice';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { MdOutlineEdit } from 'react-icons/md';
import { MdDeleteOutline } from "react-icons/md";
import { VisuallyHiddenInput } from '../constants';

export default function NewPart() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { processList, vendors } = useAppSelector(
    (state) => state.admin
  );

  const [partProcess, setPartProcess] = useState<Array<{ id: string, name: string }>>([])
  const [partVendor, setPartVendor] = useState<Array<{ process_id: string, vendor_id: string, vendor_name: string, cost: string, delivery_time: number }>>([]);
  const [selectedProcess, setSelectedProcess] = useState("")
  const [selectedProcessName, setSelectedProcessName] = useState("")
  const [selectedVendor, setSelectedVendor] = useState({
    vendor_id: "",
    vendor_name: "",
    delivery_cost: "",
    delivery_time: 0
  })
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [editVendor, setEditVendor] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    minimum_stock_qty: '',
    available_qty: '',
    category: ''
  });
  const [errors, setErrors] = useState<any>();

  const [partFiles, setPartFiles] = useState<Array<any>>([])
  const [partFileNames, setPartFileNames] = useState<Array<string>>([])
  const [fileAdded, setFileAdded] = useState("")

  const handleMultiProcessChange = (event: SelectChangeEvent<typeof formData.category>) => {
    const {
      target: { value },
    } = event;
    setFormData({ ...formData, category: event.target.name == 'isMachine' ? 'machine' : event.target.name == 'isSpares' ? 'spare' : 'spm' });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    dispatch(fetchProcessList()).unwrap()
    dispatch(fetchVendors())
  }, [dispatch])

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.minimum_stock_qty) newErrors.minimum_stock_qty = 'Minimum stock quantity required';
    if (!formData.available_qty) newErrors.available_qty = 'Available quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';

    return newErrors;
  };

  const handleSubmit = (e: any) => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      if (partProcess.length == 0) {
        DisplaySnackbar('Process is required', 'error', enqueueSnackbar)
      } else {
        let vendorCheck = partProcess.filter((p) => !partVendor.some((v) => p.id == v.process_id))
        if (vendorCheck.length > 0) {
          DisplaySnackbar('Vendor is required for Process', 'error', enqueueSnackbar)
        } else {
          const createPartObj: any = {}
          createPartObj.part_name = formData.name
          createPartObj.minimum_stock_qty = formData.minimum_stock_qty
          createPartObj.available_qty = formData.available_qty

          const process_list: any = []
          partProcess.forEach((process) => {
            const processObj: any = {}
            processObj.process_id = process.id
            processObj.process_cost = "0"
            processObj.process_time = Math.min(...partVendor.filter((f) => f.process_id == process.id).map((m) => m.delivery_time))

            const partVendors: any = []

            partVendor.forEach((vendor) => {
              const processVendorObj: any = {}
              if (vendor.process_id == process.id) {
                processVendorObj.vendor_id = vendor.vendor_id
                processVendorObj.part_process_vendor_price = vendor.cost
                processVendorObj.part_process_vendor_delivery_time = vendor.delivery_time
                partVendors.push(processVendorObj)
              }
            })
            processObj.part_process_vendor_list = partVendors
            process_list.push(processObj)
          })
          createPartObj.part_process_list = process_list

          dispatch(createPart(createPartObj)).unwrap().then((res) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
            if (res.message.includes('success')) {
              if (partFiles.length > 0) {
                DisplaySnackbar('Uploading attachments', "success", enqueueSnackbar)
                uploadAttachments(res.id)
              } else {
                navigate(-1)
              }
            }
          }).catch((err) => {
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
          })
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const uploadAttachments = (id: string) => {
    dispatch(createAttachment({
      files: partFiles, type: 'part',
      type_id: id
    })).unwrap()
      .then((res: any) => {
        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
        navigate(-1)
      })
      .catch((err: any) => {
        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        navigate(-1)
      })
  }

  const handleVendorSubmit = () => {
    const newErrors: any = {}
    if (!selectedVendor.vendor_name) newErrors.vendor_name = 'Select vendor'
    if (!selectedVendor.delivery_cost) newErrors.delivery_cost = 'Enter delivery cost'
    if (!selectedVendor.delivery_time) newErrors.delivery_time = 'Enter delivery time'

    if (Object.keys(newErrors).length == 0) {
      if (editVendor) {
        setPartVendor(
          partVendor.map((vendors) => {
            return (vendors.vendor_id == selectedVendor.vendor_id && vendors.process_id == selectedProcess) ? {
              process_id: selectedProcess,
              vendor_id: selectedVendor.vendor_id,
              vendor_name: selectedVendor.vendor_name,
              cost: selectedVendor.delivery_cost,
              delivery_time: selectedVendor.delivery_time
            } : vendors
          })
        )
        setEditVendor(false)
      } else {
        setPartVendor([...partVendor, {
          process_id: selectedProcess,
          vendor_id: selectedVendor.vendor_id,
          vendor_name: selectedVendor.vendor_name,
          cost: selectedVendor.delivery_cost,
          delivery_time: selectedVendor.delivery_time
        }])
      }
      setShowVendorDialog(false)
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <Box sx={{ display: 'flex', direction: 'row', ml: 2, mr: 4 }}>
      <SidebarNav currentPage='Part' />
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', }}>
        <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
          navigate(-1)
        }}>
          Back
        </Button>
        <form noValidate>
          <Grid2 container spacing={4} sx={{ mt: 1 }}>
            <Grid2 size={3} style={{ paddingLeft: 0, paddingRight: 0 }}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors?.name}
                helperText={errors?.name}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Minimum Stock Qty."
                name="minimum_stock_qty"
                required
                value={formData.minimum_stock_qty}
                onChange={handleChange}
                error={!!errors?.minimum_stock_qty}
                helperText={errors?.minimum_stock_qty}
              />
            </Grid2>
            <Grid2 size={2}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Available Qty."
                name="available_qty"
                required
                value={formData.available_qty}
                onChange={handleChange}
                error={!!errors?.available_qty}
                helperText={errors?.available_qty}
              />
            </Grid2>
            <Grid2 size={4}>
              <FormControl
                required
                error={!!errors?.category}
                sx={{ ml: 3 }}
                component="fieldset"
                variant="standard">
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox checked={formData.category == 'machine'} onChange={handleMultiProcessChange} name="isMachine" />
                    }
                    label="Machine"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={formData.category == 'spare'} onChange={handleMultiProcessChange} name="isSpares" />
                    }
                    label="Spares"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={formData.category == 'spm'} onChange={handleMultiProcessChange} name="isSPM" />
                    }
                    label="SPM"
                  />
                </FormGroup>
                <FormHelperText>{errors?.category}</FormHelperText>
              </FormControl>
            </Grid2>

            {partProcess && partProcess.length > 0 && partProcess.map((process) => {
              return (<Grid2 size={4}>
                <Card sx={{ padding: 3 }}>
                  <Card sx={{ textAlign: 'center', p: 0.5, fontWeight: 'bold', backgroundColor: 'lightskyblue' }}>Process Name: {process.name}</Card>
                  {partVendor.filter((pv: any) => pv.process_id == process.id)?.length > 0 &&
                    <CTable small striped>
                      <CTableHead color='info'>
                        <CTableRow>
                          <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Vendor Name</CTableHeaderCell>
                          <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Cost</CTableHeaderCell>
                          <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Time</CTableHeaderCell>
                          <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}></CTableHeaderCell>
                          <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {partVendor.filter((pv: any) => pv.process_id == process.id)?.map((vendor) => {
                          return (<CTableRow>
                            <CTableDataCell style={{ fontWeight: 'initial' }}>{vendor.vendor_name}</CTableDataCell>
                            <CTableDataCell>{vendor.cost}</CTableDataCell>
                            <CTableDataCell>{vendor.delivery_time}</CTableDataCell>
                            <CTableDataCell><MdOutlineEdit onClick={() => {
                              setEditVendor(true)
                              setShowVendorDialog(true)
                              setSelectedProcess(process.id)
                              setSelectedProcessName(process.name)
                              setSelectedVendor({
                                vendor_id: vendor.vendor_id,
                                vendor_name: vendor.vendor_name,
                                delivery_cost: vendor.cost,
                                delivery_time: vendor.delivery_time
                              })
                              setErrors({})
                            }} /></CTableDataCell>
                            <CTableDataCell><MdDeleteOutline onClick={() => {
                              setPartVendor(partVendor.filter((p) => p.process_id !== process.id || p.vendor_id !== vendor.vendor_id))
                            }} /></CTableDataCell>
                          </CTableRow>)
                        })}
                      </CTableBody>
                    </CTable>}
                  <CardActions
                    disableSpacing
                    sx={{
                      mt: 1,
                      alignSelf: "stretch",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      // 👇 Edit padding to further adjust position
                      p: 0,
                    }}
                  >
                    <Button variant="contained" startIcon={<Store />} size="small" color='primary'
                      onClick={() => {
                        setEditVendor(false)
                        setShowVendorDialog(true)
                        setSelectedProcess(process.id)
                        setSelectedProcessName(process.name)
                        setSelectedVendor({
                          vendor_id: "",
                          vendor_name: "",
                          delivery_cost: "",
                          delivery_time: 0
                        })
                        setErrors({})
                      }}>
                      Add New Vendor
                    </Button>
                  </CardActions>
                </Card>
              </Grid2>)
            })}
          </Grid2>
          <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
            onClick={() => {
              setShowProcessDialog(true)
            }}>
            Add New Process
          </Button>

          <Card sx={{ padding: 2, mt: 2 }}>
            {partFileNames.map((file: any) => {
              return <Chip label={file} variant='outlined' sx={{ mr: 1 }} onDelete={() => {
                setPartFiles(partFiles.filter((f) => f.name != file))
                setPartFileNames(partFileNames.filter((f) => f != file))
              }} style={{ marginTop: '4px' }} />
            })}
            <Button
              size={'small'}
              component="label"
              role={undefined}
              variant="contained"
              sx={{ mt: 1 }}
              tabIndex={-1}
              startIcon={<Add />}
            >
              Upload files
              <VisuallyHiddenInput
                type="file"
                onChange={(event: any) => {
                  event.preventDefault()
                  const files: any = partFiles
                  const chosenFiles = Array.prototype.slice.call(event.target.files)
                  chosenFiles.map((file) => {
                    files.push(file)
                  })
                  setPartFiles(files)
                  setFileAdded(`${files.length} files added`)

                  let fileNames = partFileNames
                  chosenFiles.map((f: any) => {
                    fileNames.push(f.name)
                  })
                  setPartFileNames(fileNames)
                }}
                multiple
              />
            </Button>
          </Card>

          <Grid2 container justifyContent={'flex-end'} sx={{mt:1}}>
            <Grid2 size={2}>
              <Button variant='outlined' color="primary" fullWidth onClick={(e: any) => {
                navigate(-1)
              }}>
                Cancel
              </Button>
            </Grid2>
            <Grid2 size={2}>
              <Button variant="contained" color="secondary" fullWidth sx={{ ml: 2 }} onClick={(e: any) => {
                handleSubmit(e)
              }}>
                Submit
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </Box>

      {/* Process Dialog */}

      <Dialog
        maxWidth={'md'}
        open={showProcessDialog}>
        <DialogTitle>Select Process</DialogTitle>
        <DialogContent>
          <List sx={{ bgcolor: 'background.paper' }}>
            {processList.list.map((value) => {
              if (partProcess.filter((f) => f.id == value.id).length == 0) {
                const labelId = `checkbox-list-label-${value.id}`;
                return (
                  <ListItem
                    key={value}
                    disablePadding
                    onClick={() => {
                      setShowProcessDialog(false)
                      setPartProcess([...partProcess, {
                        id: value.id,
                        name: value.process_name
                      }])
                    }}>
                    <ListItemButton role={undefined} dense>
                      <ListItemText id={labelId} primary={value.process_name} />
                    </ListItemButton>
                  </ListItem>
                );
              }
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowProcessDialog(false)
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Vendor Dialog */}

      <Dialog
        maxWidth={'md'}
        open={showVendorDialog}>
        <DialogTitle>Add Vendor for {selectedProcessName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal"
            error={!!errors?.vendor_name}>
            <InputLabel id="role-select-label">Vendor</InputLabel>
            <Select
              size={'small'}
              labelId="role-select-label"
              id="role-select"
              label="Vendor"

              value={selectedVendor.vendor_id}
              onChange={(e) => {
                setSelectedVendor({ ...selectedVendor, vendor_id: e.target.value, vendor_name: vendors.list?.find((v) => v.id == e.target.value)?.vendor_name })
              }}
            >

              {!editVendor && vendors && vendors.list?.length > 0 && vendors.list?.map((vendor) => {
                const vendor_process = vendor.process_list.filter((p: any) => p.process_id == selectedProcess)
                const existing_vendor = partVendor.filter((v: any) => v.vendor_id == vendor.id && v.process_id == selectedProcess)
                if (vendor_process?.length > 0 && existing_vendor.length == 0) {
                  return <MenuItem value={vendor.id}>{vendor.vendor_name}</MenuItem>
                }
              })}
              {editVendor && <MenuItem value={selectedVendor.vendor_id}>{selectedVendor.vendor_name}</MenuItem>}
            </Select>
          </FormControl>

          <TextField
            size={'small'}
            fullWidth
            required
            id="email"
            label="Cost"
            name="email"
            error={!!errors?.delivery_cost}
            helperText={errors?.delivery_cost}
            value={selectedVendor.delivery_cost}
            onChange={(e) => {
              setSelectedVendor({ ...selectedVendor, delivery_cost: e.target.value })
            }} />

          <TextField
            size={'small'}
            fullWidth
            required
            sx={{ mt: 1 }}
            id="email"
            label="Delivery Time"
            name="email"
            type={'number'}
            error={!!errors?.delivery_time}
            helperText={errors?.delivery_time}
            value={selectedVendor.delivery_time}
            onChange={(e: any) => {
              setSelectedVendor({ ...selectedVendor, delivery_time: e.target.value })
            }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowVendorDialog(false)
            setEditVendor(false)
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleVendorSubmit()
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
