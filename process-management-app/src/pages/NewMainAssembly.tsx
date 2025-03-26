import { useRef, useState } from 'react';
import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid2, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, ArrowBackIos, Save, Search, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { errorTextColor, nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import { createAttachment, createImage, fetchBoughtOutList, fetchMachineList, fetchPartsList } from '../slices/machineSlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { checkAssemblyName, createMainAssembly, fetchSubAssemblByMachine } from '../slices/assemblySlice';
import { FcAddImage } from "react-icons/fc";

export default function NewMainAssembly() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const { machines, parts, boughtOuts } = useAppSelector(
        (state) => state.machine
    );

    const { machineSubAssemblies } = useAppSelector(
        (state) => state.assembly
    )

    const [searchText, setSearchText] = useState("")

    // Main Assembly States Start
    const [mainAssemblyList, setMainAssemblyList] = useState<Array<{ id: number, name: string, serial_no: string }>>([]);
    const [mainAssemblySub, setMainAssemblySub] = useState<Array<{ id: number, main_assembly_id: number, sub_assembly_id: string, sub_assembly_name: string, qty: number }>>([])
    const [mainAssemblyParts, setMainAssemblyParts] = useState<Array<{ id: number, main_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
    const [mainAssemblyBoughtouts, setMainAssemblyBoughtouts] = useState<Array<{ id: number, main_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])

    const [selectedMainAssembly, setSelectedMainAssembly] = useState<{ id: number, name: string, serial_no: string, machine_id: string }>({ id: 0, name: '', serial_no: '', machine_id: '' });
    const [selectedMainAssemblySub, setSelectedMainAssemblySub] = useState<Array<{ id: number, main_assembly_id: number, sub_assembly_id: number, sub_assembly_name: string, qty: number }>>([])
    const [selectedMainAssemblyParts, setSelectedMainAssemblyParts] = useState<Array<{ id: number, main_assembly_id: number, part_id: string, part_name: string, qty: number }>>([])
    const [selectedMainAssemblyBoughtouts, setSelectedMainAssemblyBoughtouts] = useState<Array<{ id: number, main_assembly_id: number, bought_out_id: string, bought_out_name: string, qty: number }>>([])

    const [mainAssemblyDialog, setMainAssemblyDialog] = useState(false)
    // Main Assembly States End

    const [errors, setErrors] = useState<any>();
    const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])

    const [mainAssemblyFiles, setMainAssemblyFiles] = useState<Array<any>>([])
    const [mainAssemblyFileNames, setMainAssemblyFileNames] = useState<Array<string>>([])
    const [fileAdded, setFileAdded] = useState("")
    const [mainAssemblyImage, setMainAssemblyImage] = useState<any>()
    const [mainAssemblyImageName, setMainAssemblyImageName] = useState<string>()

    useEffect(() => {
        // dispatch(fetchSubAssembly()).unwrap()
        dispatch(fetchPartsList()).unwrap()
        dispatch(fetchBoughtOutList()).unwrap()
        dispatch(fetchMachineList())
    }, [dispatch])

    useEffect(() => {
        dispatch(fetchSubAssemblByMachine(selectedMainAssembly.machine_id))
    }, [selectedMainAssembly.machine_id])

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
        if (!selectedMainAssembly.name || selectedMainAssembly.name.length == 0) {
            newError.name = 'Enter main assembly name'
        }
        if (!selectedMainAssembly.serial_no || selectedMainAssembly.serial_no.length == 0) {
            newError.serial_no = 'Enter serial no'
        }
        if (!selectedMainAssembly.machine_id || selectedMainAssembly.machine_id.length == 0) {
            newError.machine_id = 'Select machine'
        }
        return newError
    }
    const handleSubmit = () => {
        setErrors({})
        const validated = validate()

        if (Object.keys(validated).length == 0) {
            if (mainAssemblyParts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id).length == 0 &&
                mainAssemblyBoughtouts.filter((sab) => sab.main_assembly_id == selectedMainAssembly.id).length == 0 &&
                mainAssemblySub.filter((sab) => sab.main_assembly_id == selectedMainAssembly.id).length == 0) {
                DisplaySnackbar('Part or Boughtout or Sub Assembly is required', 'error', enqueueSnackbar)
            } else if (mainAssemblyParts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
                .filter((sap) => sap.part_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid part', 'error', enqueueSnackbar)
            } else if (mainAssemblyBoughtouts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
                .filter((sab) => sab.bought_out_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid boughtout', 'error', enqueueSnackbar)
            } else if (mainAssemblySub.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id)
                .filter((sab) => sab.sub_assembly_id.length == 0).length > 0) {
                DisplaySnackbar('Select valid sub assembly', 'error', enqueueSnackbar)
            } else {
                dispatch(checkAssemblyName({ checkName: selectedMainAssembly.name, type: 'Main Assembly' })).unwrap()
                    .then((res) => {
                        if (res == 'Success') {
                            let main_assembly: any = {
                                main_assembly_name: selectedMainAssembly.name,
                                serial_no: selectedMainAssembly.serial_no,
                                machine_id: selectedMainAssembly.machine_id
                            }

                            const mainAssemblyDetails: any = []
                            mainAssemblyParts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id).map((parts) => {
                                mainAssemblyDetails.push({
                                    part_id: parts.part_id,
                                    qty: parts.qty
                                })
                            })
                            mainAssemblyBoughtouts.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id).map((boughtouts) => {
                                mainAssemblyDetails.push({
                                    bought_out_id: boughtouts.bought_out_id,
                                    qty: boughtouts.qty
                                })
                            })
                            mainAssemblySub.filter((sap) => sap.main_assembly_id == selectedMainAssembly.id).map((sub) => {
                                mainAssemblyDetails.push({
                                    sub_assembly_id: sub.sub_assembly_id,
                                    qty: sub.qty
                                })
                            })

                            main_assembly = { ...main_assembly, main_assembly_detail: mainAssemblyDetails }

                            dispatch(createMainAssembly(main_assembly)).unwrap().then((res) => {
                                DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                if (res.message.includes('success')) {
                                    if (mainAssemblyImage) {
                                        uploadImage(res.id)
                                    }
                                    if (mainAssemblyFiles.length > 0) {
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
                    })
            }
        } else {
            setErrors(validated)
        }
    }

    const uploadImage = (id: string) => {
        dispatch(createImage({
            files: [mainAssemblyImage], type: 'main_assembly', type_id: id, image_name: mainAssemblyImageName
        }))
    }

    const uploadAttachments = (id: string) => {
        dispatch(createAttachment({
            files: mainAssemblyFiles, type: 'main_assembly',
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
            setMainAssemblyImage(file)
            setMainAssemblyImageName(file.name)
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

                <Grid2 container sx={{ mt: 1, alignItems: 'center' }} size={12}>
                    <Grid2 size={2}>
                        <Card sx={{ borderRadius: '50%', height: '100px', width: '100px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', width: '100px' }}
                                onClick={handleCardClick}>
                                {mainAssemblyImage ? <img src={URL.createObjectURL(mainAssemblyImage)} style={{ height: '80px', width: '80px' }}
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

                    <Grid2 size={3} sx={{ ml: 1 }}>
                        <TextField
                            size='small'
                            variant="outlined"
                            fullWidth
                            required
                            label="Main Assembly Name"
                            name="main_assembly_name"
                            value={selectedMainAssembly?.name}
                            error={!!errors?.name}
                            helperText={errors?.name}
                            onChange={(e: any) => {
                                setSelectedMainAssembly({ ...selectedMainAssembly, name: e.target.value })
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
                            value={selectedMainAssembly?.serial_no}
                            onChange={(e: any) => {
                                setSelectedMainAssembly({ ...selectedMainAssembly, serial_no: e.target.value })
                            }}
                        />
                    </Grid2>

                    <Grid2 size={3} sx={{ ml: 1 }}>
                        <FormControl fullWidth sx={{ ml: 1 }}>
                            <InputLabel id="role-select-label">Machine</InputLabel>
                            <Select
                                size={'small'}
                                labelId="role-select-label"
                                id="role-select"
                                label="Vendor"
                                value={selectedMainAssembly.machine_id}
                                error={!!errors?.machine_id}
                                onChange={(e: any) => {
                                    setSelectedMainAssembly({ ...selectedMainAssembly, machine_id: e.target.value })
                                }}
                            >
                                {machines.map((machine) => {
                                    return <MenuItem value={machine.id}>{machine.machine_name}</MenuItem>
                                })}
                            </Select>
                            {errors?.machine_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.machine_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Grid2>
                </Grid2>

                <Grid2 container>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblyParts.map((sap, index) => {
                                return sap.main_assembly_id == selectedMainAssembly.id &&
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
                                                    setMainAssemblyParts(
                                                        mainAssemblyParts.map((sub) => {
                                                            return (sub.id == sap.id) ? {
                                                                id: sub.id,
                                                                main_assembly_id: selectedMainAssembly.id,
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
                                                        mainAssemblyParts.filter((maps) => maps.part_id == part.id).length == 0 &&
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
                                                setMainAssemblyParts(
                                                    mainAssemblyParts.map((sub) => {
                                                        return (sub.id == sap.id) ? {
                                                            id: sub.id,
                                                            main_assembly_id: selectedMainAssembly.id,
                                                            part_id: sub.part_id,
                                                            part_name: sub.part_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setMainAssemblyParts(mainAssemblyParts.filter((map) => map.id != sap.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    setMainAssemblyParts([...mainAssemblyParts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, part_id: "", part_name: "", qty: 0 }])
                                }}>
                                Add New Part
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblyBoughtouts.map((sab, index) => {
                                return sab.main_assembly_id == selectedMainAssembly.id &&
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
                                                    setMainAssemblyBoughtouts(
                                                        mainAssemblyBoughtouts.map((sub) => {
                                                            return (sub.id == sab.id) ? {
                                                                id: sub.id,
                                                                main_assembly_id: selectedMainAssembly.id,
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
                                                        mainAssemblyBoughtouts.filter((mabs) => mabs.bought_out_id == bo.id).length == 0 &&
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
                                                setMainAssemblyBoughtouts(
                                                    mainAssemblyBoughtouts.map((sub) => {
                                                        return (sub.id == sab.id) ? {
                                                            id: sub.id,
                                                            main_assembly_id: selectedMainAssembly.id,
                                                            bought_out_id: sub.bought_out_id,
                                                            bought_out_name: sub.bought_out_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setMainAssemblyBoughtouts(mainAssemblyBoughtouts.filter((sap) => sap.id != sab.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    setMainAssemblyBoughtouts([...mainAssemblyBoughtouts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                                }}>
                                Add New Boughtout
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblySub.map((sab, index) => {
                                return sab.main_assembly_id == selectedMainAssembly.id &&
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
                                                    setMainAssemblySub(
                                                        mainAssemblySub.map((sub) => {
                                                            return (sub.id == sab.id) ? {
                                                                id: sub.id,
                                                                main_assembly_id: selectedMainAssembly.id,
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
                                                        mainAssemblySub.filter((mabs: any) => mabs.sub_assembly_id == bo.sub_assembly_id).length == 0 &&
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
                                                setMainAssemblySub(
                                                    mainAssemblySub.map((sub) => {
                                                        return (sub.id == sab.id) ? {
                                                            id: sub.id,
                                                            main_assembly_id: selectedMainAssembly.id,
                                                            sub_assembly_id: sub.sub_assembly_id,
                                                            sub_assembly_name: sub.sub_assembly_name,
                                                            qty: e.target.value
                                                        } : sub
                                                    })
                                                )
                                            }}
                                        />
                                        <IoMdCloseCircle style={{ color: 'red', marginLeft: '5px', verticalAlign: 'center', cursor: 'pointer' }} size={'40px'} onClick={() => {
                                            setMainAssemblySub(mainAssemblySub.filter((sap) => sap.id != sab.id))
                                        }} />
                                    </Box>)
                            })}
                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                disabled={!selectedMainAssembly.machine_id}
                                onClick={() => {
                                    setMainAssemblySub([...mainAssemblySub, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, sub_assembly_id: "", sub_assembly_name: "", qty: 0 }])
                                }}>
                                Add New Sub Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblyFileNames.map((file: any) => {
                                return <Chip label={file} variant='outlined' sx={{ mr: 1 }} onDelete={() => {
                                    setMainAssemblyFiles(mainAssemblyFiles.filter((f) => f.name != file))
                                    setMainAssemblyFileNames(mainAssemblyFileNames.filter((f) => f != file))
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
                                        const files: any = mainAssemblyFiles
                                        const chosenFiles = Array.prototype.slice.call(event.target.files)
                                        chosenFiles.map((file) => {
                                            files.push(file)
                                        })
                                        setMainAssemblyFiles(files)
                                        setFileAdded(`${files.length} files added`)

                                        let fileNames = mainAssemblyFileNames
                                        chosenFiles.map((f: any) => {
                                            fileNames.push(f.name)
                                        })
                                        setMainAssemblyFileNames(fileNames)
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
