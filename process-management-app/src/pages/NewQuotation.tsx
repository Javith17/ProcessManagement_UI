import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createVendor, fetchProcessList, fetchVendors } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import { ArrowBackIos } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';

export default function NewQuotation() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const { processList } = useAppSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState({
    quotation_no: '',
    quotation_date: '',
    machine_id:'',
    machine_name: '',
    reminder_date: '',
    qty: ''
  });
  const [errors, setErrors] = useState<any>();

//   const handleMultiProcessChange = (event: SelectChangeEvent<typeof formData.processList>) => {
//     const {
//       target: { value },
//     } = event;
//     setFormData({ ...formData, processList: typeof value === 'string' ? value.split(',') : value });
//   };

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(()=> {
    dispatch(fetchProcessList()).unwrap()
  },[dispatch])

  const validate = () => {
    const newErrors : any = {};

    // if (!formData.name) newErrors.name = 'Name is required';
    // if (!formData.gst) newErrors.gst = 'GST is required';
    // if (!formData.contactNo1) newErrors.contactNo1 = 'Contact number is required';
    // if (!formData.address1) newErrors.address1 = 'Address is required';
    // if (!formData.city) newErrors.city = 'City is required';
    // if (!formData.state) newErrors.state = 'State is required';
    // if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    // if (!formData.accountNo) newErrors.accountNo = 'Account No is required';
    // if (!formData.bankName) newErrors.bankName = 'Bank is required';
    // if (!formData.ifsc) newErrors.ifsc = 'IFSC Code is required';
    // if (formData.processList.length <= 1) newErrors.processList = 'Process is required';

    return newErrors;
  };

  const handleSubmit = (e:any) => {
      
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
       
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Box sx={{display:'flex', direction:'row', ml:2, mr:5}}>
        <SidebarNav />
        <Box sx={{display: 'flex', flexDirection:'column', mt:10, alignItems:'start', }}>
          <Button variant='text' color="primary" startIcon={<ArrowBackIos />} onClick={(e:any)=>{
                  navigate(-1)
                }}>
                  Back
          </Button>
          <form noValidate>
            <TextField
                  size='small'
                  variant="outlined"
                  fullWidth
                  label="Quotation No"
                  name="name"
                  required
                  onChange={handleChange}
                  error={!!errors?.name}
                  helperText={errors?.name}
                />

            <TextField
                  size='small'
                  variant="outlined"
                  fullWidth
                  label="Quotation Date"
                  name="name"
                  required
                  onChange={handleChange}
                  error={!!errors?.name}
                  helperText={errors?.name}
                />
            
            {/* <Grid2 container justifyContent={'flex-end'}>
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
            </Grid2> */}
          </form>
        </Box>
    </Box>
  );
}
