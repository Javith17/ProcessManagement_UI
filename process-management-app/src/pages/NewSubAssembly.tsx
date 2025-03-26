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
import { useNavigate } from 'react-router-dom';
import { nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import { createAttachment, createImage, fetchBOListByMachine, fetchBoughtOutList, fetchMachineList, fetchPartsList, fetchPartsListByMachine } from '../slices/machineSlice';
import { checkAssemblyName, createSubAssembly, fetchSubAssembly } from '../slices/assemblySlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { FcAddImage } from "react-icons/fc";

export default function NewSubAssembly() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { machines, parts, boughtoutByMachines, partsByMachines } = useAppSelector(
    (state) => state.machine
  );

  const [subAssemblyParts, setSubAssemblyParts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, part_id: string, part_name: string, qty: number }>>([])
  const [subAssemblyBoughtouts, setSubAssemblyBoughtouts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [subAssemblyFiles, setSubAssemblyFiles] = useState<Array<any>>([])
  const [subAssemblyFileNames, setSubAssemblyFileNames] = useState<Array<string>>([])
  const [fileAdded, setFileAdded] = useState("")

  const [selectedSubAssembly, setSelectedSubAssembly] = useState<{ id: number, name: string, serial_no: string }>({ id: 0, name: '', serial_no: '' });
  const [selectedSubAssemblyParts, setSelectedSubAssemblyParts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, part_id: string, part_name: string, qty: number }>>([])
  const [selectedSubAssemblyBoughtouts, setSelectedSubAssemblyBoughtouts] = useState<Array<{ id: number, sub_assembly_id: number, name: string, bought_out_id: string, bought_out_name: string, qty: number }>>([])

  const [errors, setErrors] = useState<any>();
  const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])

  const [subAssemblyImage, setSubAssemblyImage] = useState<any>()
  const [subAssemblyImageName, setSubAssemblyImageName] = useState<string>()

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

  // useEffect(()=>{
  //   dispatch(createAttachment({ files: subAssemblyFiles, type: 'sub_assembly', type_id: 'e2cb4ee7-0d30-4e50-a02a-c6b60977909e'}))
  // }, [subAssemblyFileNames])

  const handleMultiProcessChange = (event: SelectChangeEvent<typeof selectedMachines>) => {
    const {
      target: { value },
    } = event;
    setSelectedMachines(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSubmit = () => {
    setErrors({})

    if (selectedSubAssembly.name.length == 0) {
      setErrors({ ...errors, name: 'Enter sub assembly name' })
    }
    if (selectedSubAssembly.serial_no.length == 0) {
      setErrors({ ...errors, serial_no: 'Enter serial no' })
    }

    if (subAssemblyParts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id).length == 0 &&
      subAssemblyBoughtouts.filter((sab) => sab.sub_assembly_id == selectedSubAssembly.id).length == 0) {
      DisplaySnackbar('Part or Boughtout is required', 'error', enqueueSnackbar)
    } else if (subAssemblyParts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id)
      .filter((sap) => sap.part_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid part', 'error', enqueueSnackbar)
    } else if (subAssemblyBoughtouts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id)
      .filter((sab) => sab.bought_out_id.length == 0).length > 0) {
      DisplaySnackbar('Select valid boughtout', 'error', enqueueSnackbar)
    } else if (selectedMachines.length == 0) {
      DisplaySnackbar('Select machine', 'error', enqueueSnackbar)
    } else {
      dispatch(checkAssemblyName({ checkName: selectedSubAssembly.name, type: 'Sub Assembly' })).unwrap()
        .then((res) => {
          if (res == 'Success') {
            let sub_assembly: any = {
              sub_assembly_name: selectedSubAssembly.name,
              serial_no: selectedSubAssembly.serial_no
            }
            const subAssemblyDetails: any = []
            subAssemblyParts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id).map((parts) => {
              subAssemblyDetails.push({
                part_id: parts.part_id,
                qty: parts.qty
              })
            })
            subAssemblyBoughtouts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id).map((boughtouts) => {
              subAssemblyDetails.push({
                bought_out_id: boughtouts.bought_out_id,
                qty: boughtouts.qty
              })
            })
            sub_assembly = { ...sub_assembly, sub_assembly_detail: subAssemblyDetails }

            const machine_list: any = []
            selectedMachines.forEach((m) => {
              machine_list.push(machines.find((f) => m == f.machine_name)?.id)
            })
            sub_assembly = { ...sub_assembly, machine_list: machine_list }

            dispatch(createSubAssembly(sub_assembly)).unwrap().then((res) => {
              DisplaySnackbar(`${res.message}`, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
              if (res.message.includes('success')) {
                if (subAssemblyImage) {
                  uploadImage(res.id)
                }
                if (subAssemblyFiles.length > 0) {
                  DisplaySnackbar('Uploading attachments', "success", enqueueSnackbar)
                  uploadAttachments(res.id)
                } else {
                  navigate(-1)
                }
              }
            }).catch((err) => {
              DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            })
          } else {
            DisplaySnackbar(res, 'error', enqueueSnackbar)
          }
        })
    }
  }

  const uploadImage = (id: string) => {
    dispatch(createImage({
      files: [subAssemblyImage], type: 'sub_assembly', type_id: id, image_name: subAssemblyImageName
    }))
  }

  const uploadAttachments = (id: string) => {
    dispatch(createAttachment({
      files: subAssemblyFiles, type: 'sub_assembly',
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
    }
  };

  return (
    <Box sx={{ display: 'flex', direction: 'column' }}>
      <SidebarNav currentPage={nav_subassembly} />

      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', ml: 2 }}>
        <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
          navigate(-1)
        }}>
          Back
        </Button>

        <Grid2 container sx={{alignItems:'center'}}>
          <Grid2 size={2}>
            <Card sx={{ borderRadius: '50%', height: '100px', width: '100px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', width: '100px' }}
                onClick={handleCardClick}>
                {subAssemblyImage ? <img src={URL.createObjectURL(subAssemblyImage)} style={{ height: '80px', width: '80px', objectFit:'contain' }}
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
          <Grid2 size={4} sx={{ml:1}}>
            <TextField
              sx={{ml:1}}
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
          <Grid2 size={4} sx={{ml:1}} >
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
            <Card sx={{ padding: 2, mt: 1 }}>
              {subAssemblyParts.map((sap, index) => {
                return sap.sub_assembly_id == selectedSubAssembly.id &&
                  (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="role-select-label">Part</InputLabel>
                      <Select
                        size={'small'}
                        labelId="role-select-label"
                        id="role-select"
                        label="Vendor"
                        value={sap.part_id}
                        onChange={(e: any) => {
                          setSubAssemblyParts(
                            subAssemblyParts.map((sub) => {
                              return (sub.id == sap.id) ? {
                                id: sub.id,
                                sub_assembly_id: selectedSubAssembly.id,
                                name: selectedSubAssembly.name,
                                part_id: e.target.value,
                                part_name: parts.list.find((p) => p.id == e.target.value).part_name,
                                qty: sub.qty
                              } : sub
                            })
                          )
                        }}
                      >
                        {partsByMachines.list.map((part) => {
                          return <MenuItem value={part.id}>{part.part_name}</MenuItem>
                        })}
                      </Select>
                    </FormControl>

                    <TextField
                      sx={{ ml: 1 }}
                      size='small'
                      variant="outlined"
                      fullWidth
                      required
                      label="Qty"
                      name="serial_no"
                      value={sap.qty}
                      onChange={(e: any) => {
                        setSubAssemblyParts(
                          subAssemblyParts.map((sub) => {
                            return (sub.id == sap.id) ? {
                              id: sub.id,
                              sub_assembly_id: selectedSubAssembly.id,
                              name: selectedSubAssembly.name,
                              part_id: sub.part_id,
                              part_name: sub.part_name,
                              qty: e.target.value
                            } : sub
                          })
                        )
                      }}
                    />
                    <IoMdCloseCircle color='red' size={'40px'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => {
                      setSubAssemblyParts(subAssemblyParts.filter((sub) => sub.id != sap.id))
                    }} />
                  </Box>)
              })}
              <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                disabled={selectedMachines.length == 0}
                onClick={() => {
                  setSubAssemblyParts([...subAssemblyParts, { id: new Date().getTime(), sub_assembly_id: selectedSubAssembly.id, name: selectedSubAssembly.name, part_id: "", part_name: "", qty: 0 }])
                }}>
                Add New Part
              </Button>
            </Card>
          </Grid2>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1 }}>
              {subAssemblyBoughtouts.map((sab, index) => {
                return sab.sub_assembly_id == selectedSubAssembly.id &&
                  (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="role-select-label">Boughtout</InputLabel>
                      <Select
                        size={'small'}
                        labelId="role-select-label"
                        id="role-select"
                        label="Boughtout"
                        onChange={(e: any) => {
                          setSubAssemblyBoughtouts(
                            subAssemblyBoughtouts.map((sub) => {
                              return (sub.id == sab.id) ? {
                                id: sub.id,
                                sub_assembly_id: selectedSubAssembly.id,
                                name: selectedSubAssembly.name,
                                bought_out_id: e.target.value,
                                bought_out_name: boughtoutByMachines?.list?.find((b) => b.id == e.target.value).bought_out_name,
                                qty: sub.qty
                              } : sub
                            })
                          )
                        }}
                      >
                        {boughtoutByMachines?.list?.map((boughtout) => {
                          return <MenuItem value={boughtout.id}>{boughtout.bought_out_name}</MenuItem>
                        })}
                      </Select>
                    </FormControl>

                    <TextField
                      sx={{ ml: 1 }}
                      size='small'
                      variant="outlined"
                      fullWidth
                      required
                      label="Qty"
                      name="serial_no"
                      value={sab.qty}
                      onChange={(e: any) => {
                        setSubAssemblyBoughtouts(
                          subAssemblyBoughtouts.map((sub) => {
                            return (sub.id == sab.id) ? {
                              id: sub.id,
                              sub_assembly_id: selectedSubAssembly.id,
                              name: selectedSubAssembly.name,
                              bought_out_id: sub.bought_out_id,
                              bought_out_name: sub.bought_out_name,
                              qty: e.target.value
                            } : sub
                          })
                        )
                      }}
                    />
                    <IoMdCloseCircle color='red' size={'40px'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => {
                      setSubAssemblyBoughtouts(subAssemblyBoughtouts.filter((sub) => sub.id != sab.id))
                    }} />
                  </Box>)
              })}
              <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                disabled={selectedMachines.length == 0}
                onClick={() => {
                  setSubAssemblyBoughtouts([...subAssemblyBoughtouts, { id: new Date().getTime(), sub_assembly_id: selectedSubAssembly.id, name: selectedSubAssembly.name, bought_out_id: "", bought_out_name: "", qty: 0 }])
                }}>
                Add New Boughtout
              </Button>
            </Card>
          </Grid2>

          <Grid2 size={12}>
            <Card sx={{ padding: 2, mt: 1 }}>
              {subAssemblyFileNames.map((file: any) => {
                return <Chip label={file} variant='outlined' sx={{ mr: 1 }} onDelete={() => {
                  setSubAssemblyFiles(subAssemblyFiles.filter((f) => f.name != file))
                  setSubAssemblyFileNames(subAssemblyFileNames.filter((f) => f != file))
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
                    setSubAssemblyFiles(files)
                    setFileAdded(`${files.length} files added`)

                    let fileNames = subAssemblyFileNames
                    chosenFiles.map((f: any) => {
                      fileNames.push(f.name)
                    })
                    setSubAssemblyFileNames(fileNames)
                  }}
                  multiple
                />
              </Button>
            </Card>
          </Grid2>
        </Grid2>

        <Grid2 container sx={{ mt: 2 }} size={{ xs: 12, md: 12 }}>
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
    </Box>
  );
}
