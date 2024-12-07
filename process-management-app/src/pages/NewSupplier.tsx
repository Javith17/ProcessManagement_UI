import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createSupplier, fetchSupplierDetail, updateSupplier } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, Dialog, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBackIos } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';

export default function NewSupplier() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()

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
    ifsc: ''
  });
  const [errors, setErrors] = useState<any>();
  const [loadingDialog, setLoadingDialog] = useState(false)

  const { status } = useAppSelector(
    (state) => state.admin
  );

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
          ifsc: res.supplier.supplier_ifsc
        })
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
    if (!formData.accountNo) newErrors.accountNo = 'Account No is required';
    if (!formData.bankName) newErrors.bankName = 'Bank is required';
    if (!formData.ifsc) newErrors.ifsc = 'IFSC Code is required';

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
          supplier_mobile_no2: formData.contactNo2
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
          supplier_mobile_no2: formData.contactNo2
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
    <Box sx={{ display: 'flex', direction: 'row', ml: 2, mr: 5 }}>
      <SidebarNav />
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 10, alignItems: 'start', }}>
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
                required
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
                required
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
                required
                value={formData.ifsc}
                onChange={handleChange}
                error={!!errors?.ifsc}
                helperText={errors?.ifsc}
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
        </form>
      </Box>

      <Dialog maxWidth={'md'}
        open={loadingDialog}>
        <CircularProgress color='success' sx={{ m: 3 }} />
      </Dialog>
    </Box>
  );
}
