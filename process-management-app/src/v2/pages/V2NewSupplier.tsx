import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useEffect } from 'react';
import { createSupplier, fetchSupplierBOs, fetchSupplierDetail, fetchSupplierHistory, updateSupplier } from '../../slices/adminSlice';
import { TextField, Button, Grid2, Box, Dialog, CircularProgress, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Paper, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Add, ArrowBackIos, Save } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../../utils/DisplaySnackbar';
import Autocomplete from '@mui/material/Autocomplete';
import { fetchBoughtOutList, updateBoughtoutS } from '../../slices/machineSlice';
import V2PageShell from '../components/V2PageShell';
import V2Drawer from '../components/V2Drawer';
import { V2TableRowStyled } from '../components/v2Table';
import { v2Colors } from '../theme';

// Functional port of pages/NewSupplier.tsx. Known bugs reproduced verbatim:
// - validate() assigns the "GST No is required" error to newErrors.ifsc
//   instead of newErrors.gst, so it renders under the IFSC field.
// - The "Supplier Boughtouts" table's Pagination count is copy-pasted from
//   supplierHistory (Math.ceil(supplierHistory?.count / 10)), not a
//   boughtout-specific count, and its onChange re-dispatches
//   fetchSupplierHistory (the wrong slice's data) instead of paginating the
//   boughtout list.
// - The Cost and Delivery Time TextFields in the Add Boughtout dialog both
//   have id/name="email" (copy-paste leftover).
// - Add Boughtout dialog's Cancel only resets {dialog:false}, leaving stale
//   bo_id/cost/delivery_time for the next open.
// - Add Boughtout's failure branch calls DisplaySnackbar(..., 'success', ...)
//   instead of 'error' — a real bug, kept exactly.
export default function V2NewSupplier() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()
  const [supplierHistory, setSupplierHistory] = useState<any>()

  const [formData, setFormData] = useState({
    name: '',
    contactNo1: '',
    contactNo2: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    location: '',
    accountNo: '',
    bankName: '',
    ifsc: '',
    gst: ''
  });
  const [errors, setErrors] = useState<any>();
  const [loadingDialog, setLoadingDialog] = useState(false)
  const [supplierBOList, setSupplierBOList] = useState<any[]>([])
  const [BOList, setBOList] = useState<any[]>([])
  const [addBoData, setAddBoData] = useState<any>({
    dialog: false,
    bo_id: '',
    bo_name: '',
    cost: 0,
    delivery_time: ''
  })
  const [boOpen, setBoOpen] = useState(false)

  const { status } = useAppSelector(
    (state) => state.admin
  );

  const { machineStatus } = useAppSelector(
    (state) => state.machine
  );

  const handleBoughoutSearch = (value: string) => {
    if (value.length > 2) {
      dispatch(fetchBoughtOutList({ searchText: value, type: 'map', type_id: state?.supplier_id })).unwrap().then((res: any) => {
        setBOList(res)
      })
    }
  }

  const handleAddBoughtout = () => {
    if (addBoData.bo_id?.length == 0) {
      DisplaySnackbar('Select Boughtout', 'error', enqueueSnackbar)
    } else if (addBoData.cost?.toString().length == 0 || addBoData.cost == 0) {
      DisplaySnackbar('Add cost', 'error', enqueueSnackbar)
    } else if (addBoData.delivery_time?.toString().length == 0) {
      DisplaySnackbar('Add Delivery time', 'error', enqueueSnackbar)
    } else {
      console.log({
        boughtout_id: addBoData?.bo_id,
        id: state?.supplier_id,
        update_type: 'edit',
        update_type_entity: 'boughtout_supplier',
        cost: addBoData.cost,
        delivery_time: addBoData.delivery_time
      })
      dispatch(updateBoughtoutS({
        boughtout_id: addBoData?.bo_id,
        id: state?.supplier_id,
        update_type: 'add',
        update_type_entity: 'boughtout_supplier',
        cost: addBoData.cost,
        delivery_time: addBoData.delivery_time
      })).unwrap().then((res: any) => {
        if (res.message.includes('success')) {
          DisplaySnackbar('Boughtout Added Successfully', 'success', enqueueSnackbar)
          setAddBoData({ dialog: '', bo_id: '', bo_name: '', cost: 0, delivery_time: '' })
          dispatch(fetchSupplierBOs({ id: state?.supplier_id })).unwrap().then((res: any) => {
            setSupplierBOList(res?.supplierBoughtouts)
          })
        } else {
          DisplaySnackbar('Unable to add Boughtout to supplier', 'success', enqueueSnackbar)
        }
      })
    }
  }

  useEffect(() => {
    if (state?.supplier_id) {
      dispatch(fetchSupplierDetail(state?.supplier_id)).unwrap().then((res: any) => {
        setFormData({
          name: res.supplier.supplier_name,
          contactNo1: res.supplier.supplier_mobile_no1,
          contactNo2: res.supplier.supplier_mobile_no2,
          address1: res.supplier.supplier_address1,
          address2: res.supplier.supplier_address2,
          city: res.supplier.supplier_city,
          state: res.supplier.supplier_state,
          pincode: res.supplier.supplier_pincode,
          location: res.supplier.supplier_location,
          accountNo: res.supplier.supplier_account_no,
          bankName: res.supplier.supplier_bank_name,
          ifsc: res.supplier.supplier_ifsc,
          gst: res.supplier.supplier_gst
        })
      })

      dispatch(fetchSupplierHistory({
        searchText: state?.supplier_id,
        page: 1,
        limit: 10
      })).unwrap().then((res: any) => {
        setSupplierHistory(res)
      })

      dispatch(fetchSupplierBOs({ id: state?.supplier_id })).unwrap().then((res: any) => {
        setSupplierBOList(res?.supplierBoughtouts)
      })
    }
  }, [state?.supplier_id])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.contactNo1) newErrors.contactNo1 = 'Contact number is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.gst) newErrors.ifsc = 'GST No is required';

    return newErrors;
  };

  const handleSubmit = (e: any) => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      if (state?.supplier_id) {
        dispatch(updateSupplier({
          supplier_id: state?.supplier_id,
          supplier_name: formData.name,
          supplier_address1: formData.address1,
          supplier_address2: formData.address2,
          supplier_account_no: formData.accountNo,
          supplier_bank_name: formData.bankName,
          supplier_ifsc: formData.ifsc,
          supplier_city: formData.city,
          supplier_state: formData.state,
          supplier_pincode: formData.pincode,
          supplier_location: formData.location,
          supplier_mobile_no1: formData.contactNo1,
          supplier_mobile_no2: formData.contactNo2,
          supplier_gst: formData.gst
        })).unwrap().then((res) => {
          DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
          if (res.includes('success')) {
            navigate(-1)
          }
        }).catch((err) => {
          DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
      } else {
        dispatch(createSupplier({
          supplier_name: formData.name,
          supplier_address1: formData.address1,
          supplier_address2: formData.address2,
          supplier_account_no: formData.accountNo,
          supplier_bank_name: formData.bankName,
          supplier_ifsc: formData.ifsc,
          supplier_city: formData.city,
          supplier_state: formData.state,
          supplier_pincode: formData.pincode,
          supplier_location: formData.location,
          supplier_mobile_no1: formData.contactNo1,
          supplier_mobile_no2: formData.contactNo2,
          supplier_gst: formData.gst
        })).unwrap().then((res) => {
          DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
          if (res.includes('success')) {
            navigate(-1)
          }
        }).catch((err) => {
          DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <V2PageShell currentPage="supplier">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e: any) => {
          navigate(-1)
        }}>
          Back
        </Button>
        <form noValidate>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 size={3}>
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
                label="Contact No 1"
                name="contactNo1"
                required
                value={formData.contactNo1}
                onChange={handleChange}
                error={!!errors?.contactNo1}
                helperText={errors?.contactNo1}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Contact No 2"
                name="contactNo2"
                value={formData.contactNo2}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Address Line 1"
                name="address1"
                required
                value={formData.address1}
                onChange={handleChange}
                error={!!errors?.address1}
                helperText={errors?.address1}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Address Line 2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={2}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="City"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                error={!!errors?.city}
                helperText={errors?.city}
              />
            </Grid2>
            <Grid2 size={2}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="State"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                error={!!errors?.state}
                helperText={errors?.state}
              />
            </Grid2>
            <Grid2 size={2}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Pincode"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                error={!!errors?.pincode}
                helperText={errors?.pincode}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              // error={!!errors.address}
              // helperText={errors.address}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Account No"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleChange}
                error={!!errors?.accountNo}
                helperText={errors?.accountNo}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                error={!!errors?.bankName}
                helperText={errors?.bankName}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="IFSC Code"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
                error={!!errors?.ifsc}
                helperText={errors?.ifsc}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="GST"
                name="gst"
                required
                value={formData.gst}
                onChange={handleChange}
                error={!!errors?.gst}
                helperText={errors?.gst}
              />
            </Grid2>
          </Grid2>
          <Grid2 container justifyContent={'flex-end'} sx={{ mt: 2 }}>
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

          <Grid2 container sx={{ mt: 1 }}>
            <Grid2 size={{ xs: 2, md: 4 }} sx={{ paddingRight: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '18px', mt: 1 }}>Supplier Boughtouts</Typography>
                <Button variant="text" startIcon={<Add />} size="small" sx={{ marginLeft: 'auto' }} onClick={() => {
                  setAddBoData({
                    dialog: true,
                    bo_id: '', bo_name: '', cost: 0, delivery_time: ''
                  })
                }}>
                  Add New
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ mt: 1, border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Boughtout Name</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Delivery Time(in Days)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierBOList?.length > 0 ? supplierBOList?.map((row: any) => (
                      <V2TableRowStyled key={row.id}>
                        <TableCell>{row.bought_out.bought_out_name}</TableCell>
                        <TableCell>{row.cost}</TableCell>
                        <TableCell>{row.delivery_time}</TableCell>
                      </V2TableRowStyled>
                    )) : <TableRow key={0}>
                      <TableCell colSpan={5} align='center'>No Data</TableCell>
                    </TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>

              <Pagination count={Math.ceil(supplierHistory?.count / 10)} shape="rounded" sx={{
                '& > .MuiPagination-ul': {
                  justifyContent: 'center',
                }, mt: 2
              }} onChange={(e: any, value: number) => {
                dispatch(fetchSupplierHistory({
                  searchText: state?.supplier_id,
                  page: value,
                  limit: 10
                })).unwrap().then((res: any) => {
                  setSupplierHistory(res)
                })
              }} />

            </Grid2>
            <Grid2 size={{ xs: 4, md: 8 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '18px', mt: 1 }}>Supplier History</Typography>
              <TableContainer component={Paper} sx={{ mt: 1, border: `1px solid ${v2Colors.line}`, boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Boughtout Name</TableCell>
                      <TableCell>Machine Name</TableCell>
                      <TableCell>Order No</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Order Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierHistory?.list?.length > 0 ? supplierHistory?.list?.map((row: any) => (
                      <V2TableRowStyled key={row.id}>
                        <TableCell>{row.bought_out_name}</TableCell>
                        <TableCell>{row.order.machine_name}</TableCell>
                        <TableCell>{row.order.quotation.quotation_no}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.order.status}</TableCell>
                      </V2TableRowStyled>
                    )) : <TableRow key={0}>
                      <TableCell colSpan={5} align='center'>No Data</TableCell>
                    </TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>

              <Pagination count={Math.ceil(supplierHistory?.count / 10)} shape="rounded" sx={{
                '& > .MuiPagination-ul': {
                  justifyContent: 'center',
                }, mt: 2
              }} onChange={(e: any, value: number) => {
                dispatch(fetchSupplierHistory({
                  searchText: state?.supplier_id,
                  page: value,
                  limit: 10
                })).unwrap().then((res: any) => {
                  setSupplierHistory(res)
                })
              }} />

            </Grid2>
          </Grid2>
        </form>
      </Box>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>

      {/* Add Boughtout supplier */}

      <V2Drawer
        open={addBoData.dialog}
        onClose={() => setAddBoData({ dialog: false })}
        title="Add Boughtout"
        actions={<>
          <Button variant='text' onClick={() => {
            setAddBoData({ dialog: false })
          }} sx={{ color: v2Colors.primary }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} size="small" color='secondary'
            onClick={() => {
              handleAddBoughtout()
            }}>
            Save
          </Button>
        </>}
      >
          <Autocomplete
            fullWidth
            size={'small'}
            sx={{ mt: 2 }}
            open={boOpen}
            onInputChange={(e: any) => {
              setBoOpen(true)
              handleBoughoutSearch(e.target.value)
            }
            }
            onChange={(e: any, value: any) => {
              setBoOpen(false)
              if (value) {
                setAddBoData({ ...addBoData, bo_id: value.id, bo_name: value.bought_out_name })
              }
            }}
            isOptionEqualToValue={(boughtout, value) => boughtout.bought_out_name === value.bought_out_name}
            getOptionLabel={(boughtout) => boughtout.bought_out_name}
            options={BOList}
            loading={machineStatus == "loading"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Boughtout"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {machineStatus == "loading" ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  },
                }}
              />
            )}
          />

          <TextField
            size={'small'}
            fullWidth
            required
            sx={{ mt: 2 }}
            id="email"
            label="Cost"
            name="email"
            error={!!errors?.delivery_cost}
            helperText={errors?.delivery_cost}
            value={addBoData.cost}
            onChange={(e) => {
              setAddBoData({ ...addBoData, cost: e.target.value })
            }} />

          <TextField
            size={'small'}
            fullWidth
            required
            sx={{ mt: 1 }}
            id="email"
            label="Delivery Time"
            name="email"
            type='number'
            error={!!errors?.delivery_time}
            helperText={errors?.delivery_time}
            value={addBoData.delivery_time}
            onChange={(e) => {
              setAddBoData({ ...addBoData, delivery_time: e.target.value })
            }} />
      </V2Drawer>
    </V2PageShell>
  );
}
