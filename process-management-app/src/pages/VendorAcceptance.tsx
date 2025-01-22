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


    const handleClick = (vendorStatus: string) => {
        dispatch(vendorAcceptStatus({
            id: productionPart?.productionPart?.map((prod:any) => prod.id),
            status: vendorStatus,
            remarks: remarks
        })).unwrap().then((res: any) => {
            const stat = vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1).toLowerCase()
            DisplaySnackbar(`Order ${stat}`, 'success', enqueueSnackbar)
            setStatus(stat)
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
                    <CardContent sx={{background:'#F5F5F5'}}>
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

                                    {productionPart?.productionPart?.map((partProcess: any) =>
                                        <Card sx={{ padding: 2, mt: 1 }}>
                                            <Grid2 container sx={{ width: '40vw' }}>
                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Vendor</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{partProcess?.vendor_name}</Typography>
                                                </Grid2>

                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Part</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{partProcess?.part_name}</Typography>
                                                </Grid2>

                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Process</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{partProcess?.process_name}</Typography>
                                                </Grid2>

                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Quantity</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{partProcess?.order_qty}</Typography>
                                                </Grid2>

                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Delivery Date</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{partProcess?.delivery_date ?
                                                        moment(partProcess?.delivery_date).format('DD-MMM-YYYY') : ""}</Typography>
                                                </Grid2>

                                            </Grid2>
                                        </Card>
                                    )}

                                    {(productionPart?.productionPart?.length > 0 && !productionPart?.productionPart[0]?.vendor_accept_status && status.length == 0) ? <Grid2 container><Grid2 size={12}>
                                        <TextField
                                            size='small'
                                            variant="outlined"
                                            fullWidth
                                            label="Remarks"
                                            multiline
                                            rows={4}
                                            name="remarks"
                                            value={remarks}
                                            sx={{ mt: 1, background:'white' }}
                                            onChange={(e: any) => {
                                                setRemarks(e.target.value)
                                            }}
                                        />
                                    </Grid2>

                                        <Grid2 size={5}>
                                            <Button
                                                variant="contained"
                                                sx={{ mt: 3, mb: 2 }}
                                                onClick={() => handleClick('accepted')}
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
                                                onClick={() => handleClick('rejected')}
                                            >
                                                Reject Order
                                            </Button>
                                        </Grid2></Grid2> : <Grid2 container sx={{mt:3}}>
                                        <Grid2 size={5}>
                                            <Typography variant='h5' color={'grey'}>Status</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Typography variant='h5' color={'grey'}>:</Typography>
                                        </Grid2>
                                        <Grid2 size={6}>
                                            <Typography variant='h5'>{status.length > 0 ? status :
                                             productionPart?.productionPart?.length > 0 ? productionPart?.productionPart[0]?.vendor_accept_status.charAt(0).toUpperCase() + productionPart?.productionPart[0]?.vendor_accept_status.slice(1).toLowerCase() : ''} </Typography>
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