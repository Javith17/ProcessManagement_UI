import { useRef, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, ArrowBackIos, Save, Search, Settings } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import { nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import { createAttachment, createImage, fetchBOListByMachine, fetchBoughtOutList, fetchMachineList, fetchPartsList, fetchPartsListByMachine } from '../slices/machineSlice';
import { checkAssemblyName, createSubAssembly, fetchSubAssembly, fetchSubAssemblyDetail, updateAssembly, removeAttachment } from '../slices/assemblySlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { FcAddImage } from "react-icons/fc";

export default function EditSubAssembly() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()

  const { machines, boughtoutByMachines, partsByMachines } = useAppSelector(
    (state) => state.machine
  );

  const { subAssemblyDetail } = useAppSelector(
    (state) => state.assembly
  )

  const [subAssemblyParts, setSubAssemblyParts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, part_id: string, part_name: string, qty: number }>>([])
  const [subAssemblyBoughtouts, setSubAssemblyBoughtouts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [selectedSubAssembly, setSelectedSubAssembly] = useState<{ id: number, name: string, serial_no: string }>({ id: 0, name: '', serial_no: '' });
  const [selectedSubAssemblyParts, setSelectedSubAssemblyParts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, part_id: string, part_name: string, qty: number }>>([])
  const [selectedSubAssemblyBoughtouts, setSelectedSubAssemblyBoughtouts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [errors, setErrors] = useState<any>();
  const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])

  const [subAssemblyFiles, setSubAssemblyFiles] = useState<Array<any>>([])
  const [subAssemblyFileNames, setSubAssemblyFileNames] = useState<Array<string>>([])
  const [fileAdded, setFileAdded] = useState("")
  const [subAssemblyImage, setSubAssemblyImage] = useState<any>()
  const [subAssemblyImageName, setSubAssemblyImageName] = useState<string>()

  const [deleteDialog, setDeleteDialog] = useState({
    dialog: false,
    type: '',
    name: '',
    id: ''
  })

  const [updateDialog, setUpdateDialog] = useState({
    dialog: false,
    type: '',
    name: '',
    id: '',
    qty: 0
  })

  const [addDialog, setAddDialog] = useState({
    dialog: false,
    type: '',
    name: '',
    id: '',
    qty: 0,
  })

  const [editType, setEditType] = useState("")

  useEffect(() => {
    dispatch(fetchSubAssembly()).unwrap()
    dispatch(fetchMachineList())
  }, [dispatch])

  useEffect(() => {
    if (selectedMachines.length > 0) {
      dispatch(fetchPartsListByMachine({ machines: selectedMachines?.map((machine: any) => machines.find((m: any) => m.machine_name == machine).id) })).unwrap()
      dispatch(fetchBOListByMachine({ machines: selectedMachines?.map((machine: any) => machines.find((m: any) => m.machine_name == machine).id) })).unwrap()
    }
  }, [selectedMachines])

  useEffect(() => {
    if (state?.id) {
      dispatch(fetchSubAssemblyDetail(state?.id)).unwrap()
        .then((res) => {
          setSelectedSubAssembly({ id: res.sub_assembly_detail.id, name: res.sub_assembly_detail.sub_assembly_name, serial_no: res.sub_assembly_detail.serial_no })
          setSubAssemblyImageName(res.sub_assembly_detail.image)
          const subParts: any = []
          const subBoughtouts: any = []

          res.sub_assembly_detail.sub_assembly_detail?.map((detail: any) => {
            if (detail.part) {
              subParts.push({
                id: detail.id, sub_assembly_id: res.sub_assembly_detail.id, name: detail.part.part_name,
                part_id: detail.part.id, part_name: detail.part.part_name, qty: detail.qty
              })
            } else if (detail.bought_out) {
              subBoughtouts.push({
                id: detail.id, sub_assembly_id: res.sub_assembly_detail.id, name: detail.bought_out.bought_out_name,
                bought_out_id: detail.bought_out.id, bought_out_name: detail.bought_out.bought_out_name, qty: detail.qty
              })
            }
          })
          setSubAssemblyParts(subParts)
          setSubAssemblyBoughtouts(subBoughtouts)

          const machineList: any[] = []
          res.machine_list?.map((machine: any) => {
            machineList.push(machine.machine_name)
          })
          setSelectedMachines(machineList)

          const attachments: any = []
          res.attachments?.map((attachment: any) => {
            attachments.push(attachment.file_name)
          })
          setSubAssemblyFileNames(attachments)

        })
        .catch((err) => {

        })
    }
  }, [state])

  const handleSubmit = () => {
    if (selectedSubAssembly.name.length == 0) {
      DisplaySnackbar('Enter sub assembly name', 'error', enqueueSnackbar)
    } else if (selectedSubAssembly.serial_no.length == 0) {
      DisplaySnackbar('Enter sub assembly serial no', 'error', enqueueSnackbar)
    } else if (selectedMachines.length == 0) {
      DisplaySnackbar('Machine is required', 'error', enqueueSnackbar)
    } else {
      const machine_list: any = []
      selectedMachines.forEach((m) => {
        machine_list.push(machines.find((f) => m == f.machine_name)?.id)
      })

      dispatch(updateAssembly({
        id: '',
        assembly_type_id: state?.id,
        assembly_type_name: selectedSubAssembly.name,
        update_type: 'update',
        assembly_type: 'sub_detail',
        assembly_udpate_type: updateDialog.type,
        machines: machine_list
      })).unwrap().then((res: any) => {
        DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
      })
    }
  }

  const handleMultiProcessChange = (event: SelectChangeEvent<typeof selectedMachines>) => {
    const {
      target: { value },
    } = event;
    setSelectedMachines(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleUpdate = () => {
    dispatch(updateAssembly({
      id: updateDialog.id,
      update_type: 'update',
      assembly_type: 'sub_assembly',
      assembly_udpate_type: updateDialog.type,
      qty: updateDialog.qty
    })).unwrap().then((res: any) => {
      DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
      if (res.message.includes('success')) {
        if (updateDialog.type.includes('Part')) {
          setSubAssemblyParts(
            subAssemblyParts.map((part) => {
              return (part.id.toString() == updateDialog.id.toString()) ? {
                id: part.id,
                sub_assembly_id: part.sub_assembly_id,
                name: part.name,
                part_id: part.part_id,
                part_name: part.part_name,
                qty: updateDialog.qty
              } : part
            })
          )
        } else if (updateDialog.type.includes('Boughtout')) {
          setSubAssemblyBoughtouts(
            subAssemblyBoughtouts.map((bo) => {
              return (bo.id.toString() == updateDialog.id.toString()) ? {
                id: bo.id,
                sub_assembly_id: bo.sub_assembly_id,
                bought_out_name: bo.bought_out_name,
                bought_out_id: bo.bought_out_id,
                name: bo.name,
                qty: updateDialog.qty
              } : bo
            })
          )
        }
        setUpdateDialog({
          dialog: false, type: '', name: '', id: '', qty: 0
        })
      }
    }).catch((err) => {

    })
  }

  const handleDelete = () => {
    dispatch(updateAssembly({
      id: deleteDialog.id,
      update_type: 'delete',
      assembly_type: 'sub_assembly',
      assembly_udpate_type: deleteDialog.type
    })).unwrap().then((res: any) => {
      DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
      if (res.message.includes('success')) {
        if (deleteDialog.type.includes('Part')) {
          setSubAssemblyParts(subAssemblyParts.filter((p) => p.id.toString() != deleteDialog.id.toString()))
        } else if (deleteDialog.type.includes('Boughtout')) {
          setSubAssemblyBoughtouts(subAssemblyBoughtouts.filter((b) => b.id.toString() != deleteDialog.id.toString()))
        }
        setDeleteDialog({
          dialog: false, type: '', name: '', id: ''
        })
      }
    }).catch((err) => {

    })
  }

  const handleAdd = () => {
    dispatch(updateAssembly({
      id: addDialog.id,
      update_type: 'add',
      assembly_type: 'sub_assembly',
      assembly_udpate_type: addDialog.type,
      assembly_type_id: state?.id,
      qty: addDialog.qty
    })).unwrap().then((res: any) => {
      DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
      if (res.message.includes('success')) {
        if (addDialog.type.includes('Part')) {
          setSubAssemblyParts([...subAssemblyParts, {
            id: res.id,
            sub_assembly_id: state?.id,
            name: addDialog.name,
            part_id: addDialog.id,
            part_name: addDialog.name,
            qty: addDialog.qty
          }])
        } else if (addDialog.type.includes('Boughtout')) {
          setSubAssemblyBoughtouts([...subAssemblyBoughtouts, {
            id: res.id,
            sub_assembly_id: state?.id,
            name: addDialog.name,
            bought_out_id: addDialog.id,
            bought_out_name: addDialog.name,
            qty: addDialog.qty
          }])
        }
        setAddDialog({
          dialog: false, type: '', name: '', id: '', qty: 0
        })
      }
    }).catch((err) => {

    })
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
      setSubAssemblyImage(file)
      setSubAssemblyImageName(file.name)

      dispatch(createImage({
        files: [file], type: 'sub_assembly', type_id: state?.id, image_name: file.name
      }))
    }
  };

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_subassembly} />

      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', ml: 2 }}>
        <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
          navigate('/subAssembly', {
            replace: true,
            state: {
              id: state?.id
            }
          })
        }}>
          Back
        </Button>

        <Grid2 container sx={{alignItems:'center'}}>
          <Grid2 size={2}>
            <Card sx={{ borderRadius: '50%', height: '100px', width: '100px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', width: '100px' }}
                onClick={handleCardClick}>
                {subAssemblyImage ? <img src={URL.createObjectURL(subAssemblyImage)} style={{ height: '80px', width: '80px' }}
                /> : subAssemblyImageName ? <img src={`${process.env.REACT_APP_API_URL}/machine/loadImage/${subAssemblyImageName}`} style={{ height: '80px', width: '80px' }}
                /> : <FcAddImage style={{ height: '60px', width: '60px' }} />}
                <input
                  type="file"
                  accept='image/png, image/jpeg'
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Box>
            </Card>
          </Grid2>
          <Grid2 size={4} sx={{ ml: 2 }}>
            <TextField
              size='small'
              variant="outlined"
              fullWidth
              required
              label="Sub Assembly Name"
              name="sub_assembly_name"
              value={selectedSubAssembly?.name}
              error={!!errors?.name}
              helperText={errors?.name}
              onChange={(e: any) => {
                setSelectedSubAssembly({ ...selectedSubAssembly, name: e.target.value })
              }}
            />
          </Grid2>
          <Grid2 size={4} sx={{ ml: 1 }}>
            <TextField
              sx={{ ml: 1 }}
              size='small'
              variant="outlined"
              fullWidth
              required
              label="Serial No"
              name="serial_no"
              value={selectedSubAssembly?.serial_no}
              error={!!errors?.serial_no}
              helperText={errors?.serial_no}
              onChange={(e: any) => {
                setSelectedSubAssembly({ ...selectedSubAssembly, serial_no: e.target.value })
              }}
            />
          </Grid2>
        </Grid2>

        <Grid2 container>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="demo-multiple-checkbox-label">Machine</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  size='small'
                  multiple
                  required
                  value={selectedMachines}
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
                // MenuProps={MenuProps}
                >
                  {machines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.machine_name}>
                      <Checkbox checked={selectedMachines.includes(machine.machine_name)} />
                      <ListItemText primary={machine.machine_name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Card>
          </Grid2>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1, mr: 2 }}>

              {subAssemblyParts.length > 0 && <CTable small striped>
                <CTableHead color='primary'>
                  <CTableRow>
                    <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                    <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                    <CTableHeaderCell />
                    <CTableHeaderCell />
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subAssemblyParts.map((part: any) => {
                    return (<CTableRow>
                      <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{part.part_name}</CTableDataCell>
                      <CTableDataCell style={{ width: '20%' }}>{part.qty}</CTableDataCell>
                      <CTableDataCell>
                        <MdOutlineEdit style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'} onClick={() => {
                          setUpdateDialog({
                            dialog: true, type: 'Part', name: part.part_name, id: part.id.toString(), qty: part.qty
                          })
                        }} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <MdDeleteOutline style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'} onClick={() => {
                          setDeleteDialog({
                            dialog: true, type: 'Part', name: part.part_name, id: part.id.toString()
                          })
                        }} />
                      </CTableDataCell>
                    </CTableRow>)
                  })}
                </CTableBody>
              </CTable>}

              <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                onClick={() => {
                  // setSubAssemblyParts([...subAssemblyParts, { id: new Date().getTime(), sub_assembly_id: selectedSubAssembly.id, name: selectedSubAssembly.name, part_id: "", part_name: "", qty: 0 }])
                  setAddDialog({ dialog: true, type: 'Part', name: '', id: '', qty: 0 })
                }}>
                Add New Part
              </Button>
            </Card>
          </Grid2>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1, mr: 2 }}>
              {subAssemblyBoughtouts.length > 0 && <CTable small striped>
                <CTableHead color='success'>
                  <CTableRow>
                    <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                    <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subAssemblyBoughtouts.map((boughtout) => {
                    return (<CTableRow>
                      <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{boughtout.bought_out_name}</CTableDataCell>
                      <CTableDataCell style={{ width: '20%' }}>{boughtout.qty}</CTableDataCell>
                      <CTableDataCell>
                        <MdOutlineEdit style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'} onClick={() => {
                          setUpdateDialog({
                            dialog: true, type: 'Boughtout', name: boughtout.bought_out_name, id: boughtout.id.toString(), qty: boughtout.qty
                          })
                        }} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <MdDeleteOutline style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'}
                          onClick={() => {
                            setDeleteDialog({
                              dialog: true, type: 'Boughtout', name: boughtout.bought_out_name, id: boughtout.id.toString()
                            })
                          }} />
                      </CTableDataCell>
                    </CTableRow>)
                  })}
                </CTableBody>
              </CTable>}

              <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                onClick={() => {
                  // setSubAssemblyBoughtouts([...subAssemblyBoughtouts, { id: new Date().getTime(), sub_assembly_id: selectedSubAssembly.id, name: selectedSubAssembly.name, bought_out_id: "", bought_out_name: "", qty: 0 }])
                  setAddDialog({ dialog: true, type: 'Boughtout', id: '', name: '', qty: 0 })
                }}>
                Add New Boughtout
              </Button>
            </Card>
          </Grid2>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1 }}>
              {subAssemblyFileNames.map((file: any) => {
                return <Chip label={file} variant='outlined' sx={{ mr: 1 }} onDelete={() => {
                  setDeleteDialog({
                    dialog: true,
                    type: 'attachment',
                    name: file,
                    id: ''
                  })
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
                    const files: any = subAssemblyFiles
                    const chosenFiles = Array.prototype.slice.call(event.target.files)
                    chosenFiles.map((file) => {
                      files.push(file)
                    })

                    dispatch(createAttachment({
                      files: chosenFiles, type: 'sub_assembly',
                      type_id: state?.id
                    })).unwrap()
                      .then((res: any) => {
                        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)

                        setSubAssemblyFiles(files)
                        setFileAdded(`${files.length} files added`)

                        let fileNames = subAssemblyFileNames
                        chosenFiles.map((f: any) => {
                          fileNames.push(f.name)
                        })
                        setSubAssemblyFileNames(fileNames)

                      })
                      .catch((err: any) => {
                        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                      })
                  }}
                  multiple
                />
              </Button>
            </Card>
          </Grid2>
        </Grid2>

        <Grid2 size={12} container justifyContent={'flex-end'} sx={{ mt: 2 }}>
          <Grid2 size={6}>
            <Button variant='outlined' color="primary" fullWidth onClick={(e: any) => {
              navigate(-1)
            }}>
              Cancel
            </Button>
          </Grid2>
          <Grid2 size={6}>
            <Button variant="contained" color="secondary" fullWidth sx={{ ml: 2 }} onClick={(e: any) => {
              handleSubmit()
            }}>
              Submit
            </Button>
          </Grid2>
        </Grid2>
      </Box>

      <Dialog
        maxWidth={'sm'}
        open={deleteDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <h6>Are you sure, you want to delete {deleteDialog.type} - {deleteDialog.name}?</h6>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialog({
              dialog: false, type: '', name: '', id: ''
            })
          }} sx={{ color: '#bb0037' }}>No</Button>
          <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
            onClick={() => {
              if (deleteDialog.type.includes('attachment')) {
                dispatch(removeAttachment({
                  id: subAssemblyDetail.attachments.find((f) => f.file_name == deleteDialog.name)?.id,
                  file_name: deleteDialog.name
                })).unwrap().then((res: any) => {
                  DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                  if (res.message.includes('success')) {
                    setSubAssemblyFiles(subAssemblyFiles.filter((f) => f.name != deleteDialog.name))
                    setSubAssemblyFileNames(subAssemblyFileNames.filter((f) => f != deleteDialog.name))
                    setDeleteDialog({
                      dialog: false, type: '', name: '', id: ''
                    })
                  }
                }).catch((err: any) => {
                  DisplaySnackbar(err.message, "error", enqueueSnackbar)
                })
              } else {
                setEditType('Delete')
                handleDelete()
              }
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth={'sm'}
        open={updateDialog.dialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            size='small'
            variant="outlined"
            fullWidth
            required
            label={updateDialog.type}
            name="serial_no"
            value={updateDialog.name}
          />

          <TextField
            sx={{ mt: 1 }}
            size='small'
            variant="outlined"
            fullWidth
            required
            label="Qty"
            name="serial_no"
            value={updateDialog.qty}
            onChange={(e: any) => {
              setUpdateDialog({ ...updateDialog, qty: e.target.value })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUpdateDialog({
              dialog: false, type: '', name: '', id: '', qty: 0
            })
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
            onClick={() => {
              handleUpdate()
            }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth={'sm'}
        open={addDialog.dialog}>
        <DialogTitle>Add {addDialog.type}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="role-select-label">{addDialog.type}</InputLabel>
            <Select
              size={'small'}
              labelId="role-select-label"
              id="role-select"
              label="Vendor"
              value={addDialog.id}
              onChange={(e: any) => {
                if (addDialog.type.includes('Part')) {
                  setAddDialog({ ...addDialog, id: e.target.value, name: partsByMachines.list.find((p) => p.id == e.target.value).part_name })
                } else if (addDialog.type.includes('Boughtout')) {
                  setAddDialog({ ...addDialog, id: e.target.value, name: boughtoutByMachines.list.find((b) => b.id == e.target.value).bought_out_name })
                }
              }}
            >
              {addDialog.type.includes('Part') && partsByMachines.list.map((part) => {
                return <MenuItem value={part.id}>{part.part_name}</MenuItem>
              })}
              {addDialog.type.includes('Boughtout') && boughtoutByMachines.list.map((bo) => {
                return <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
              })}
            </Select>
          </FormControl>

          <TextField
            sx={{ mt: 2 }}
            size='small'
            variant="outlined"
            fullWidth
            required
            label="Qty"
            name="serial_no"
            value={addDialog.qty}
            onChange={(e: any) => {
              setAddDialog({ ...addDialog, qty: e.target.value })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialog({
              dialog: false, type: '', name: '', id: '', qty: 0
            })
          }} sx={{ color: '#bb0037' }}>Cancel</Button>
          <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
            onClick={() => {
              handleAdd()
            }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
