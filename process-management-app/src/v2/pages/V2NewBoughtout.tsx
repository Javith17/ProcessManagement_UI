import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchSuppliers } from '../../slices/adminSlice';
import AddNewIconButton from '../../components/AddNewIconButton';
import { TextField, Button, Grid2, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, Card, Dialog, List, ListItem, ListItemButton, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import { Add, Save } from '@mui/icons-material';
import { createAttachment, createBoughtout, createImage, fetchMachineList } from '../../slices/machineSlice';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { MdOutlineEdit } from 'react-icons/md';
import { MdDeleteOutline } from "react-icons/md";
import { VisuallyHiddenInput } from '../../constants';
import { IoMdCloseCircle } from "react-icons/io";
import { FcAddImage } from "react-icons/fc";
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import V2Panel from '../components/V2Panel';
import { v2Colors, v2Fonts } from '../theme';

const iconActionSx = {
  width: 26, height: 26, borderRadius: '4px', border: `1px solid ${v2Colors.line}`,
  backgroundColor: v2Colors.surface, color: v2Colors.muted, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

export default function V2NewBoughtout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { suppliers } = useAppSelector(
    (state) => state.admin
  );
  const { machines } = useAppSelector(
    (state) => state.machine
  );

  const [boughoutSupplier, setBoughtoutSupplier] = useState<Array<{ supplier_id: string, supplier_name: string, cost: string, delivery_time: string }>>([]);
  const [selectedSupplier, setSelectedSupplier] = useState({
    supplier_id: "",
    supplier_name: "",
    delivery_cost: "",
    delivery_time: ""
  })
  const [showSupplierDialog, setShowSupplierDialog] = useState(false)
  const [editSupplier, setEditSupplier] = useState(false)
  const [showMachineDialog, setMachineDialog] = useState(false)
  const [removeMachineDialog, setRemoveMachineDialog] = useState({
    dialog: false,
    machineId: '',
    machineName: ''
  })

  const [formData, setFormData] = useState({
    name: '',
    category: ''
  });
  const [errors, setErrors] = useState<any>();

  const [boughtoutFiles, setBoughtoutFiles] = useState<Array<any>>([])
  const [boughtoutFileNames, setBoughtoutFileNames] = useState<Array<string>>([])
  const [fileAdded, setFileAdded] = useState("")
  const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])
  const [selectedType, setSelectedType] = useState<Array<any>>([])
  const [boImage, setBOImage] = useState<any>()
  const [boImageName, setBOImageName] = useState<string>()

  const handleMultiProcessChange = (event: SelectChangeEvent<typeof selectedType>) => {
    const {
      target: { value },
    } = event;
    setSelectedType(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleMultiMachineChange = (event: SelectChangeEvent<typeof selectedMachines>) => {
    const {
      target: { value },
    } = event;
    setSelectedMachines(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    dispatch(fetchSuppliers()).unwrap()
    dispatch(fetchMachineList())
  }, [dispatch])

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = 'Name is required';

    return newErrors;
  };

  const handleSubmit = (e: any) => {

    setErrors({})
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      // if (boughoutSupplier.length == 0) {
      //   DisplaySnackbar('Supplier is required', 'error', enqueueSnackbar)
      // } else {
      if (selectedType.length == 0) {
        DisplaySnackbar('Category is required', 'error', enqueueSnackbar)
      } else if (selectedMachines.length == 0) {
        DisplaySnackbar('Machine is required', 'error', enqueueSnackbar)
      } else {
        const createBoughtoutObj: any = {}
        createBoughtoutObj.bought_out_name = formData.name
        createBoughtoutObj.bought_out_category = formData.category
        createBoughtoutObj.is_machine = selectedType.includes('Machine')
        createBoughtoutObj.is_spm = selectedType.includes('SPM')
        createBoughtoutObj.is_spare = selectedType.includes('Spares')

        createBoughtoutObj.machines = selectedMachines.map((machine: any) => machines.find((m: any) => m.machine_name == machine).id)

        const bought_out_supplier_list: any = []
        boughoutSupplier?.forEach((bo) => {
          const supplierObj: any = {}
          supplierObj.supplier_id = bo.supplier_id
          supplierObj.cost = bo.cost
          supplierObj.delivery_time = bo.delivery_time

          bought_out_supplier_list.push(supplierObj)
        })
        createBoughtoutObj.bought_out_supplier_list = bought_out_supplier_list

        dispatch(createBoughtout(createBoughtoutObj)).unwrap().then((res) => {
          DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
          if (res.message.includes('success')) {
            if (boImage) {
              uploadImage(res.id)
            }
            if (boughtoutFiles.length > 0) {
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
      // }
    } else {
      setErrors(validationErrors);
    }
  };

  const uploadImage = (id: string) => {
    dispatch(createImage({
      files: [boImage], type: 'bought_out', type_id: id, image_name: boImageName
    }))
  }

  const uploadAttachments = (id: string) => {
    dispatch(createAttachment({
      files: boughtoutFiles, type: 'boughtout',
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
    if (!selectedSupplier.supplier_name) newErrors.vendor_name = 'Select supplier'
    if (!selectedSupplier.delivery_cost) newErrors.delivery_cost = 'Enter delivery cost'
    if (!selectedSupplier.delivery_time) newErrors.delivery_time = 'Enter delivery time'

    if (Object.keys(newErrors).length == 0) {
      if (editSupplier) {
        setBoughtoutSupplier(
          boughoutSupplier.map((supplier) => {
            return (supplier.supplier_id == selectedSupplier.supplier_id) ? {
              supplier_id: selectedSupplier.supplier_id,
              supplier_name: selectedSupplier.supplier_name,
              cost: selectedSupplier.delivery_cost,
              delivery_time: selectedSupplier.delivery_time
            } : supplier
          })
        )
        setEditSupplier(false)
      } else {
        setBoughtoutSupplier([...boughoutSupplier, {
          supplier_id: selectedSupplier.supplier_id,
          supplier_name: selectedSupplier.supplier_name,
          cost: selectedSupplier.delivery_cost,
          delivery_time: selectedSupplier.delivery_time
        }])
      }
      setShowSupplierDialog(false)
    } else {
      setErrors(newErrors)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCardClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setBOImage(file)
      setBOImageName(file.name)
    }
  };

  return (
    <V2PageShell currentPage="boughtouts">
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, pb: 2, mb: 3, borderBottom: `2px solid ${v2Colors.ink}` }}>
        <Box>
          <Typography sx={{ fontSize: '11px', letterSpacing: '.09em', textTransform: 'uppercase', color: v2Colors.faint, fontWeight: 600, mb: 0.5 }}>Part → Boughtouts</Typography>
          <Typography variant="h4" sx={{ fontSize: '25px' }}>New Boughtout</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={(e: any) => handleSubmit(e)}>Save Boughtout</Button>
        </Box>
      </Box>

      <V2Panel title="Basic Details">
        <Grid2 container spacing={3}>
          <Grid2 size="auto">
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Card sx={{ borderRadius: '50%', height: '96px', width: '96px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '96px', width: '96px', cursor: 'pointer', backgroundColor: v2Colors.surface2 }}
                  onClick={handleCardClick}>
                  {boImage ? <img src={URL.createObjectURL(boImage)} style={{ height: '96px', width: '96px', objectFit: 'cover' }}
                  /> : <FcAddImage style={{ height: '42px', width: '42px' }} />}
                  <input
                    type="file"
                    accept='image/png, image/jpeg'
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Box>
              </Card>
            </Box>
          </Grid2>
          <Grid2 size="grow">
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
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
            </Box>
          </Grid2>
          <Grid2 size="grow">
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
              <FormControl fullWidth>
                <InputLabel id="demo-multiple-checkbox-label">Type</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  size='small'
                  multiple
                  required
                  value={selectedType}
                  onChange={handleMultiProcessChange}
                  input={<OutlinedInput label="Tag" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: any) => (
                        value.length > 0 ?
                          <Chip key={value} label={value} /> : <></>
                      ))}
                    </Box>
                  )}
                >
                  {['Machine', 'Spares', 'SPM'].map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={selectedType.includes(type)} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid2>
        </Grid2>
      </V2Panel>

      <V2Panel title="Machines" caption={`${selectedMachines.length} linked`}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: selectedMachines.length ? 1.5 : 0 }}>
          {selectedMachines.map((map: any) => (
            <Box key={map} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: v2Colors.surface2,
              border: `1px solid ${v2Colors.line}`, borderRadius: '20px', padding: '4px 6px 4px 12px',
              fontSize: '13px', fontWeight: 600,
            }}>
              {map}
              <Box component="button" type="button" onClick={() => {
                setRemoveMachineDialog({
                  dialog: true,
                  machineId: machines.find((mac: any) => mac.machine_name == map),
                  machineName: map
                })
              }} sx={{ border: 0, background: 'none', cursor: 'pointer', color: v2Colors.muted, display: 'flex', alignItems: 'center', p: 0, '&:hover': { color: v2Colors.primary } }}>
                <IoMdCloseCircle size={16} />
              </Box>
            </Box>
          ))}
        </Box>
        <Button variant="outlined" size="small" startIcon={<Add />}
          onClick={() => {
            setMachineDialog(true)
          }}>
          Add Machine
        </Button>
      </V2Panel>

      <V2Panel title="Suppliers" caption={`${boughoutSupplier.length} added`}>
        <Grid2 container spacing={1.5}>
          {boughoutSupplier?.map((supplier: any) => (
            <Grid2 key={supplier.supplier_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ border: `1px solid ${v2Colors.line}`, borderRadius: '4px', overflow: 'hidden' }}>
                <Box sx={{ padding: '9px 12px', fontSize: '13px', fontWeight: 700, borderBottom: `1px dashed ${v2Colors.line}` }}>
                  {supplier.supplier_name}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', fontSize: '13px', borderBottom: `1px dashed ${v2Colors.line}` }}>
                  <span style={{ color: v2Colors.muted }}>Cost</span>
                  <span style={{ fontWeight: 600, fontFamily: v2Fonts.mono }}>₹{supplier.cost}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', fontSize: '13px' }}>
                  <span style={{ color: v2Colors.muted }}>Delivery</span>
                  <span style={{ fontWeight: 600, fontFamily: v2Fonts.mono }}>{supplier.delivery_time} Days</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, padding: '7px 10px', backgroundColor: v2Colors.surface2 }}>
                  <Box component="button" type="button" sx={iconActionSx} onClick={() => {
                    setEditSupplier(true)
                    setShowSupplierDialog(true)
                    setSelectedSupplier({
                      supplier_id: supplier.supplier_id,
                      supplier_name: supplier.supplier_name,
                      delivery_cost: supplier.cost,
                      delivery_time: supplier.delivery_time
                    })
                    setErrors({})
                  }}>
                    <MdOutlineEdit />
                  </Box>
                  <Box component="button" type="button" sx={iconActionSx} onClick={() => {
                    setBoughtoutSupplier(boughoutSupplier.filter((b) => b.supplier_id !== supplier.supplier_id))
                  }}>
                    <MdDeleteOutline />
                  </Box>
                </Box>
              </Box>
            </Grid2>
          ))}
        </Grid2>
        <Button variant="outlined" size="small" startIcon={<Add />} sx={{ mt: boughoutSupplier.length ? 1.5 : 0 }}
          onClick={() => {
            setShowSupplierDialog(true)
          }}>
          Add New Supplier
        </Button>
      </V2Panel>

      <V2Panel title="Attachments">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: boughtoutFileNames.length ? 1.5 : 0 }}>
          {boughtoutFileNames.map((file: any) => (
            <Box key={file} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: v2Colors.surface2,
              border: `1px solid ${v2Colors.line}`, borderRadius: '20px', padding: '4px 6px 4px 12px',
              fontSize: '13px', fontWeight: 600,
            }}>
              {file}
              <Box component="button" type="button" onClick={() => {
                setBoughtoutFiles(boughtoutFiles.filter((f) => f.name != file))
                setBoughtoutFileNames(boughtoutFileNames.filter((f) => f != file))
              }} sx={{ border: 0, background: 'none', cursor: 'pointer', color: v2Colors.muted, display: 'flex', alignItems: 'center', p: 0, '&:hover': { color: v2Colors.primary } }}>
                <IoMdCloseCircle size={16} />
              </Box>
            </Box>
          ))}
        </Box>
        <Button
          size={'small'}
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={<Add />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={(event: any) => {
              event.preventDefault()
              const files: any = boughtoutFiles
              const chosenFiles = Array.prototype.slice.call(event.target.files)
              chosenFiles.map((file) => {
                files.push(file)
              })
              setBoughtoutFiles(files)
              setFileAdded(`${files.length} files added`)

              let fileNames = boughtoutFileNames
              chosenFiles.map((f: any) => {
                fileNames.push(f.name)
              })
              setBoughtoutFileNames(fileNames)
            }}
            multiple
          />
        </Button>
      </V2Panel>

      {/* Supplier Drawer */}

      <V2Drawer
        open={showSupplierDialog}
        onClose={() => setShowSupplierDialog(false)}
        title="Add Supplier"
        actions={<>
          <Button variant='text' onClick={() => {
            setShowSupplierDialog(false)
            setEditSupplier(false)
          }} sx={{ color: v2Colors.primary }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleVendorSubmit()
            }}>
            Save
          </Button>
        </>}
      >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <FormControl fullWidth
              error={!!errors?.supplier_name}>
              <InputLabel id="role-select-label">Supplier</InputLabel>
              <Select
                size={'small'}
                labelId="role-select-label"
                id="role-select"
                label="Supplier"
                value={selectedSupplier.supplier_id}
                onChange={(e) => {
                  setSelectedSupplier({ ...selectedSupplier, supplier_id: e.target.value, supplier_name: suppliers.list.find((s) => s.id == e.target.value)?.supplier_name })
                }}
              >
                {!editSupplier && suppliers && suppliers.list.length > 0 && suppliers.list.map((supplier) => {
                  const existing_supplier = boughoutSupplier.filter((s: any) => s.supplier_id == supplier.id)
                  if (existing_supplier.length == 0) {
                    return <MenuItem value={supplier.id}>{supplier.supplier_name}</MenuItem>
                  }
                })}
                {editSupplier && <MenuItem value={selectedSupplier.supplier_id}>{selectedSupplier.supplier_name}</MenuItem>}
              </Select>
            </FormControl>
            <AddNewIconButton title="Add new supplier" onClick={() => navigate('/v2/suppliers/newSupplier')} />
          </Box>

          <TextField
            size={'small'}
            fullWidth
            required
            id="email"
            label="Cost"
            name="email"
            sx={{ mt: 2 }}
            error={!!errors?.delivery_cost}
            helperText={errors?.delivery_cost}
            value={selectedSupplier.delivery_cost}
            onChange={(e) => {
              setSelectedSupplier({ ...selectedSupplier, delivery_cost: e.target.value })
            }} />

          <TextField
            size={'small'}
            fullWidth
            required
            sx={{ mt: 2 }}
            id="email"
            label="Delivery Time"
            name="email"
            type='number'
            error={!!errors?.delivery_time}
            helperText={errors?.delivery_time}
            value={selectedSupplier.delivery_time}
            onChange={(e) => {
              setSelectedSupplier({ ...selectedSupplier, delivery_time: e.target.value })
            }} />
      </V2Drawer>

      {/* Machine Drawer */}

      <V2Drawer
        open={showMachineDialog}
        onClose={() => setMachineDialog(false)}
        title="Select Machine"
        actions={<Button variant='text' onClick={() => {
          setMachineDialog(false)
        }} sx={{ color: v2Colors.primary }}>Cancel</Button>}
      >
          <List sx={{ bgcolor: 'background.paper' }}>
            {machines.map((value) => {
              if (selectedMachines.filter((f) => f == value.machine_name).length == 0) {
                const labelId = `checkbox-list-label-${value.id}`;
                return (
                  <ListItem
                    key={value}
                    disablePadding
                    onClick={() => {
                      setSelectedMachines([...selectedMachines, value.machine_name])
                      setMachineDialog(false)
                    }}>
                    <ListItemButton role={undefined} dense>
                      <ListItemText id={labelId} primary={value.machine_name} />
                    </ListItemButton>
                  </ListItem>
                );
              }
            })}
          </List>
      </V2Drawer>

      {/* Remove Machine Dialog */}

      <Dialog
        maxWidth={'md'}
        open={removeMachineDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Are you sure, do you want to remove {removeMachineDialog.machineName}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRemoveMachineDialog({
              dialog: false,
              machineId: '',
              machineName: ''
            })
          }} sx={{ color: v2Colors.primary }}>No</Button>
          <Button onClick={() => {
            setSelectedMachines(selectedMachines.filter((mac: any) => mac != removeMachineDialog.machineName))
            setRemoveMachineDialog({
              dialog: false,
              machineId: '',
              machineName: ''
            })
          }} sx={{ color: v2Colors.primary }}>Yes</Button>
        </DialogActions>
      </Dialog>
    </V2PageShell>
  );
}
