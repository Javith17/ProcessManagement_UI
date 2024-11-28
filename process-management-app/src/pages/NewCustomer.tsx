import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createCustomer } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent, FormGroup, FormControlLabel, FormHelperText, CircularProgress, Dialog } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIos } from '@mui/icons-material';
import { nav_customers } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';

export default function NewCustomer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { status } = useAppSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState({
    name: '',
    contactNo1:'',
    contactNo2: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    accountNo: '',
    bankName: '',
    ifsc: '',
    isMachine: false,
    isSpares: false,
    isSPM: false
  });
  const [errors, setErrors] = useState<any>();
  const [loadingDialog, setLoadingDialog] = useState(false)

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.checked });
  };

  const validate = () => {
    const newErrors : any = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.contactNo1) newErrors.contactNo1 = 'Contact number is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.accountNo) newErrors.accountNo = 'Account No is required';
    if (!formData.bankName) newErrors.bankName = 'Bank is required';
    if (!formData.ifsc) newErrors.ifsc = 'IFSC Code is required';
    if (!formData.isMachine && !formData.isSpares && !formData.isSPM) newErrors.category = 'Select any one category'
    return newErrors;
  };

  const handleSubmit = (e:any) => {
      
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
        dispatch(createCustomer({
            customer_name: formData.name,
            customer_address1:formData.address1,
            customer_address2:formData.address2,
            customer_account_no:formData.accountNo,
            customer_bank_name: formData.bankName,
            customer_ifsc: formData.ifsc,
            customer_city: formData.city,
            customer_state: formData.state,
            customer_pincode: formData.pincode,
            customer_mobile_no1: formData.contactNo1,
            customer_mobile_no2: formData.contactNo2,
            is_machine: formData.isMachine,
            is_spares: formData.isSpares,
            is_spm: formData.isSPM
        })).unwrap().then((res)=>{
          DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
          if(res.includes('success')){
            navigate(-1)
          }
        }).catch((err)=>{
          DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Box sx={{display:'flex', direction:'row', ml:2, mr:5}}>
        <SidebarNav currentPage={nav_customers} />
        <Box sx={{display: 'flex', flexDirection:'column', mt:10, alignItems:'start', }}>
          <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e:any)=>{
                  navigate(-1)
                }}>
                  Back
          </Button>
          <form noValidate>
            <Grid2 container spacing={2} sx={{mt:1}}>
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
              <Grid2 size={3}>
                <FormControl
                    required
                    error={!!errors?.category}
                    sx={{ml:3}}
                    component="fieldset"
                    variant="standard">
                    <FormGroup row>
                    <FormControlLabel
                        control={
                        <Checkbox checked={formData.isMachine} onChange={handleCheckChange} name="isMachine" />
                        }
                        label="Machine"
                    />
                    <FormControlLabel
                        control={
                        <Checkbox checked={formData.isSpares} onChange={handleCheckChange} name="isSpares" />
                        }
                        label="Spares"
                    />
                    <FormControlLabel
                        control={
                        <Checkbox checked={formData.isSPM} onChange={handleCheckChange} name="isSPM" />
                        }
                        label="SPM"
                    />
                    </FormGroup>
                    <FormHelperText>{errors?.category}</FormHelperText>
                </FormControl>
              </Grid2>
            </Grid2>
            <Grid2 container justifyContent={'flex-end'} sx={{mt:2}}>
              <Grid2 size={2}>
                <Button variant='outlined' color="primary" fullWidth onClick={(e:any)=>{
                  navigate(-1)
                }}>
                  Cancel
                </Button>
              </Grid2>
              <Grid2 size={2}>
                <Button variant="contained" color="secondary" fullWidth sx={{ml:2}} onClick={(e:any)=>{
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
            <CircularProgress color='success' sx={{m:3}} />
        </Dialog>
    </Box>
  );
}
