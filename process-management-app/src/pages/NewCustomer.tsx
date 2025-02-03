import { useState } from 'react';
import SidebarNav from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { useEffect } from 'react';
import { createCustomer, fetchCustomerDetail, fetchCustomerHistory, updateCustomer } from '../slices/adminSlice';
import { TextField, Button, Grid2, Container, Alert, Paper, Box, FormControl, Checkbox, FormGroup, FormControlLabel, FormHelperText, 
  CircularProgress, Dialog, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBackIos } from '@mui/icons-material';
import { nav_customers, TableRowStyled } from '../constants';
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';

export default function NewCustomer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { state } = useLocation()
  const [customerHistory, setCustomerHistory] = useState<any>()

  const { status } = useAppSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState({
    name: '',
    contactNo1: '',
    contactNo2: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    accountNo: '',
    bankName: '',
    ifsc: '',
    gst: '',
    isMachine: false,
    isSpares: false,
    isSPM: false
  });
  const [errors, setErrors] = useState<any>();
  const [loadingDialog, setLoadingDialog] = useState(false)

  useEffect(() => {
    setLoadingDialog(status.includes('loading'))
  }, [status])

  useEffect(() => {
    if (state?.customer_id) {
      dispatch(fetchCustomerDetail(state?.customer_id)).unwrap().then((res: any) => {
        setFormData({
          name: res.customer.customer_name,
          contactNo1: res.customer.customer_mobile_no1,
          contactNo2: res.customer.customer_mobile_no2,
          address1: res.customer.customer_address1,
          address2: res.customer.customer_address2,
          city: res.customer.customer_city,
          state: res.customer.customer_state,
          pincode: res.customer.customer_pincode,
          accountNo: res.customer.customer_account_no,
          bankName: res.customer.customer_bank_name,
          gst: res.customer.customer_gst,
          ifsc: res.customer.customer_ifsc,
          isMachine: res.customer.is_machine,
          isSpares: res.customer.is_spares,
          isSPM: res.customer.is_spm
        })
      })

      dispatch(fetchCustomerHistory({
        searchText: state?.customer_id,
        page: 1,
        limit: 10
      })).unwrap().then((res:any) => {
        setCustomerHistory(res)
      })
    }
  }, [state?.customer_id])

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.checked });
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
    if (!formData.gst) newErrors.ifsc = 'GST No is required';
    if (!formData.isMachine && !formData.isSpares && !formData.isSPM) newErrors.category = 'Select any one category'
    return newErrors;
  };

  const handleSubmit = (e: any) => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      if (state?.customer_id) {
        dispatch(updateCustomer({
          customer_id: state?.customer_id,
          customer_name: formData.name,
          customer_address1: formData.address1,
          customer_address2: formData.address2,
          customer_account_no: formData.accountNo,
          customer_bank_name: formData.bankName,
          customer_ifsc: formData.ifsc,
          customer_city: formData.city,
          customer_state: formData.state,
          customer_pincode: formData.pincode,
          customer_mobile_no1: formData.contactNo1,
          customer_mobile_no2: formData.contactNo2,
          customer_gst: formData.gst,
          is_machine: formData.isMachine,
          is_spares: formData.isSpares,
          is_spm: formData.isSPM
        })).unwrap().then((res) => {
          DisplaySnackbar(res, res.includes('success') ? "success" : "error", enqueueSnackbar)
          if (res.includes('success')) {
            navigate(-1)
          }
        }).catch((err) => {
          DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
      } else {
        dispatch(createCustomer({
          customer_name: formData.name,
          customer_address1: formData.address1,
          customer_address2: formData.address2,
          customer_account_no: formData.accountNo,
          customer_bank_name: formData.bankName,
          customer_ifsc: formData.ifsc,
          customer_city: formData.city,
          customer_state: formData.state,
          customer_pincode: formData.pincode,
          customer_mobile_no1: formData.contactNo1,
          customer_mobile_no2: formData.contactNo2,
          customer_gst: formData.gst,
          is_machine: formData.isMachine,
          is_spares: formData.isSpares,
          is_spm: formData.isSPM
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
      <SidebarNav currentPage={nav_customers} />
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
              <TextField
                size='small'
                variant="outlined"
                fullWidth
                label="GST Number"
                name="gst"
                required
                value={formData.gst}
                onChange={handleChange}
                error={!!errors?.gst}
                helperText={errors?.gst}
              />
            </Grid2>
            <Grid2 size={3}>
              <FormControl
                required
                error={!!errors?.category}
                sx={{ ml: 3 }}
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

          <Typography sx={{fontWeight:'bold', fontSize:'18px', mt: 1}}>Customer History</Typography>
          <Grid2 container sx={{mt:1}}>
            <Grid2 size={{ xs: 6, md: 12 }}>
              <TableContainer component={Paper}>
                <Table sx={{ '& .MuiTableCell-head':{ lineHeight: 0.8, backgroundColor:"#fadbda", fontWeight:'bold' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Machine Name</TableCell>
                      <TableCell>Order No</TableCell>
                      <TableCell>Order Status</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerHistory?.list?.length > 0 ? customerHistory?.list?.map((row:any) => (
                      <TableRowStyled key={row.id}>
                        <TableCell>{row.machine_name}</TableCell>
                        <TableCell>{row.quotation.quotation_no}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.created_at}</TableCell>
                        <TableCell>{row.quotation.approved_cost}</TableCell>
                      </TableRowStyled>
                    )) : <TableRow key={0}>
                          <TableCell colSpan={5} align='center'>No Data</TableCell>
                        </TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>

              <Pagination count={Math.ceil(customerHistory?.count/10)} shape="rounded" sx={{
                '& > .MuiPagination-ul': {
                  justifyContent: 'center',
                }, mt:2
              }} onChange={(e:any, value:number)=>{
                dispatch(fetchCustomerHistory({
                  searchText: state?.customer_id,
                  page: value,
                  limit: 10
                })).unwrap().then((res:any) => {
                  setCustomerHistory(res)
                })
              }}/>

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
