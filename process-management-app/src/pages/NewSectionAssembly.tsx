import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid2, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, ArrowBackIos, Save, Search, Settings } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { errorTextColor, nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import { createAttachment, fetchBoughtOutList, fetchMachineList, fetchPartsList } from '../slices/machineSlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { validateDate } from '@mui/x-date-pickers';
import { checkAssemblyName, createSectionAssembly, fetchMainAssemblByMachine, fetchSubAssemblByMachine } from '../slices/assemblySlice';

export default function NewSectionAssembly() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const { machines, parts, boughtOuts } = useAppSelector(
        (state) => state.machine
    );

    const { machineSubAssemblies, machineMainAssemblies } = useAppSelector(
        (state) => state.assembly
    );

    const [searchText, setSearchText] = useState("")

    // Main Assembly States Start
    const [sectionAssemblySub, setSectionAssemblySub] = useState<Array<{ id: number, section_assembly_id: number, sub_assembly_id: string, sub_assembly_name: string, qty: number }>>([])
    const [sectionAssemblyParts, setSectionAssemblyParts] = useState<Array<{ id: number, section_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
    const [sectionAssemblyBoughtouts, setSectionAssemblyBoughtouts] = useState<Array<{ id: number, section_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])
    const [sectionAssemblyMain, setSectionAssemblyMain] = useState<Array<{ id: number, section_assembly_id: number, main_assembly_id: string, main_assembly_name: string, qty: number }>>([])

    const [selectedSectionAssembly, setSelectedSectionAssembly] = useState<{ id: number, name: string, serial_no: string, machine_id: string }>({ id: 0, name: '', serial_no: '', machine_id: '' });
    // Main Assembly States End

    const [errors, setErrors] = useState<any>();
    const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])
    
    const [sectionAssemblyFiles, setSectionAssemblyFiles] = useState<Array<any>>([])
    const [sectionAssemblyFileNames, setSectionAssemblyFileNames] = useState<Array<string>>([])
    const [fileAdded, setFileAdded] = useState("")

    useEffect(() => {
        // dispatch(fetchSubAssembly()).unwrap()
        dispatch(fetchPartsList()).unwrap()
        dispatch(fetchBoughtOutList()).unwrap()
        dispatch(fetchMachineList())
    }, [dispatch])

    useEffect(() => {
        if(selectedSectionAssembly.machine_id && selectedSectionAssembly.machine_id.length > 0){
            dispatch(fetchSubAssemblByMachine(selectedSectionAssembly.machine_id))
            dispatch(fetchMainAssemblByMachine(selectedSectionAssembly.machine_id))
        }
    }, [selectedSectionAssembly.machine_id])

    const handleMultiProcessChange = (event: SelectChangeEvent<typeof selectedMachines>) => {
        const {
            target: { value },
        } = event;
        setSelectedMachines(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const validate = () => {
        const newError: any = {}
        if (!selectedSectionAssembly.name || selectedSectionAssembly.name.length == 0) {
            newError.name = 'Enter main assembly name'
        }
        if (!selectedSectionAssembly.serial_no || selectedSectionAssembly.serial_no.length == 0) {
            newError.serial_no = 'Enter serial no'
        }
        if (!selectedSectionAssembly.machine_id || selectedSectionAssembly.machine_id.length == 0) {
            newError.machine_id = 'Select machine'
        }
        return newError
    }
    const handleSubmit = () => {
        setErrors({})
        const validated = validate()

        if (Object.keys(validated).length == 0) {
            if (sectionAssemblyParts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
                sectionAssemblyBoughtouts.filter((sab) => sab.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
                sectionAssemblySub.filter((sab) => sab.section_assembly_id == selectedSectionAssembly.id).length == 0 &&
                sectionAssemblyMain.filter((sab) => sab.section_assembly_id == selectedSectionAssembly.id).length == 0) {
                DisplaySnackbar('Part or Boughtout or Sub Assembly or Main Assembly is required', 'error', enqueueSnackbar)
            } else if (sectionAssemblyParts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
                .filter((sap) => sap.part_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid part', 'error', enqueueSnackbar)
            } else if (sectionAssemblyBoughtouts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
                .filter((sab) => sab.bought_out_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid boughtout', 'error', enqueueSnackbar)
            } else if (sectionAssemblySub.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
                .filter((sab) => sab.sub_assembly_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid sub assembly', 'error', enqueueSnackbar)
            } else if (sectionAssemblyMain.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id)
                .filter((sab) => sab.main_assembly_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid main assembly', 'error', enqueueSnackbar)
            } else {
                dispatch(checkAssemblyName({ checkName: selectedSectionAssembly.name, type: 'Section Assembly' })).unwrap()
                    .then((res) => {
                        if (res == 'Success') {
                            let section_assembly: any = {
                                section_assembly_name: selectedSectionAssembly.name,
                                serial_no: selectedSectionAssembly.serial_no,
                                machine_id: selectedSectionAssembly.machine_id
                            }

                            const sectionAssemblyDetails: any = []
                            sectionAssemblyParts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).map((parts) => {
                                sectionAssemblyDetails.push({
                                    part_id: parts.part_id,
                                    qty: parts.qty
                                })
                            })
                            sectionAssemblyBoughtouts.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).map((boughtouts) => {
                                sectionAssemblyDetails.push({
                                    bought_out_id: boughtouts.bought_out_id,
                                    qty: boughtouts.qty
                                })
                            })
                            sectionAssemblySub.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).map((sub) => {
                                sectionAssemblyDetails.push({
                                    sub_assembly_id: sub.sub_assembly_id,
                                    qty: sub.qty
                                })
                            })
                            sectionAssemblyMain.filter((sap) => sap.section_assembly_id == selectedSectionAssembly.id).map((sub) => {
                                sectionAssemblyDetails.push({
                                    main_assembly_id: sub.main_assembly_id,
                                    qty: sub.qty
                                })
                            })

                            section_assembly = { ...section_assembly, section_assembly_detail: sectionAssemblyDetails }

                            dispatch(createSectionAssembly(section_assembly)).unwrap().then((res) => {
                                DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                if (res.message.includes('success')) {
                                    if(sectionAssemblyFiles.length > 0){
                                        DisplaySnackbar('Uploading attachments', "success", enqueueSnackbar)
                                        uploadAttachments(res.id)
                                      }else{
                                        navigate(-1)
                                      }
                                }
                            }).catch((err) => {
                                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                            })
                        }
                    })
            }
        }else{
            setErrors(validated)
        }
    }

    const uploadAttachments = (id: string) => {
        dispatch(createAttachment({ files: sectionAssemblyFiles, type: 'section_assembly', 
          type_id: id})).unwrap()
          .then((res:any) => {
            DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
            navigate(-1)
          })
          .catch((err:any)=>{
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
            navigate(-1)
          })
      }

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_subassembly} />

            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', ml: 2 }}>
                <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
                    navigate(-1)
                }}>
                    Back
                </Button>

                <Grid2 container sx={{mt:1}} size={12}>
                    <Grid2 size={4}>
                    <TextField
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        label="Section Assembly Name"
                        name="section_assembly_name"
                        value={selectedSectionAssembly?.name}
                        error={!!errors?.name}
                        helperText={errors?.name}
                        onChange={(e: any) => {
                            setSelectedSectionAssembly({ ...selectedSectionAssembly, name: e.target.value })
                        }}
                    />
                    </Grid2>
                   <Grid2 size={3}>
                   <TextField
                        sx={{ ml: 1 }}
                        size='small'
                        variant="outlined"
                        fullWidth
                        required
                        helperText={errors?.serial_no}
                        error={!!errors?.serial_no}
                        label="Serial No"
                        name="serial_no"
                        value={selectedSectionAssembly?.serial_no}
                        onChange={(e: any) => {
                            setSelectedSectionAssembly({ ...selectedSectionAssembly, serial_no: e.target.value })
                        }}
                    />
                   </Grid2>

                    <Grid2 size={3} sx={{ml:1}}>
                    <FormControl fullWidth sx={{ ml: 1 }}>
                        <InputLabel id="role-select-label">Machine</InputLabel>
                        <Select
                            size={'small'}
                            labelId="role-select-label"
                            id="role-select"
                            label="Machine"
                            value={selectedSectionAssembly.machine_id}
                            error={!!errors?.machine_id}
                            onChange={(e: any) => {
                                setSelectedSectionAssembly({ ...selectedSectionAssembly, machine_id: e.target.value })
                            }}
                        >
                            {machines.map((machine) => {
                                return <MenuItem value={machine.id}>{machine.machine_name}</MenuItem>
                            })}
                        </Select>
                        {errors?.machine_id ? <FormHelperText sx={{color: errorTextColor }}>{errors?.machine_id}</FormHelperText> : <></>}
                    </FormControl>
                    </Grid2>
                </Grid2>

                <Grid2 container>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyParts.map((sap, index) => {
                                return sap.section_assembly_id == selectedSectionAssembly.id &&
                                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="role-select-label">Part</InputLabel>
                                            <Select
                                                size={'small'}
                                                labelId="role-select-label"
                                                id="role-select"
                                                label="Part"
                                                value={sap.part_id}
                                                onChange={(e: any) => {
                                                    setSectionAssemblyParts(
                                                        sectionAssemblyParts.map((sub) => {
                                                            return (sub.id == sap.id) ? {
                                                                id: sub.id,
                                                                section_assembly_id: selectedSectionAssembly.id,
                                                                part_id: e.target.value,
                                                                part_name: parts.list.find((p) => p.id == e.target.value).part_name,
                                                                qty: sub.qty
                                                            } : sub
                                                        })
                                                    )
                                                }}
                                            >
                                                {parts.list.map((part) => {
                                                    return part.id == sap.part_id ? <MenuItem value={part.id}>{part.part_name}</MenuItem> :
                                                        sectionAssemblyParts.filter((maps) => maps.part_id == part.id).length == 0 &&
                                                        <MenuItem value={part.id}>{part.part_name}</MenuItem>
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
                                                setSectionAssemblyParts(
                                                    sectionAssemblyParts.map((sub) => {
                                                        return (sub.id == sap.id) ? {
                                                            id: sub.id,
                                                            section_assembly_id: selectedSectionAssembly.id,
                                                            part_id: sub.part_id,
                                                            part_name: sub.part_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setSectionAssemblyParts(sectionAssemblyParts.filter((map) => map.id != sap.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    setSectionAssemblyParts([...sectionAssemblyParts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, part_id: "", part_name: "", qty: 0 }])
                                }}>
                                Add New Part
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyBoughtouts.map((sab, index) => {
                                return sab.section_assembly_id == selectedSectionAssembly.id &&
                                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="role-select-label">Boughtout</InputLabel>
                                            <Select
                                                size={'small'}
                                                labelId="role-select-label"
                                                id="role-select"
                                                label="Boughtout"
                                                value={sab.bought_out_id}
                                                onChange={(e: any) => {
                                                    setSectionAssemblyBoughtouts(
                                                        sectionAssemblyBoughtouts.map((sub) => {
                                                            return (sub.id == sab.id) ? {
                                                                id: sub.id,
                                                                section_assembly_id: selectedSectionAssembly.id,
                                                                bought_out_id: e.target.value,
                                                                bought_out_name: boughtOuts.find((b) => b.id == e.target.value).bought_out_name,
                                                                qty: sub.qty
                                                            } : sub
                                                        })
                                                    )
                                                }}
                                            >
                                                {boughtOuts.map((bo) => {
                                                    return bo.id == sab.bought_out_id ? <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem> :
                                                        sectionAssemblyBoughtouts.filter((mabs) => mabs.bought_out_id == bo.id).length == 0 &&
                                                        <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
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
                                                setSectionAssemblyBoughtouts(
                                                    sectionAssemblyBoughtouts.map((sub) => {
                                                        return (sub.id == sab.id) ? {
                                                            id: sub.id,
                                                            section_assembly_id: selectedSectionAssembly.id,
                                                            bought_out_id: sub.bought_out_id,
                                                            bought_out_name: sub.bought_out_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((sap) => sap.id != sab.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    setSectionAssemblyBoughtouts([...sectionAssemblyBoughtouts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                                }}>
                                Add New Boughtout
                            </Button>
                        </Card>
                    </Grid2>
                    
                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblySub.map((sab, index) => {
                                return sab.section_assembly_id == selectedSectionAssembly.id &&
                                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="role-select-label">Sub Assembly</InputLabel>
                                            <Select
                                                size={'small'}
                                                labelId="role-select-label"
                                                id="role-select"
                                                label="Sub Assembly"
                                                value={sab.sub_assembly_id}
                                                onChange={(e: any) => {
                                                    setSectionAssemblySub(
                                                        sectionAssemblySub.map((sub) => {
                                                            return (sub.id == sab.id) ? {
                                                                id: sub.id,
                                                                section_assembly_id: selectedSectionAssembly.id,
                                                                sub_assembly_id: e.target.value,
                                                                sub_assembly_name: machineSubAssemblies.find((b) => b.sub_assembly_id == e.target.value).sub_assembly_name,
                                                                qty: sub.qty
                                                            } : sub
                                                        })
                                                    )
                                                }}
                                            >
                                                {machineSubAssemblies.map((bo: any) => {
                                                    return bo.sub_assembly_id == sab.sub_assembly_id ? <MenuItem value={bo.sub_assembly_id}>{bo.sub_assembly_name}</MenuItem> :
                                                        sectionAssemblySub.filter((mabs: any) => mabs.sub_assembly_id == bo.sub_assembly_id).length == 0 &&
                                                        <MenuItem value={bo.sub_assembly_id}>{bo.sub_assembly_name}</MenuItem>
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
                                                setSectionAssemblySub(
                                                    sectionAssemblySub.map((sub) => {
                                                        return (sub.id == sab.id) ? {
                                                            id: sub.id,
                                                            section_assembly_id: selectedSectionAssembly.id,
                                                            sub_assembly_id: sub.sub_assembly_id,
                                                            sub_assembly_name: sub.sub_assembly_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setSectionAssemblySub(sectionAssemblySub.filter((sap) => sap.id != sab.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                disabled={!selectedSectionAssembly.machine_id}
                                onClick={() => {
                                    setSectionAssemblySub([...sectionAssemblySub, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, sub_assembly_id: "", sub_assembly_name: "", qty: 0 }])
                                }}>
                                Add New Sub Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyMain.map((sab, index) => {
                                return sab.section_assembly_id == selectedSectionAssembly.id &&
                                    (<Box sx={{ display: 'flex', flexDirection: 'row', mt: index == 0 ? 0 : 1 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="role-select-label">Sub Assembly</InputLabel>
                                            <Select
                                                size={'small'}
                                                labelId="role-select-label"
                                                id="role-select"
                                                label="Sub Assembly"
                                                value={sab.main_assembly_id}
                                                onChange={(e: any) => {
                                                    setSectionAssemblyMain(
                                                        sectionAssemblyMain.map((sub) => {
                                                            return (sub.id == sab.id) ? {
                                                                id: sub.id,
                                                                section_assembly_id: selectedSectionAssembly.id,
                                                                main_assembly_id: e.target.value,
                                                                main_assembly_name: machineMainAssemblies.find((b) => b.id == e.target.value).main_assembly_name,
                                                                qty: sub.qty
                                                            } : sub
                                                        })
                                                    )
                                                }}
                                            >
                                                {machineMainAssemblies.map((bo: any) => {
                                                    return bo.id == sab.main_assembly_id ? <MenuItem value={bo.id}>{bo.main_assembly_name}</MenuItem> :
                                                        sectionAssemblyMain.filter((mabs: any) => mabs.main_assembly_id == bo.id).length == 0 &&
                                                        <MenuItem value={bo.id}>{bo.main_assembly_name}</MenuItem>
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
                                                setSectionAssemblyMain(
                                                    sectionAssemblyMain.map((sub) => {
                                                        return (sub.id == sab.id) ? {
                                                            id: sub.id,
                                                            section_assembly_id: selectedSectionAssembly.id,
                                                            main_assembly_id: sub.main_assembly_id,
                                                            main_assembly_name: sub.main_assembly_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setSectionAssemblyMain(sectionAssemblyMain.filter((sap) => sap.id != sab.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                disabled={!selectedSectionAssembly.machine_id}
                                onClick={() => {
                                    setSectionAssemblyMain([...sectionAssemblyMain, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, main_assembly_id: "", main_assembly_name: "", qty: 0 }])
                                }}>
                                Add New Main Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                    <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyFileNames.map((file: any) => {
                                return <Chip label={file} variant='outlined' sx={{ mr: 1 }} onDelete={() => {
                                    setSectionAssemblyFiles(sectionAssemblyFiles.filter((f) => f.name != file))
                                    setSectionAssemblyFileNames(sectionAssemblyFileNames.filter((f) => f != file))
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
                                        const files: any = sectionAssemblyFiles
                                        const chosenFiles = Array.prototype.slice.call(event.target.files)
                                        chosenFiles.map((file) => {
                                            files.push(file)
                                        })
                                        setSectionAssemblyFiles(files)
                                        setFileAdded(`${files.length} files added`)
                                        
                                        let fileNames = sectionAssemblyFileNames
                                        chosenFiles.map((f: any) => {
                                            fileNames.push(f.name)
                                        })
                                        setSectionAssemblyFileNames(fileNames)
                                    }}
                                    multiple
                                />
                            </Button>
                        </Card>
                    </Grid2>
                </Grid2>

                <Grid2 size={12} container justifyContent={'flex-end'} sx={{ mt: 2 }}>
                    <Grid2 size={2}>
                        <Button variant='outlined' color="primary" fullWidth onClick={(e: any) => {
                            navigate(-1)
                        }}>
                            Cancel
                        </Button>
                    </Grid2>
                    <Grid2 size={2}>
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
