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
import { checkAssemblyName, createMainAssembly, fetchMainAssemblyDetail, fetchSubAssemblByMachine, removeAttachment, updateAssembly } from '../slices/assemblySlice';

export default function EditMainAssembly() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { state } = useLocation()

    const { machines, parts, boughtOuts } = useAppSelector(
        (state) => state.machine
    );

    const { machineSubAssemblies, mainAssemblyDetail } = useAppSelector(
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
        dispatch(fetchSubAssemblByMachine(selectedMainAssembly.machine_id))
    }, [selectedMainAssembly.machine_id])

    useEffect(() => {
        if (state?.id) {
            dispatch(fetchMainAssemblyDetail(state?.id)).unwrap().then((res: any) => {
                setSelectedMainAssembly({ id: res.main_assembly_detail.id, name: res.main_assembly_detail.main_assembly_name, serial_no: res.main_assembly_detail.serial_no, machine_id: res.main_assembly_detail.machine.id })

                const mainParts: any = []
                const mainBoughtouts: any = []
                const mainSub: any = []

                res.main_assembly_detail.main_assembly_detail?.map((detail: any) => {
                    if (detail.part) {
                        mainParts.push({
                            id: detail.id, main_assembly_id: res.main_assembly_detail.id,
                            part_id: detail.part.id, part_name: detail.part.part_name, qty: detail.qty
                        })
                    } else if (detail.bought_out) {
                        mainBoughtouts.push({
                            id: detail.id, main_assembly_id: res.main_assembly_detail.id,
                            bought_out_id: detail.bought_out.id, bought_out_name: detail.bought_out.bought_out_name, qty: detail.qty
                        })
                    } else if (detail.sub_assembly) {
                        mainSub.push({
                            id: detail.id, main_assembly_id: res.main_assembly_detail.id,
                            sub_assembly_id: detail.sub_assembly.id, sub_assembly_name: detail.sub_assembly.sub_assembly_name, qty: detail.qty
                        })
                    }
                })
                setMainAssemblyParts(mainParts)
                setMainAssemblyBoughtouts(mainBoughtouts)
                setMainAssemblySub(mainSub)

                const attachments: any = []
                res.attachments?.map((attachment: any) => {
                    attachments.push(attachment.file_name)
                })
                setMainAssemblyFileNames(attachments)

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

        // if (!selectedMainAssembly.name || selectedMainAssembly.name.length == 0) {
        //     setErrors({ ...errors, name: 'Enter main assembly name' })
        // }
        // if (!selectedMainAssembly.serial_no || selectedMainAssembly.serial_no.length == 0) {
        //     setErrors({ ...errors, serial_no: 'Enter serial no' })
        // }
        // if (!selectedMainAssembly.machine_id || selectedMainAssembly.machine_id.length == 0) {
        //     setErrors({ ...errors, machine: 'Select machine' })
        // }

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
                                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
                                if (res.includes('success')) {
                                    navigate(-1)
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
        // }else{
        //     dispatch(checkAssemblyName({checkName:selectedSubAssembly.name, type:'Sub Assembly'})).unwrap()
        //     .then((res)=>{
        //       if(res == 'Success'){
        //         let sub_assembly: any = {
        //             sub_assembly_name: selectedSubAssembly.name,
        //             serial_no: selectedSubAssembly.serial_no
        //         }
        //         const subAssemblyDetails: any = []
        //         subAssemblyParts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id).map((parts) => {
        //               subAssemblyDetails.push({
        //                 part_id: parts.part_id,
        //                 qty: parts.qty
        //               })
        //             })
        //         subAssemblyBoughtouts.filter((sap) => sap.sub_assembly_id == selectedSubAssembly.id).map((boughtouts) => {
        //               subAssemblyDetails.push({
        //                 bought_out_id: boughtouts.bought_out_id,
        //                 qty: boughtouts.qty
        //               })
        //             })
        //         sub_assembly = {...sub_assembly, sub_assembly_detail: subAssemblyDetails}

        //         const machine_list: any = []
        //         selectedMachines.forEach((m)=>{
        //             machine_list.push(machines.find((f) => m == f.machine_name)?.id)
        //         })
        //         sub_assembly = {...sub_assembly, machine_list: machine_list}

        //         dispatch(createSubAssembly(sub_assembly)).unwrap().then((res)=>{
        //             DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
        //             if(res.includes('success')){
        //                 navigate(-1)
        //             }
        //           }).catch((err)=>{
        //             DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        //           })
        //       }else{
        //         DisplaySnackbar(res, 'error', enqueueSnackbar)
        //       }
        //     })
        // }
    }

    const handleUpdate = () => {
        dispatch(updateAssembly({
            id: updateDialog.id,
            update_type: 'update',
            assembly_type: 'main_assembly',
            assembly_udpate_type: updateDialog.type,
            qty: updateDialog.qty
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (updateDialog.type.includes('Part')) {
                    setMainAssemblyParts(
                        mainAssemblyParts.map((part) => {
                            return (part.id.toString() == updateDialog.id.toString()) ? {
                                id: part.id,
                                main_assembly_id: part.main_assembly_id,
                                part_id: part.part_id,
                                part_name: part.part_name,
                                qty: updateDialog.qty
                            } : part
                        })
                    )
                } else if (updateDialog.type.includes('Boughtout')) {
                    setMainAssemblyBoughtouts(
                        mainAssemblyBoughtouts.map((bo) => {
                            return (bo.id.toString() == updateDialog.id.toString()) ? {
                                id: bo.id,
                                main_assembly_id: bo.main_assembly_id,
                                bought_out_name: bo.bought_out_name,
                                bought_out_id: bo.bought_out_id,
                                qty: updateDialog.qty
                            } : bo
                        })
                    )
                } else if (updateDialog.type.includes('Sub Assembly')) {
                    setMainAssemblySub(
                        mainAssemblySub.map((sub) => {
                            return (sub.id.toString() == updateDialog.id.toString()) ? {
                                id: sub.id,
                                main_assembly_id: sub.main_assembly_id,
                                sub_assembly_name: sub.sub_assembly_name,
                                sub_assembly_id: sub.sub_assembly_id,
                                qty: updateDialog.qty
                            } : sub
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
            assembly_type: 'main_assembly',
            assembly_udpate_type: deleteDialog.type
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (deleteDialog.type.includes('Part')) {
                    setMainAssemblyParts(mainAssemblyParts.filter((p) => p.id.toString() != deleteDialog.id.toString()))
                } else if (deleteDialog.type.includes('Boughtout')) {
                    setMainAssemblyBoughtouts(mainAssemblyBoughtouts.filter((b) => b.id.toString() != deleteDialog.id.toString()))
                } else if (deleteDialog.type.includes('Sub Assembly')) {
                    setMainAssemblySub(mainAssemblySub.filter((s) => s.id.toString() != deleteDialog.id.toString()))
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
            assembly_type: 'main_assembly',
            assembly_udpate_type: addDialog.type,
            assembly_type_id: state?.id,
            qty: addDialog.qty
        })).unwrap().then((res: any) => {
            DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
            if (res.message.includes('success')) {
                if (addDialog.type.includes('Part')) {
                    setMainAssemblyParts([...mainAssemblyParts, {
                        id: res.id,
                        main_assembly_id: state?.id,
                        part_id: addDialog.id,
                        part_name: addDialog.name,
                        qty: addDialog.qty
                    }])
                } else if (addDialog.type.includes('Boughtout')) {
                    setMainAssemblyBoughtouts([...mainAssemblyBoughtouts, {
                        id: res.id,
                        main_assembly_id: state?.id,
                        bought_out_id: addDialog.id,
                        bought_out_name: addDialog.name,
                        qty: addDialog.qty
                    }])
                } else if (addDialog.type.includes('Sub Assembly')) {
                    setMainAssemblySub([...mainAssemblySub, {
                        id: res.id,
                        main_assembly_id: state?.id,
                        sub_assembly_id: addDialog.id,
                        sub_assembly_name: addDialog.name,
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
                            from: 'Main'
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
                            {mainAssemblyParts.length > 0 && <CTable small striped>
                                <CTableHead color='primary'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Part Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell />
                                        <CTableHeaderCell />
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {mainAssemblyParts.map((part: any) => {
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
                                    // setMainAssemblyParts([...mainAssemblyParts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, part_id: "", part_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Part', name: '', id: '', qty: 0 })
                                }}>
                                Add New Part
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblyBoughtouts.length > 0 && <CTable small striped>
                                <CTableHead color='success'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Boughtout Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {mainAssemblyBoughtouts.map((boughtout) => {
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
                                    // setMainAssemblyBoughtouts([...mainAssemblyBoughtouts, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, bought_out_id: "", bought_out_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Boughtout', name: '', id: '', qty: 0 })
                                }}>
                                Add New Boughtout
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblySub.length > 0 && <CTable small striped>
                                <CTableHead color='danger'>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Sub Assembly Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Qty</CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {mainAssemblySub.map((sub) => {
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
                                disabled={!selectedMainAssembly.machine_id}
                                onClick={() => {
                                    // setMainAssemblySub([...mainAssemblySub, { id: new Date().getTime(), main_assembly_id: selectedMainAssembly.id, sub_assembly_id: "", sub_assembly_name: "", qty: 0 }])
                                    setAddDialog({ dialog: true, type: 'Sub Assembly', name: '', id: '', qty: 0 })
                                }}>
                                Add New Sub Assembly
                            </Button>
                        </Card>
                    </Grid2>

                    <Grid2 size={12}>
                        <Card sx={{ padding: 2, mt: 1 }}>
                            {mainAssemblyFileNames.map((file: any) => {
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
                                        const files: any = mainAssemblyFiles
                                        const chosenFiles = Array.prototype.slice.call(event.target.files)
                                        chosenFiles.map((file) => {
                                            files.push(file)
                                        })

                                        dispatch(createAttachment({
                                            files: chosenFiles, type: 'main_assembly',
                                            type_id: state?.id
                                        })).unwrap()
                                            .then((res: any) => {
                                                DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)

                                                setMainAssemblyFiles(files)
                                                setFileAdded(`${files.length} files added`)

                                                let fileNames = mainAssemblyFileNames
                                                chosenFiles.map((f: any) => {
                                                    fileNames.push(f.name)
                                                })
                                                setMainAssemblyFileNames(fileNames)

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
                            if(deleteDialog.type.includes('attachment')){
                                dispatch(removeAttachment({
                                  id: mainAssemblyDetail.attachments.find((f) => f.file_name == deleteDialog.name)?.id,
                                  file_name: deleteDialog.name
                                })).unwrap().then((res: any)=>{
                                  DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                  if (res.message.includes('success')) {
                                    setMainAssemblyFiles(mainAssemblyFiles.filter((f) => f.name != deleteDialog.name))
                                    setMainAssemblyFileNames(mainAssemblyFileNames.filter((f) => f != deleteDialog.name))
                                    setDeleteDialog({
                                      dialog: false, type: '', name: '', id: ''
                                    })
                                  }
                                }).catch((err: any) => {
                                    DisplaySnackbar(err.message, "error", enqueueSnackbar)
                                })
                              }else{
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
                                    setAddDialog({ ...addDialog, id: e.target.value, name: parts.list.find((p) => p.id == e.target.value).part_name })
                                } else if (addDialog.type.includes('Boughtout')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: boughtOuts.find((b) => b.id == e.target.value).bought_out_name })
                                } else if (addDialog.type.includes('Sub Assembly')) {
                                    setAddDialog({ ...addDialog, id: e.target.value, name: machineSubAssemblies.find((b) => b.id == e.target.value).sub_assembly_name })
                                }
                            }}
                        >
                            {addDialog.type.includes('Part') && parts.list.map((part) => {
                                return <MenuItem value={part.id}>{part.part_name}</MenuItem>
                            })}
                            {addDialog.type.includes('Boughtout') && boughtOuts.map((bo) => {
                                return <MenuItem value={bo.id}>{bo.bought_out_name}</MenuItem>
                            })}
                            {addDialog.type.includes('Sub Assembly') && machineSubAssemblies.map((bo) => {
                                return <MenuItem value={bo.id}>{bo.sub_assembly_name}</MenuItem>
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
