import {
    Container,
    CssBaseline,
    Box,
    Avatar,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Divider,
    Grid2,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from 'notistack';
import DisplaySnackbar from '../utils/DisplaySnackbar';
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks";
import { login, productionPartDetail, vendorAcceptStatus } from "../slices/authSlice";
import ceLogo from "../assets/image/ce_logo.png"
import moment from "moment";

const VendorAcceptance = () => {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const [remarks, setRemarks] = useState("")
    const [status, setStatus] = useState("")
    const { enqueueSnackbar } = useSnackbar()

    const { productionPart } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        dispatch(productionPartDetail({ id: queryParams.get('id') })).unwrap()
    }, [queryParams.get('id')])


    const handleClick = (vendorStatus:string) => {
        dispatch(vendorAcceptStatus({
            id: queryParams.get('id'),
            status: vendorStatus,
            remarks: remarks
        })).unwrap().then((res:any)=>{
            DisplaySnackbar(`Order ${vendorStatus}`, 'success', enqueueSnackbar)
            setStatus(vendorStatus)
        }).catch(err => {
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
    }

    return (
        <>
            <Container sx={{ width: '70%' }}>
                <CssBaseline />
                <Card sx={{
                    mt: 20,
                }}>
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                boxShadow: '10px'
                            }}>
                            <img src={ceLogo} alt="" style={{ width: '180px', height: '180px', marginLeft: '20px', marginRight: '5px' }} />
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ mr: '20px' }} />
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "80vw"
                                }}
                            >
                                <Typography variant="h6">Verify and accept the order</Typography>
                                <Box sx={{ mt: 1 }}>

                                    <Grid2 container sx={{ width: '40vw' }}>
                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Vendor</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{productionPart?.productionPart?.vendor_name}</Typography>
                                        </Grid2>

                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Part</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{productionPart?.productionPart?.part_name}</Typography>
                                        </Grid2>

                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Process</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{productionPart?.productionPart?.process_name}</Typography>
                                        </Grid2>

                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Quantity</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{productionPart?.productionPart?.order_qty}</Typography>
                                        </Grid2>

                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Delivery Date</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{productionPart?.productionPart?.delivery_date ? 
                                            moment(productionPart?.productionPart?.delivery_date).format('DD-MMM-YYYY') : "" }</Typography>
                                        </Grid2>

                                    </Grid2>

                                    {(!productionPart?.productionPart?.vendor_accept_status && status.length == 0) ? <Grid2 container><Grid2 size={12}>
                                            <TextField
                                                size='small'
                                                variant="outlined"
                                                fullWidth
                                                label="Remarks"
                                                multiline
                                                rows={4}
                                                name="remarks"
                                                value={remarks}
                                                sx={{ mt: 1 }}
                                                onChange={(e: any) => {
                                                    setRemarks(e.target.value)
                                                }}
                                            />
                                        </Grid2>

                                        <Grid2 size={5}>
                                            <Button
                                                variant="contained"
                                                sx={{ mt: 3, mb: 2 }}
                                                onClick={()=> handleClick('accepted')}
                                            >
                                                Accept Order
                                            </Button>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            
                                        </Grid2>
                                        <Grid2 size={5}>
                                            <Button
                                            variant='outlined' color="primary"
                                                sx={{ mt: 3, mb: 2 }}
                                                onClick={()=> handleClick('rejected')}
                                            >
                                                Reject Order
                                            </Button>
                                        </Grid2></Grid2> : <Grid2 container>
                                        <Grid2 size={5}>
                                            <Typography variant='subtitle2' color={'grey'}>Status</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='subtitle1'>{status.length > 0 ? status : productionPart?.productionPart?.vendor_accept_status}</Typography>
                                        </Grid2></Grid2>}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default VendorAcceptance;