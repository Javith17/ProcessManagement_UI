import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid2, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, TextField } from '@mui/material';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchCustomers, fetchRoles } from '../slices/adminSlice';
import { Add, ArrowBackIos, Save, Search, Settings } from '@mui/icons-material';
import { ImCheckboxChecked } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import { errorTextColor, nav_customers, nav_subassembly, TableRowStyled, VisuallyHiddenInput } from '../constants';
import { createAttachment, fetchBoughtOutList, fetchMachineList, fetchPartsList } from '../slices/machineSlice';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useSnackbar } from 'notistack';
import { IoMdCloseCircle } from "react-icons/io";
import { validateDate } from '@mui/x-date-pickers';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { checkAssemblyName, createSectionAssembly, fetchMainAssemblByMachine, fetchSectionAssemblyDetail, fetchSubAssemblByMachine, removeAttachment, updateAssembly } from '../slices/assemblySlice';

export default function EditSectionAssembly() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { state } = useLocation()

    const { machines, parts, boughtOuts } = useAppSelector(
        (state) => state.machine
    );

    const { machineSubAssemblies, machineMainAssemblies, sectionAssemblyDetail } = useAppSelector(
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

    useEffect(() => {
        // dispatch(fetchSubAssembly()).unwrap()
        dispatch(fetchPartsList()).unwrap()
        dispatch(fetchBoughtOutList()).unwrap()
        dispatch(fetchMachineList())
    }, [dispatch])

    useEffect(() => {
        if (selectedSectionAssembly.machine_id && selectedSectionAssembly.machine_id.length > 0) {
            dispatch(fetchSubAssemblByMachine(selectedSectionAssembly.machine_id))
            dispatch(fetchMainAssemblByMachine(selectedSectionAssembly.machine_id))
        }
    }, [selectedSectionAssembly.machine_id])

    useEffect(() => {
        if (state?.id) {
            dispatch(fetchSectionAssemblyDetail(state?.id)).unwrap().then((res: any) => {
                setSelectedSectionAssembly({ id: res.section_assembly_detail.id, name: res.section_assembly_detail.section_assembly_name, serial_no: res.section_assembly_detail.serial_no, machine_id: res.section_assembly_detail.machine.id })

                const sectionParts: any = []
                const sectionBoughtouts: any = []
                const sectionSub: any = []
                const sectionMain: any = []

                res.section_assembly_detail.section_assembly_detail?.map((detail: any) => {
                    if (detail.part) {
                        sectionParts.push({
                            id: detail.id, section_assembly_id: res.section_assembly_detail.id,
                            part_id: detail.part.id, part_name: detail.part.part_name, qty: detail.qty
                        })
                    } else if (detail.bought_out) {
                        sectionBoughtouts.push({
                            id: detail.id, section_assembly_id: res.section_assembly_detail.id,
                            bought_out_id: detail.bought_out.id, bought_out_name: detail.bought_out.bought_out_name, qty: detail.qty
                        })
                    } else if (detail.sub_assembly) {
                        sectionSub.push({
                            id: detail.id, section_assembly_id: res.section_assembly_detail.id,
                            sub_assembly_id: detail.sub_assembly.id, sub_assembly_name: detail.sub_assembly.sub_assembly_name, qty: detail.qty
                        })
                    } else if (detail.main_assembly) {
                        sectionMain.push({
                            id: detail.id, section_assembly_id: res.section_assembly_detail.id,
                            main_assembly_id: detail.main_assembly.id, main_assembly_name: detail.main_assembly.main_assembly_name, qty: detail.qty
                        })
                    }
                })
                setSectionAssemblyParts(sectionParts)
                setSectionAssemblyBoughtouts(sectionBoughtouts)
                setSectionAssemblySub(sectionSub)
                setSectionAssemblyMain(sectionMain)

                const attachments: any = []
                res.attachments?.map((attachment: any) => {
                    attachments.push(attachment.file_name)
                })
                setSectionAssemblyFileNames(attachments)

            }).catch((err) => {

            })
        }
    }, [state])

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
            assembly_type: 'section_assembly',
            assembly_udpate_type: updateDialog.type,
            qty: updateDialog.qty
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (updateDialog.type.includes('Part')) {
                    setSectionAssemblyParts(
                        sectionAssemblyParts.map((part) => {
                            return (part.id.toString() == updateDialog.id.toString()) ? {
                                id: part.id,
                                section_assembly_id: part.section_assembly_id,
                                part_id: part.part_id,
                                part_name: part.part_name,
                                qty: updateDialog.qty
                            } : part
                        })
                    )
                } else if (updateDialog.type.includes('Boughtout')) {
                    setSectionAssemblyBoughtouts(
                        sectionAssemblyBoughtouts.map((bo) => {
                            return (bo.id.toString() == updateDialog.id.toString()) ? {
                                id: bo.id,
                                section_assembly_id: bo.section_assembly_id,
                                bought_out_name: bo.bought_out_name,
                                bought_out_id: bo.bought_out_id,
                                qty: updateDialog.qty
                            } : bo
                        })
                    )
                } else if (updateDialog.type.includes('Sub Assembly')) {
                    setSectionAssemblySub(
                        sectionAssemblySub.map((bo) => {
                            return (bo.id.toString() == updateDialog.id.toString()) ? {
                                id: bo.id,
                                section_assembly_id: bo.section_assembly_id,
                                sub_assembly_name: bo.sub_assembly_name,
                                sub_assembly_id: bo.sub_assembly_id,
                                qty: updateDialog.qty
                            } : bo
                        })
                    )
                } else if (updateDialog.type.includes('Main Assembly')) {
                    setSectionAssemblyMain(
                        sectionAssemblyMain.map((bo) => {
                            return (bo.id.toString() == updateDialog.id.toString()) ? {
                                id: bo.id,
                                section_assembly_id: bo.section_assembly_id,
                                main_assembly_name: bo.main_assembly_name,
                                main_assembly_id: bo.main_assembly_id,
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
            assembly_type: 'section_assembly',
            assembly_udpate_type: deleteDialog.type
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (deleteDialog.type.includes('Part')) {
                    setSectionAssemblyParts(sectionAssemblyParts.filter((p) => p.id.toString() != deleteDialog.id.toString()))
                } else if (deleteDialog.type.includes('Boughtout')) {
                    setSectionAssemblyBoughtouts(sectionAssemblyBoughtouts.filter((b) => b.id.toString() != deleteDialog.id.toString()))
                } else if (deleteDialog.type.includes('Sub Assembly')) {
                    setSectionAssemblySub(sectionAssemblySub.filter((b) => b.id.toString() != deleteDialog.id.toString()))
                } else if (deleteDialog.type.includes('Main Assembly')) {
                    setSectionAssemblyMain(sectionAssemblyMain.filter((b) => b.id.toString() != deleteDialog.id.toString()))
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
            assembly_type: 'section_assembly',
            assembly_udpate_type: addDialog.type,
            assembly_type_id: state?.id,
            qty: addDialog.qty
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (addDialog.type.includes('Part')) {
                    setSectionAssemblyParts([...sectionAssemblyParts, {
                        id: res.id,
                        section_assembly_id: state?.id,
                        part_id: addDialog.id,
                        part_name: addDialog.name,
                        qty: addDialog.qty
                    }])
                } else if (addDialog.type.includes('Boughtout')) {
                    setSectionAssemblyBoughtouts([...sectionAssemblyBoughtouts, {
                        id: res.id,
                        section_assembly_id: state?.id,
                        bought_out_id: addDialog.id,
                        bought_out_name: addDialog.name,
                        qty: addDialog.qty
                    }])
                } else if (addDialog.type.includes('Sub Assembly')) {
                    setSectionAssemblySub([...sectionAssemblySub, {
                        id: res.id,
                        section_assembly_id: state?.id,
                        sub_assembly_id: addDialog.id,
                        sub_assembly_name: addDialog.name,
                        qty: addDialog.qty
                    }])
                } else if (addDialog.type.includes('Main Assembly')) {
                    setSectionAssemblyMain([...sectionAssemblyMain, {
                        id: res.id,
                        section_assembly_id: state?.id,
                        main_assembly_id: addDialog.id,
                        main_assembly_name: addDialog.name,
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

    return (
        <Box sx={{ display: 'flex', direction: 'column' }}>
            <SidebarNav currentPage={nav_subassembly} />

            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', ml: 2 }}>
                <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
                    navigate('/subAssembly', {
                        replace: true,
                        state: {
                            from: 'Section'
                        }
                    })
                }}>
                    Back
                </Button>

                <Grid2 container sx={{ mt: 1 }} size={12}>
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

                    <Grid2 size={3} sx={{ ml: 1 }}>
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
                            {errors?.machine_id ? <FormHelperText sx={{ color: errorTextColor }}>{errors?.machine_id}</FormHelperText> : <></>}
                        </FormControl>
                    </Grid2>
                </Grid2>

                <Grid2 container>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyParts.length > 0 && <CTable small striped>
                                <CTableHead color='primary'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell />
                                        <CTableHeaderCell />
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {sectionAssemblyParts.map((part: any) => {
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
                                    // setSectionAssemblyParts([...sectionAssemblyParts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, part_id: "", part_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Part', name: '', id: '', qty: 0 })
                                }}>
                                Add New Part
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyBoughtouts.length > 0 && <CTable small striped>
                                <CTableHead color='success'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {sectionAssemblyBoughtouts.map((boughtout) => {
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
                                    // setSectionAssemblyBoughtouts([...sectionAssemblyBoughtouts, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Boughtout', name: '', id: '', qty: 0 })
                                }}>
                                Add New Boughtout
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblySub.length > 0 && <CTable small striped>
                                <CTableHead color='danger'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {sectionAssemblySub.map((sub) => {
                                        return (<CTableRow>
                                            <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{sub.sub_assembly_name}</CTableDataCell>
                                            <CTableDataCell style={{ width: '20%' }}>{sub.qty}</CTableDataCell>
                                            <CTableDataCell>
                                                <MdOutlineEdit style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'} onClick={() => {
                                                    setUpdateDialog({
                                                        dialog: true, type: 'Sub Assembly', name: sub.sub_assembly_name, id: sub.id.toString(), qty: sub.qty
                                                    })
                                                }} />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <MdDeleteOutline style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'}
                                                    onClick={() => {
                                                        setDeleteDialog({
                                                            dialog: true, type: 'Sub Assembly', name: sub.sub_assembly_name, id: sub.id.toString()
                                                        })
                                                    }} />
                                            </CTableDataCell>
                                        </CTableRow>)
                                    })}
                                </CTableBody>
                            </CTable>}

                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                disabled={!selectedSectionAssembly.machine_id}
                                onClick={() => {
                                    // setSectionAssemblySub([...sectionAssemblySub, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, sub_assembly_id: "", sub_assembly_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Sub Assembly', name: '', id: '', qty: 0 })
                                }}>
                                Add New Sub Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyMain.length > 0 && <CTable small striped>
                                <CTableHead color='danger'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Main Assembly Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {sectionAssemblyMain.map((main) => {
                                        return (<CTableRow>
                                            <CTableDataCell style={{ fontWeight: 'initial', width: '80%' }}>{main.main_assembly_name}</CTableDataCell>
                                            <CTableDataCell style={{ width: '20%' }}>{main.qty}</CTableDataCell>
                                            <CTableDataCell>
                                                <MdOutlineEdit style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'} onClick={() => {
                                                    setUpdateDialog({
                                                        dialog: true, type: 'Main Assembly', name: main.main_assembly_name, id: main.id.toString(), qty: main.qty
                                                    })
                                                }} />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <MdDeleteOutline style={{ cursor: 'pointer', marginLeft: '10px' }} size={'25px'}
                                                    onClick={() => {
                                                        setDeleteDialog({
                                                            dialog: true, type: 'Main Assembly', name: main.main_assembly_name, id: main.id.toString()
                                                        })
                                                    }} />
                                            </CTableDataCell>
                                        </CTableRow>)
                                    })}
                                </CTableBody>
                            </CTable>}

                            <Button variant="contained" startIcon={<Settings />} size="small" sx={{ mt: 1 }}
                                disabled={!selectedSectionAssembly.machine_id}
                                onClick={() => {
                                    // setSectionAssemblyMain([...sectionAssemblyMain, { id: new Date().getTime(), section_assembly_id: selectedSectionAssembly.id, main_assembly_id: "", main_assembly_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Main Assembly', name: '', id: '', qty: 0 })
                                }}>
                                Add New Main Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {sectionAssemblyFileNames.map((file: any) => {
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
                                        const files: any = sectionAssemblyFiles
                                        const chosenFiles = Array.prototype.slice.call(event.target.files)
                                        chosenFiles.map((file) => {
                                            files.push(file)
                                        })

                                        dispatch(createAttachment({
                                            files: chosenFiles, type: 'section_assembly',
                                            type_id: state?.id
                                        })).unwrap()
                                            .then((res: any) => {
                                                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)

                                                setSectionAssemblyFiles(files)
                                                setFileAdded(`${files.length} files added`)

                                                let fileNames = sectionAssemblyFileNames
                                                chosenFiles.map((f: any) => {
                                                    fileNames.push(f.name)
                                                })
                                                setSectionAssemblyFileNames(fileNames)

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
                    <Grid2 size={2}>
                        <Button variant='outlined' color="primary" fullWidth onClick={(e: any) => {
                            navigate(-1)
                        }}>
                            Cancel
                        </Button>
                    </Grid2>
                    <Grid2 size={2}>
                        <Button variant="contained" color="secondary" fullWidth sx={{ ml: 2 }} onClick={(e: any) => {

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
                                    id: sectionAssemblyDetail.attachments.find((f) => f.file_name == deleteDialog.name)?.id,
                                    file_name: deleteDialog.name
                                })).unwrap().then((res: any) => {
                                    DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                    if (res.message.includes('success')) {
                                        setSectionAssemblyFiles(sectionAssemblyFiles.filter((f) => f.name != deleteDialog.name))
                                        setSectionAssemblyFileNames(sectionAssemblyFileNames.filter((f) => f != deleteDialog.name))
                                        setDeleteDialog({
                                            dialog: false, type: '', name: '', id: ''
                                        })
                                    }
                                }).catch((err: any) => {
                                    DisplaySnackbar(err.message, "error", enqueueSnackbar)
                                })
                            } else {
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
                            value={addDialog.id || null}
                            onChange={(e: any) => {
                                console.log("----------", e.target.value)
                                if (addDialog.type.includes('Part')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: parts.list.find((p) => p.id == e.target.value).part_name })
                                } else if (addDialog.type.includes('Boughtout')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: boughtOuts.find((b) => b.id == e.target.value).bought_out_name })
                                } else if (addDialog.type.includes('Sub Assembly')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: machineSubAssemblies.find((b) => b.sub_assembly_id == e.target.value).sub_assembly_name })
                                } else if (addDialog.type.includes('Main Assembly')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: machineMainAssemblies.find((b) => b.id == e.target.value).main_assembly_name })
                                }
                            }}
                        >
                            {addDialog.type.includes('Part') && parts.list.map((part) => {
                                return <MenuItem value={part.id}>{part.part_name}</MenuItem>
                            })}
                            {addDialog.type.includes('Boughtout') && boughtOuts.map((bo) => {
                                return <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
                            })}
                            {addDialog.type.includes('Sub Assembly') && machineSubAssemblies.map((sa) => {
                                return <MenuItem value={sa.sub_assembly_id}>{sa.sub_assembly_name}</MenuItem>
                            })}
                            {addDialog.type.includes('Main Assembly') && machineMainAssemblies.map((ma) => {
                                return <MenuItem value={ma.id}>{ma.main_assembly_name}</MenuItem>
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
