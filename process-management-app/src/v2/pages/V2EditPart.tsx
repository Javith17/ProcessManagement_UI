import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { fetchProcessList, fetchVendors } from '../../slices/adminSlice';
import { TextField, Button, Grid2, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, Card, Dialog, List, ListItem, ListItemButton, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import { Add, Save } from '@mui/icons-material';
import { createAttachment, createImage, fetchMachineList, fetchPartDetail, updatePart } from '../../slices/machineSlice';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import { MdOutlineEdit } from 'react-icons/md';
import { MdDeleteOutline } from "react-icons/md";
import { VisuallyHiddenInput } from '../../constants';
import { removeAttachment } from '../../slices/assemblySlice';
import { IoMdCloseCircle } from "react-icons/io";
import { IoEyeSharp } from "react-icons/io5";
import { FcAddImage } from 'react-icons/fc';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import V2Panel from '../components/V2Panel';
import { v2Colors, v2Fonts } from '../theme';

const iconActionSx = {
    width: 26, height: 26, borderRadius: '4px', border: `1px solid ${v2Colors.line}`,
    backgroundColor: v2Colors.surface, color: v2Colors.muted, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

export default function V2EditPart() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { state } = useLocation()

    const { processList, vendors } = useAppSelector(
        (state) => state.admin
    );

    const { partDetail, machines } = useAppSelector(
        (state) => state.machine
    );

    const [partProcess, setPartProcess] = useState<Array<{ part_process_id?: string, id: string, name: string }>>([])
    const [partVendor, setPartVendor] = useState<Array<{ part_vendor_id?: string, process_id: string, vendor_id: string, vendor_name: string, cost: string, delivery_time: number }>>([]);
    const [selectedProcess, setSelectedProcess] = useState("")
    const [selectedProcessName, setSelectedProcessName] = useState("")
    const [selectedProcessPartId, setSelectedProcessPartId] = useState("")
    const [selectedVendor, setSelectedVendor] = useState({
        vendor_id: "",
        vendor_name: "",
        delivery_cost: "",
        delivery_time: 0,
        part_vendor_id: "",
        part_process_id: ""
    })
    const [showProcessDialog, setShowProcessDialog] = useState(false)
    const [showVendorDialog, setShowVendorDialog] = useState(false)
    const [editVendor, setEditVendor] = useState(false)
    const [showMachineDialog, setMachineDialog] = useState(false)
    const [removeMachineDialog, setRemoveMachineDialog] = useState({
        dialog: false,
        machineId: '',
        machineName: ''
    })

    const [deleteDialog, setDeleteDialog] = useState({
        dialog: false,
        type: '',
        name: '',
        id: ''
    })

    const [formData, setFormData] = useState({
        name: '',
        part_code: '',
        minimum_stock_qty: '',
        available_qty: '',
        category: ''
    });
    const [errors, setErrors] = useState<any>();

    const [partFiles, setPartFiles] = useState<Array<any>>([])
    const [partFileNames, setPartFileNames] = useState<Array<string>>([])
    const [fileAdded, setFileAdded] = useState("")
    const [selectedType, setSelectedType] = useState<Array<any>>([])
    const [selectedMachines, setSelectedMachines] = useState<Array<any>>([])
    const [partImage, setPartImage] = useState<any>()
    const [partImageName, setPartImageName] = useState<string>()

    const handleMultiProcessChange = (event: SelectChangeEvent<typeof selectedType>) => {
        // const {
        //   target: { value },
        // } = event;
        // setFormData({ ...formData, category: event.target.name == 'isMachine' ? 'machine' : event.target.name == 'isSpares' ? 'spare' : 'spm' });
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
        dispatch(fetchProcessList()).unwrap()
        dispatch(fetchMachineList())
    }, [dispatch])

    useEffect(() => {
        if (state?.id) {
            dispatch(fetchPartDetail(state?.id)).unwrap()
                .then((res: any) => {
                    setPartImageName(res.part_detail.image)
                    setFormData({
                        name: res.part_detail.part_name,
                        part_code: res.part_detail.part_code,
                        minimum_stock_qty: res.part_detail.minimum_stock_qty,
                        available_qty: res.part_detail.available_aty,
                        category: ''
                    })

                    const processList: any = []
                    const processVendors: any = []
                    const typeList: any = []
                    const machineList: any = []

                    if (res.part_detail.is_spm) typeList.push('SPM')
                    if (res.part_detail.is_spare) typeList.push('Spares')
                    if (res.part_detail.is_machine) typeList.push('Machine')

                    setSelectedType(typeList)

                    res.machines?.map((machine: any) => {
                        machineList.push(machine.machine.machine_name)
                    })
                    setSelectedMachines(machineList)

                    res.part_detail.part_process_list?.map((process: any) => {
                        processList.push({
                            part_process_id: process.id,
                            id: process.process.id,
                            name: process.process.process_name
                        })
                        process.part_process_vendor_list?.map((vendor: any) => {
                            processVendors.push({
                                part_vendor_id: vendor.id,
                                process_id: process.process.id,
                                vendor_id: vendor.vendor.id,
                                vendor_name: vendor.vendor.vendor_name,
                                cost: vendor.part_process_vendor_price,
                                delivery_time: vendor.part_process_vendor_delivery_time
                            }
                            )
                        })
                    })
                    setPartProcess(processList)
                    setPartVendor(processVendors)

                    const attachments: any = []
                    res.attachments?.map((attachment: any) => {
                        attachments.push(attachment.file_name)
                    })
                    setPartFileNames(attachments)
                })
        }
    }, [state])

    const validate = () => {
        const newErrors: any = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.minimum_stock_qty) newErrors.minimum_stock_qty = 'Minimum stock quantity required';
        if (!formData.available_qty) newErrors.available_qty = 'Available quantity is required';

        return newErrors;
    };

    const handleSubmit = (e: any) => {

        const validationErrors = validate();

        if (Object.keys(validationErrors).length === 0) {
            if (selectedType.length == 0) {
                DisplaySnackbar('Category is required', 'error', enqueueSnackbar)
            } else if (selectedMachines.length == 0) {
                DisplaySnackbar('Machine is required', 'error', enqueueSnackbar)
            } else {
                let vendorCheck = partProcess.filter((p) => !partVendor.some((v) => p.id == v.process_id))
                if (vendorCheck.length > 0) {
                    DisplaySnackbar('Vendor is required for Process', 'error', enqueueSnackbar)
                } else {
                    dispatch(updatePart({
                        update_type: 'edit',
                        update_type_entity: 'part_detail',
                        part_id: state?.id,
                        part_name: formData.name,
                        part_code: formData.part_code,
                        available_qty: formData.available_qty,
                        minimum_stock_qty: formData.minimum_stock_qty,
                        is_machine: selectedType.includes('Machine'),
                        is_spare: selectedType.includes('Spares'),
                        is_spm: selectedType.includes('SPM'),
                        machines: selectedMachines.map((machine: any) => machines.find((m: any) => m.machine_name == machine).id)
                    })).unwrap().then((res) => {
                        DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
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
                dispatch(updatePart({
                    update_type: 'edit',
                    update_type_entity: 'process_vendor',
                    id: selectedVendor.part_vendor_id,
                    cost: selectedVendor.delivery_cost,
                    delivery_time: selectedVendor.delivery_time,
                    part_id: state?.id
                })).unwrap().then((res: any) => {
                    DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                    if (res.message.includes('success')) {
                        setShowProcessDialog(false)
                        setPartVendor(
                            partVendor.map((vendors) => {
                                return (vendors.vendor_id == selectedVendor.vendor_id && vendors.process_id == selectedProcess) ? {
                                    part_vendor_id: selectedVendor.part_vendor_id,
                                    process_id: selectedProcess,
                                    vendor_id: selectedVendor.vendor_id,
                                    vendor_name: selectedVendor.vendor_name,
                                    cost: selectedVendor.delivery_cost,
                                    delivery_time: selectedVendor.delivery_time
                                } : vendors
                            })
                        )
                        setEditVendor(false)
                    }
                }).catch((err: any) => {
                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                })
            } else {
                dispatch(updatePart({
                    update_type: 'add',
                    update_type_entity: 'process_vendor',
                    id: selectedVendor.part_process_id,
                    vendor_id: selectedVendor.vendor_id,
                    cost: selectedVendor.delivery_cost,
                    delivery_time: selectedVendor.delivery_time,
                    part_id: state?.id
                })).unwrap().then((res: any) => {
                    DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                    if (res.message.includes('success')) {
                        setShowProcessDialog(false)
                        setPartVendor([...partVendor, {
                            part_vendor_id: res.id,
                            process_id: selectedProcess,
                            vendor_id: selectedVendor.vendor_id,
                            vendor_name: selectedVendor.vendor_name,
                            cost: selectedVendor.delivery_cost,
                            delivery_time: selectedVendor.delivery_time
                        }])
                    }
                }).catch((err: any) => {
                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                })
            }
            setShowVendorDialog(false)
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
            setPartImage(file)
            setPartImageName(file.name)

            dispatch(createImage({
                files: [file], type: 'part', type_id: state?.id, image_name: file.name
            }))
        }
    };

    return (
        <V2PageShell currentPage="parts">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, pb: 2, mb: 3, borderBottom: `2px solid ${v2Colors.ink}` }}>
                <Box>
                    <Typography sx={{ fontSize: '11px', letterSpacing: '.09em', textTransform: 'uppercase', color: v2Colors.faint, fontWeight: 600, mb: 0.5 }}>Part → Parts</Typography>
                    <Typography variant="h4" sx={{ fontSize: '25px' }}>Edit Part</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={(e: any) => handleSubmit(e)}>Save Part</Button>
                </Box>
            </Box>

            <V2Panel title="Basic Details">
                <Grid2 container spacing={3} alignItems="center">
                    <Grid2 size="auto">
                        <Card sx={{ borderRadius: '50%', height: '96px', width: '96px', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '96px', width: '96px', cursor: 'pointer', backgroundColor: v2Colors.surface2 }}
                                onClick={handleCardClick}>
                                {partImage ? <img src={URL.createObjectURL(partImage)} style={{ height: '96px', width: '96px', objectFit: 'cover' }}
                                /> : partImageName ? <img src={`${process.env.REACT_APP_API_URL}/machine/loadImage/${partImageName}`} style={{ height: '96px', width: '96px', objectFit: 'cover' }}
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
                    </Grid2>
                    <Grid2 size="grow">
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
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
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    size='small'
                                    variant="outlined"
                                    fullWidth
                                    label="Part Code"
                                    name="part_code"
                                    value={formData.part_code}
                                    onChange={handleChange}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
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
                            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
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
                        </Grid2>
                    </Grid2>
                </Grid2>

                <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: v2Colors.muted, mb: 1 }}>Type</Typography>
                    <FormControl sx={{ minWidth: 280 }}>
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

            <V2Panel title="Process & Vendor Mapping" caption="Every process needs at least one vendor">
                <Grid2 container spacing={2} alignItems="flex-start">
                    <Grid2 size={{ xs: 12, md: 5 }}>
                        <Box sx={{ border: `1px solid ${v2Colors.line}`, borderRadius: '8px', overflow: 'hidden' }}>
                            <Box sx={{
                                padding: '12px 16px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: v2Colors.secondaryTint, color: v2Colors.secondary,
                            }}>
                                <span>Process</span>
                                <span style={{ fontSize: '11px', fontWeight: 600 }}>{partProcess.length} added</span>
                            </Box>
                            <Box sx={{ padding: '12px', minHeight: '220px', backgroundColor: v2Colors.surface }}>
                                {partProcess.map((process: any) => {
                                    const selected = process.name == selectedProcessName
                                    return <Box key={process.id} onClick={() => {
                                        setSelectedProcess(process.id)
                                        setSelectedProcessName(process.name)
                                        setSelectedProcessPartId(process.part_process_id)
                                    }} sx={{
                                        padding: '10px 12px', border: `1px solid ${selected ? v2Colors.secondary : v2Colors.line}`, borderRadius: '4px', mb: 1, cursor: 'pointer',
                                        fontSize: '13.5px', fontWeight: 600, backgroundColor: selected ? v2Colors.secondary : v2Colors.surface,
                                        color: selected ? '#fff' : v2Colors.ink, '&:hover': { borderColor: v2Colors.secondary },
                                    }}>
                                        {process.name}
                                    </Box>
                                })}
                            </Box>
                            <Box sx={{ padding: '0 12px 12px' }}>
                                <Button variant="outlined" size="small" fullWidth startIcon={<Add />}
                                    onClick={() => {
                                        setShowProcessDialog(true)
                                    }}>
                                    Add Process
                                </Button>
                            </Box>
                        </Box>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 7 }}>
                        <Box sx={{ border: `1px solid ${v2Colors.line}`, borderRadius: '8px', overflow: 'hidden' }}>
                            <Box sx={{
                                padding: '12px 16px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: v2Colors.primaryTint, color: v2Colors.primary,
                            }}>
                                <span>{selectedProcessName ? `Vendors — ${selectedProcessName}` : 'Vendors'}</span>
                            </Box>
                            <Box sx={{ padding: '12px', minHeight: '220px', backgroundColor: v2Colors.surface }}>
                                {selectedProcess.length == 0 ? (
                                    <Box sx={{ textAlign: 'center', color: v2Colors.muted, fontSize: '13px', padding: '40px 10px' }}>
                                        Select a process on the left to view or add vendors
                                    </Box>
                                ) : partVendor.filter((pv: any) => pv.process_id == selectedProcess)?.map((vendor: any) => (
                                    <Box key={vendor.vendor_id} sx={{ border: `1px solid ${v2Colors.line}`, borderRadius: '4px', mb: 1.25, overflow: 'hidden' }}>
                                        <Box sx={{ padding: '9px 12px', fontSize: '13px', fontWeight: 700, borderBottom: `1px dashed ${v2Colors.line}` }}>
                                            {vendor.vendor_name}
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', fontSize: '13px', borderBottom: `1px dashed ${v2Colors.line}` }}>
                                            <span style={{ color: v2Colors.muted }}>Cost</span>
                                            <span style={{ fontWeight: 600, fontFamily: v2Fonts.mono }}>₹{vendor.cost}</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', fontSize: '13px' }}>
                                            <span style={{ color: v2Colors.muted }}>Delivery</span>
                                            <span style={{ fontWeight: 600, fontFamily: v2Fonts.mono }}>{vendor.delivery_time} Days</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, padding: '7px 10px', backgroundColor: v2Colors.surface2 }}>
                                            <Box component="button" type="button" sx={iconActionSx} onClick={() => {
                                                setEditVendor(true)
                                                setShowVendorDialog(true)
                                                setSelectedVendor({
                                                    part_vendor_id: vendor.part_vendor_id,
                                                    vendor_id: vendor.vendor_id,
                                                    vendor_name: vendor.vendor_name,
                                                    delivery_cost: vendor.cost,
                                                    delivery_time: vendor.delivery_time,
                                                    part_process_id: selectedProcessPartId
                                                })
                                                setErrors({})
                                            }}>
                                                <MdOutlineEdit />
                                            </Box>
                                            <Box component="button" type="button" sx={iconActionSx} onClick={() => {
                                                setDeleteDialog({ id: vendor.part_vendor_id, type: 'Vendor', name: vendor.vendor_name, dialog: true })
                                            }}>
                                                <MdDeleteOutline />
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {selectedProcess.length > 0 && <Box sx={{ padding: '0 12px 12px' }}>
                                <Button variant="outlined" size="small" fullWidth color='primary' startIcon={<Add />}
                                    onClick={() => {
                                        setEditVendor(false)
                                        setShowVendorDialog(true)
                                        dispatch(fetchVendors({ searchText: selectedProcessName }))
                                        setSelectedVendor({
                                            part_vendor_id: '',
                                            vendor_id: "",
                                            vendor_name: "",
                                            delivery_cost: "",
                                            delivery_time: 0,
                                            part_process_id: selectedProcessPartId
                                        })
                                        setErrors({})
                                    }}>
                                    Add New Vendor
                                </Button>
                            </Box>}
                        </Box>
                    </Grid2>
                </Grid2>
                <Typography sx={{ fontSize: '11.5px', color: v2Colors.faint, mt: 1.5 }}>
                    Select a process on the left to view or add the vendors mapped to it. A part can have several processes, and each process can have several vendors with its own cost and delivery time.
                </Typography>
            </V2Panel>

            <V2Panel title="Attachments">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: partFileNames.length ? 1.5 : 0 }}>
                    {partFileNames.map((map: any) => (
                        <Box key={map} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: v2Colors.surface2,
                            border: `1px solid ${v2Colors.line}`, borderRadius: '20px', padding: '4px 6px 4px 12px',
                            fontSize: '13px', fontWeight: 600,
                        }}>
                            {map}
                            <Box component="button" type="button" onClick={() => {
                                window.open(`${process.env.REACT_APP_API_URL}/machine/loadAttachment/${map}`, '_blank')
                            }} sx={{ border: 0, background: 'none', cursor: 'pointer', color: v2Colors.info, display: 'flex', alignItems: 'center', p: 0 }}>
                                <IoEyeSharp size={16} />
                            </Box>
                            <Box component="button" type="button" onClick={() => {
                                setDeleteDialog({
                                    dialog: true,
                                    type: 'attachment',
                                    name: map,
                                    id: ''
                                })
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
                            const files: any = partFiles
                            const chosenFiles = Array.prototype.slice.call(event.target.files)
                            chosenFiles.map((file) => {
                                files.push(file)
                            })

                            dispatch(createAttachment({
                                files: chosenFiles, type: 'part',
                                type_id: state?.id
                            })).unwrap()
                                .then((res: any) => {
                                    DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)

                                    setPartFiles(files)
                                    setFileAdded(`${files.length} files added`)

                                    let fileNames = partFileNames
                                    chosenFiles.map((f: any) => {
                                        fileNames.push(f.name)
                                    })
                                    setPartFileNames(fileNames)

                                })
                                .catch((err: any) => {
                                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                })
                        }}
                        multiple
                    />
                </Button>
            </V2Panel>

            {/* Process Drawer */}

            <V2Drawer
                open={showProcessDialog}
                onClose={() => setShowProcessDialog(false)}
                title="Select Process"
                actions={<Button variant='text' onClick={() => {
                    setShowProcessDialog(false)
                }} sx={{ color: v2Colors.primary }}>Cancel</Button>}
            >
                    <List sx={{ bgcolor: 'background.paper' }}>
                        {processList.list.map((value) => {
                            if (partProcess.filter((f) => f.id == value.id).length == 0) {
                                const labelId = `checkbox-list-label-${value.id}`;
                                return (
                                    <ListItem
                                        key={value}
                                        disablePadding
                                        onClick={() => {
                                            dispatch(updatePart({
                                                update_type: 'add',
                                                update_type_entity: 'part_process',
                                                id: state?.id,
                                                process_id: value.id
                                            })).unwrap().then((res: any) => {
                                                DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                                                if (res.message.includes('success')) {
                                                    setShowProcessDialog(false)
                                                    setPartProcess([...partProcess, {
                                                        part_process_id: res.id,
                                                        id: value.id,
                                                        name: value.process_name
                                                    }])
                                                }
                                            }).catch((err: any) => {
                                                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                            })
                                        }}>
                                        <ListItemButton role={undefined} dense>
                                            <ListItemText id={labelId} primary={value.process_name} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            }
                        })}
                    </List>
            </V2Drawer>

            {/* Vendor Drawer */}

            <V2Drawer
                open={showVendorDialog}
                onClose={() => setShowVendorDialog(false)}
                title={`Add Vendor for ${selectedProcessName}`}
                actions={<>
                    <Button variant='text' onClick={() => {
                        setShowVendorDialog(false)
                        setEditVendor(false)
                    }} sx={{ color: v2Colors.primary }}>Cancel</Button>
                    <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
                        onClick={() => {
                            handleVendorSubmit()
                        }}>
                        Save
                    </Button>
                </>}
            >
                    <FormControl fullWidth
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
                                const vendor_process = vendor.process_list?.filter((p: any) => p.process_id == selectedProcess)
                                const existing_vendor = partVendor.filter((v: any) => v.vendor_id == vendor.id && v.process_id == selectedProcess)
                                if (existing_vendor.length == 0) {
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
                        sx={{ mt: 2 }}
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
                        sx={{ mt: 2 }}
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
            </V2Drawer>

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
                    }} sx={{ color: v2Colors.primary }}>No</Button>
                    <Button variant="contained" startIcon={<MdDeleteOutline />} size="small" color='secondary'
                        onClick={() => {
                            if (deleteDialog.type.includes('attachment')) {
                                dispatch(removeAttachment({
                                    id: partDetail.attachments.find((f) => f.file_name == deleteDialog.name)?.id,
                                    file_name: deleteDialog.name
                                })).unwrap().then((res: any) => {
                                    DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                    if (res.message.includes('success')) {
                                        setPartFiles(partFiles.filter((f) => f.name != deleteDialog.name))
                                        setPartFileNames(partFileNames.filter((f) => f != deleteDialog.name))
                                        setDeleteDialog({
                                            dialog: false, type: '', name: '', id: ''
                                        })
                                    }
                                }).catch((err: any) => {
                                    DisplaySnackbar(err.message, "error", enqueueSnackbar)
                                })
                            } else {
                                dispatch(updatePart({
                                    update_type: 'delete',
                                    update_type_entity: 'process_vendor',
                                    id: deleteDialog.id,
                                    part_id: state?.id
                                })).unwrap().then((res: any) => {
                                    DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                                    if (res.message.includes('success')) {
                                        setDeleteDialog({ id: '', dialog: false, name: '', type: '' })
                                        setPartVendor(partVendor.filter((pv: any) => pv.part_vendor_id != deleteDialog.id))
                                    }
                                }).catch((err: any) => {
                                    DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                })
                            }
                        }}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

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
                                            setMachineDialog(false)
                                            dispatch(updatePart({
                                                update_type: 'edit',
                                                update_type_entity: 'part_machine_add',
                                                part_id: state?.id,
                                                id: value.id
                                            })).unwrap().then((res) => {
                                                DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                                                setSelectedMachines([...selectedMachines, value.machine_name])
                                            }).catch((err) => {
                                                DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                            })
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
                        dispatch(updatePart({
                            update_type: 'edit',
                            update_type_entity: 'part_machine_delete',
                            part_id: state?.id,
                            id: removeMachineDialog.machineId
                        })).unwrap().then((res) => {
                            DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                            setRemoveMachineDialog({
                                dialog: false,
                                machineId: '',
                                machineName: ''
                            })
                            setSelectedMachines(selectedMachines.filter((mac: any) => mac != removeMachineDialog.machineName))
                        }).catch((err) => {
                            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                        })
                    }} sx={{ color: v2Colors.primary }}>Yes</Button>
                </DialogActions>
            </Dialog>
        </V2PageShell>
    );
}
