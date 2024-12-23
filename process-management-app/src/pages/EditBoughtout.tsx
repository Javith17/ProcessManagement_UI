import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createVendor, fetchProcessList, fetchSuppliers, fetchVendors } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, FormGroup, FormControlLabel, FormHelperText, Card, CardActions, Dialog, List, ListItem, ListItemButton, ListItemIcon, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { Add, ArrowBackIos, Done, Save, Settings, Store } from '@mui/icons-material';
import { Table } from 'react-bootstrap';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { createAttachment, createBoughtout, createPart, fetchBoughtoutDetail, updateBoughtout } from '../slices/machineSlice';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { MdOutlineEdit } from 'react-icons/md';
import { MdDeleteOutline } from "react-icons/md";
import { BsPersonFillAdd } from "react-icons/bs";
import { nav_boughtouts, VisuallyHiddenInput } from '../constants';
import { removeAttachment } from '../slices/assemblySlice';

export default function EditBoughtout() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { state } = useLocation()

    const { suppliers } = useAppSelector(
        (state) => state.admin
    );

    const { boughtoutDetail } = useAppSelector(
        (state) => state.machine
    );

    const [boughoutSupplier, setBoughtoutSupplier] = useState<Array<{ id?: string, supplier_id: string, supplier_name: string, cost: string, delivery_time: string }>>([]);
    const [selectedSupplier, setSelectedSupplier] = useState({
        id: "",
        supplier_id: "",
        supplier_name: "",
        delivery_cost: "",
        delivery_time: ""
    })
    const [showSupplierDialog, setShowSupplierDialog] = useState(false)
    const [editSupplier, setEditSupplier] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        category: ''
    });
    const [errors, setErrors] = useState<any>();

    const [boughtoutFiles, setBoughtoutFiles] = useState<Array<any>>([])
    const [boughtoutFileNames, setBoughtoutFileNames] = useState<Array<string>>([])
    const [fileAdded, setFileAdded] = useState("")

    const [deleteDialog, setDeleteDialog] = useState({
        dialog: false,
        type: '',
        name: '',
        id: ''
    })

    useEffect(() => {
        if (state?.id) {
            dispatch(fetchBoughtoutDetail(state?.id)).unwrap()
                .then((res: any) => {
                    setFormData({
                        name: res.boughtout_detail.bought_out_name,
                        category: res.boughtout_detail.bought_out_category
                    })
                    const bos: any = []
                    res.boughtout_detail.bought_out_suppliers.map((bo: any) => {
                        bos.push({
                            id: bo.id,
                            supplier_id: bo.supplier.id,
                            supplier_name: bo.supplier.supplier_name,
                            cost: bo.cost,
                            delivery_time: bo.delivery_time
                        })
                    })
                    setBoughtoutSupplier(bos)

                    const attachments: any = []
                    res.attachments?.map((attachment: any) => {
                        attachments.push(attachment.file_name)
                    })
                    setBoughtoutFileNames(attachments)
                })
        }
    }, [state])

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
        dispatch(fetchSuppliers()).unwrap()
    }, [dispatch])

    const handleSupplierSubmit = () => {
        const newErrors: any = {}
        if (!selectedSupplier.supplier_name) newErrors.vendor_name = 'Select supplier'
        if (!selectedSupplier.delivery_cost) newErrors.delivery_cost = 'Enter delivery cost'
        if (!selectedSupplier.delivery_time) newErrors.delivery_time = 'Enter delivery time'

        if (Object.keys(newErrors).length == 0) {
            if (editSupplier) {
                dispatch(updateBoughtout({
                    boughtout_id: state?.id,
                    id: selectedSupplier.id,
                    update_type: 'edit',
                    update_type_entity: 'boughtout_supplier',
                    cost: selectedSupplier.delivery_cost,
                    delivery_time: selectedSupplier.delivery_time
                })).unwrap().then((res: any) => {
                    if (res.message.includes('success')) {
                        setBoughtoutSupplier(
                            boughoutSupplier.map((supplier) => {
                                return (supplier.id == selectedSupplier.id) ? {
                                    id: selectedSupplier.id,
                                    supplier_id: selectedSupplier.supplier_id,
                                    supplier_name: selectedSupplier.supplier_name,
                                    cost: selectedSupplier.delivery_cost,
                                    delivery_time: selectedSupplier.delivery_time
                                } : supplier
                            })
                        )
                        setEditSupplier(false)
                        setSelectedSupplier({ id: "", supplier_id: "", supplier_name: "", delivery_cost: "", delivery_time: "" })
                        DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                    } else {
                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                    }
                })
            } else {
                dispatch(updateBoughtout({
                    boughtout_id: state?.id,
                    id: selectedSupplier.supplier_id,
                    update_type: 'add',
                    update_type_entity: 'boughtout_supplier',
                    cost: selectedSupplier.delivery_cost,
                    delivery_time: selectedSupplier.delivery_time
                })).unwrap().then((res: any) => {
                    if (res.message.includes('success')) {
                        setBoughtoutSupplier([...boughoutSupplier, {
                            id: res.id,
                            supplier_id: selectedSupplier.supplier_id,
                            supplier_name: selectedSupplier.supplier_name,
                            cost: selectedSupplier.delivery_cost,
                            delivery_time: selectedSupplier.delivery_time
                        }])
                        setSelectedSupplier({ id: "", supplier_id: "", supplier_name: "", delivery_cost: "", delivery_time: "" })
                        DisplaySnackbar(res.message, 'success', enqueueSnackbar)
                    } else {
                        DisplaySnackbar(res.message, 'error', enqueueSnackbar)
                    }
                })
            }
            setShowSupplierDialog(false)
        } else {
            setErrors(newErrors)
        }
    }

    return (
        <Box sx={{ display: 'flex', direction: 'row', ml: 2, mr: 4 }}>
            <SidebarNav currentPage={nav_boughtouts} />
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', }}>
                <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
                    navigate(-1)
                }}>
                    Back
                </Button>
                <form noValidate>
                    <Grid2 container spacing={4} sx={{ mt: 1 }}>
                        <Grid2 size={4} style={{ paddingLeft: 0, paddingRight: 0 }}>
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
                        <Grid2 size={6}>
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
                        <Grid2 size={2} style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <div style={{ width: '180px' }}></div>
                        </Grid2>
                    </Grid2>
                </form>
                {boughoutSupplier.length > 0 &&
                    <CTable small striped style={{ marginTop: '5px' }}>
                        <CTableHead color='danger'>
                            <CTableRow>
                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Supplier Name</CTableHeaderCell>
                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Cost</CTableHeaderCell>
                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}>Time</CTableHeaderCell>
                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}></CTableHeaderCell>
                                <CTableHeaderCell scope='col' style={{ fontWeight: 'initial' }}></CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {boughoutSupplier.map((supplier: any) => {
                                return <CTableRow>
                                    <CTableDataCell style={{ fontWeight: 'initial' }}>{supplier.supplier_name}</CTableDataCell>
                                    <CTableDataCell>{supplier.cost}</CTableDataCell>
                                    <CTableDataCell>{supplier.delivery_time}</CTableDataCell>
                                    <CTableDataCell><MdOutlineEdit style={{ cursor: 'pointer' }} onClick={() => {
                                        setEditSupplier(true)
                                        setShowSupplierDialog(true)
                                        setSelectedSupplier({
                                            id: supplier.id,
                                            supplier_id: supplier.supplier_id,
                                            supplier_name: supplier.supplier_name,
                                            delivery_cost: supplier.cost,
                                            delivery_time: supplier.delivery_time
                                        })
                                        setErrors({})
                                    }} /></CTableDataCell>
                                    <CTableDataCell><MdDeleteOutline style={{ cursor: 'pointer' }} onClick={() => {
                                        // setBoughtoutSupplier(boughoutSupplier.filter((b) => b.supplier_id !== supplier.supplier_id))
                                        setDeleteDialog({
                                            id: supplier.id,
                                            name: supplier.supplier_name,
                                            type: 'Supplier',
                                            dialog: true
                                        })
                                    }} /></CTableDataCell>
                                </CTableRow>
                            })}
                        </CTableBody>
                    </CTable>}
                <Button variant="contained" startIcon={<BsPersonFillAdd />} size="small" sx={{ mt: 1 }}
                    onClick={() => {
                        setShowSupplierDialog(true)
                    }}>
                    Add New Supplier
                </Button>

                <Card sx={{ padding: 2, mt: 2 }}>
                    {boughtoutFileNames.map((file: any) => {
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
                                const files: any = boughtoutFiles
                                const chosenFiles = Array.prototype.slice.call(event.target.files)
                                chosenFiles.map((file) => {
                                    files.push(file)
                                })

                                dispatch(createAttachment({
                                    files: chosenFiles, type: 'boughtout',
                                    type_id: state?.id
                                })).unwrap()
                                    .then((res: any) => {
                                        DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)

                                        setBoughtoutFiles(files)
                                        setFileAdded(`${files.length} files added`)

                                        let fileNames = boughtoutFileNames
                                        chosenFiles.map((f: any) => {
                                            fileNames.push(f.name)
                                        })
                                        setBoughtoutFileNames(fileNames)

                                    })
                                    .catch((err: any) => {
                                        DisplaySnackbar(err.message, 'error', enqueueSnackbar)
                                    })
                            }}
                            multiple
                        />
                    </Button>
                </Card>

                {/* <Grid2 size={12} container justifyContent={'flex-end'} sx={{ mt: 2 }}>
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
                </Grid2> */}
            </Box>

            {/* Supplier Dialog */}

            <Dialog
                maxWidth={'md'}
                open={showSupplierDialog}>
                <DialogTitle>{!editSupplier ? 'Add Supplier' : 'Edit Supplier'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal"
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

                    <TextField
                        size={'small'}
                        fullWidth
                        required
                        id="email"
                        label="Cost"
                        name="email"
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
                        sx={{ mt: 1 }}
                        id="email"
                        label="Delivery Time"
                        name="email"
                        error={!!errors?.delivery_time}
                        helperText={errors?.delivery_time}
                        value={selectedSupplier.delivery_time}
                        onChange={(e) => {
                            setSelectedSupplier({ ...selectedSupplier, delivery_time: e.target.value })
                        }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowSupplierDialog(false)
                        setEditSupplier(false)
                    }} sx={{ color: '#bb0037' }}>Cancel</Button>
                    <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
                        onClick={() => {
                            handleSupplierSubmit()
                        }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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
                                    id: boughtoutDetail.attachments.find((f) => f.file_name == deleteDialog.name)?.id,
                                    file_name: deleteDialog.name
                                })).unwrap().then((res: any) => {
                                    DisplaySnackbar(res.message, res.message.includes('success') ? "success" : "error", enqueueSnackbar)
                                    if (res.message.includes('success')) {
                                        setBoughtoutFiles(boughtoutFiles.filter((f) => f.name != deleteDialog.name))
                                        setBoughtoutFileNames(boughtoutFileNames.filter((f) => f != deleteDialog.name))
                                        setDeleteDialog({
                                            dialog: false, type: '', name: '', id: ''
                                        })
                                    }
                                }).catch((err: any) => {
                                    DisplaySnackbar(err.message, "error", enqueueSnackbar)
                                })
                            } else {
                                dispatch(updateBoughtout({
                                    update_type: 'delete',
                                    update_type_entity: 'boughtout_supplier',
                                    id: deleteDialog.id,
                                    boughtout_id: state?.id
                                })).unwrap().then((res: any) => {
                                    DisplaySnackbar(res.message, res.message.includes('success') ? 'success' : 'error', enqueueSnackbar)
                                    if (res.message.includes('success')) {
                                        setDeleteDialog({ id: '', dialog: false, name: '', type: '' })
                                        setBoughtoutSupplier(boughoutSupplier.filter((bs: any) => bs.id != deleteDialog.id))
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

        </Box>
    );
}
