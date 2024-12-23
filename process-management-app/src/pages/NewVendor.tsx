import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createVendor, fetchProcessList, fetchVendorDetail, fetchVendors, updateVendor } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, Dialog, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import { ArrowBackIos } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { nav_vendors } from '../constants';

export default function NewVendor() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()

  const { enqueueSnackbar } = useSnackbar()

  const { processList, status } = useAppSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState({
    name: '',
    gst: '',
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
    processList: ['']
  });
  const [errors, setErrors] = useState<any>();
  const [loadingDialog, setLoadingDialog] = useState(false)

  const handleMultiProcessChange = (event: SelectChangeEvent<typeof formData.processList>) => {
    const {
      target: { value },
    } = event;
    setFormData({ ...formData, processList: typeof value === 'string' ? value.split(',') : value });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    dispatch(fetchProcessList()).unwrap()
  }, [dispatch])

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  useEffect(() => {
    if(state?.vendor_id){
      dispatch(fetchVendorDetail(state?.vendor_id)).unwrap().then((res: any) => {
        setFormData({
          name: res.vendor.vendor_name,
          gst: res.vendor.vendor_gst,
          contactNo1: res.vendor.vendor_mobile_no1,
          contactNo2: res.vendor.vendor_mobile_no2,
          address1: res.vendor.vendor_address1,
          address2: res.vendor.vendor_address2,
          city: res.vendor.vendor_city,
          state: res.vendor.vendor_state,
          pincode: res.vendor.vendor_pincode,
          location: res.vendor.vendor_location,
          accountNo: res.vendor.vendor_account_no,
          bankName: res.vendor.vendor_bank_name,
          ifsc: res.vendor.vendor_ifsc,
          processList: res.vendorProcess?.map((vp: any) => vp.process_name)
        })
      })
    }
  }, [state?.vendor_id])

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.gst) newErrors.gst = 'GST is required';
    if (!formData.contactNo1) newErrors.contactNo1 = 'Contact number is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.accountNo) newErrors.accountNo = 'Account No is required';
    if (!formData.bankName) newErrors.bankName = 'Bank is required';
    if (!formData.ifsc) newErrors.ifsc = 'IFSC Code is required';
    if (formData.processList.length <= 1) newErrors.processList = 'Process is required';

    return newErrors;
  };

  const handleSubmit = (e: any) => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      const vendorProcess: { process_id: string, process_name: string }[] = []
      console.log(formData.processList)
      formData.processList.map((pro) => {
        if (pro.length > 0) {
          console.log(pro)
          vendorProcess.push({
            process_id: processList.list.filter((f) => f.process_name == pro)[0].id,
            process_name: pro
          })
        }
      })
      if (state?.vendor_id) {
        dispatch(updateVendor({
          vendor_id: state?.vendor_id,
          vendor_name: formData.name,
          vendor_address1: formData.address1,
          vendor_address2: formData.address2,
          vendor_gst: formData.gst,
          vendor_account_no: formData.accountNo,
          vendor_bank_name: formData.bankName,
          vendor_ifsc: formData.ifsc,
          vendor_city: formData.city,
          vendor_state: formData.state,
          vendor_pincode: formData.pincode,
          vendor_location: formData.location,
          vendor_mobile_no1: formData.contactNo1,
          vendor_mobile_no2: formData.contactNo2,
          vendor_process_list: vendorProcess
        })).unwrap().then((res) => {
          DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
          if (res.includes('success')) {
            navigate(-1)
          }
        }).catch((err) => {
          DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
      } else {
        dispatch(createVendor({
          vendor_name: formData.name,
          vendor_address1: formData.address1,
          vendor_address2: formData.address2,
          vendor_gst: formData.gst,
          vendor_account_no: formData.accountNo,
          vendor_bank_name: formData.bankName,
          vendor_ifsc: formData.ifsc,
          vendor_city: formData.city,
          vendor_state: formData.state,
          vendor_pincode: formData.pincode,
          vendor_location: formData.location,
          vendor_mobile_no1: formData.contactNo1,
          vendor_mobile_no2: formData.contactNo2,
          vendor_process_list: vendorProcess
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
      <SidebarNav currentPage={nav_vendors} />
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
                label="GST"
                name="gst"
                required
                value={formData.gst}
                onChange={handleChange}
                error={!!errors?.gst}
                helperText={errors?.gst}
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
            <Grid2 size={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="demo-multiple-checkbox-label">Process</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  size='small'
                  multiple
                  required
                  value={formData.processList}
                  onChange={handleMultiProcessChange}
                  input={<OutlinedInput label="Tag" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        value.length > 0 ?
                          <Chip key={value} label={value} /> : <></>
                      ))}
                    </Box>
                  )}
                // MenuProps={MenuProps}
                >
                  {processList.list.map((name) => (
                    <MenuItem key={name.id} value={name.process_name}>
                      <Checkbox checked={formData.processList.includes(name.process_name)} />
                      <ListItemText primary={name.process_name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container justifyContent={'flex-end'}>
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
