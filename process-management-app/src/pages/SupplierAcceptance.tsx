import {
    Container,
    CssBaseline,
    Box,
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
import { productionBoughtoutDetail, supplierAcceptStatus } from "../slices/authSlice";
import ceLogo from "../assets/image/ce_logo.png"
import moment from "moment";

const SupplierAcceptance = () => {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const [remarks, setRemarks] = useState("")
    const [status, setStatus] = useState("")
    const { enqueueSnackbar } = useSnackbar()

    const { productionBoughtout } = useAppSelector(
        (state) => state.auth
    );

    const bo = productionBoughtout?.productionBoughtout

    useEffect(() => {
        dispatch(productionBoughtoutDetail({ id: queryParams.get('id') })).unwrap()
    }, [queryParams.get('id')])

    const handleClick = (supplierStatus: string) => {
        dispatch(supplierAcceptStatus({
            id: bo?.id,
            status: supplierStatus,
            remarks: remarks
        })).unwrap().then((res: any) => {
            const stat = supplierStatus.charAt(0).toUpperCase() + supplierStatus.slice(1).toLowerCase()
            DisplaySnackbar(`Order ${stat}`, 'success', enqueueSnackbar)
            setStatus(stat)
        }).catch(err => {
            DisplaySnackbar(err.message, 'error', enqueueSnackbar)
        })
    }

    const boStatus = bo?.supplier_accept_status ?
        bo.supplier_accept_status.charAt(0).toUpperCase() + bo.supplier_accept_status.slice(1).toLowerCase() :
        (status.length > 0 ? status : "")

    return (
        <>
            <Container sx={{ width: '70%' }}>
                <CssBaseline />
                <Card sx={{
                    mt: 20,
                }}>
                    <CardContent sx={{ background: '#F5F5F5' }}>
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
                                    {bo && <Card sx={{ padding: 2, mt: 1 }}>
                                        <Grid2 container sx={{ width: '40vw' }}>
                                            <Grid2 size={5}>
                                                <Typography variant='subtitle2' color={'grey'}>Boughtout</Typography>
                                            </Grid2>
                                            <Grid2 size={1}>
                                                <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <Typography variant='subtitle1'>{bo?.bought_out_name}</Typography>
                                            </Grid2>

                                            <Grid2 size={5}>
                                                <Typography variant='subtitle2' color={'grey'}>Quantity</Typography>
                                            </Grid2>
                                            <Grid2 size={1}>
                                                <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <Typography variant='subtitle1'>{bo?.order_qty}</Typography>
                                            </Grid2>

                                            {bo?.remarks && <>
                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Remarks</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{bo?.remarks}</Typography>
                                                </Grid2>
                                            </>}

                                            <Grid2 size={5}>
                                                <Typography variant='subtitle2' color={'grey'}>Delivery Date</Typography>
                                            </Grid2>
                                            <Grid2 size={1}>
                                                <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                            </Grid2>
                                            <Grid2 size={6}>
                                                <Typography variant='subtitle1'>{bo?.delivery_date ?
                                                    moment(bo?.delivery_date).format('DD-MMM-YYYY') : ""}</Typography>
                                            </Grid2>

                                            {boStatus.length > 0 && <>
                                                <Grid2 size={5}>
                                                    <Typography variant='subtitle2' color={'grey'}>Status</Typography>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Typography variant='subtitle1' color={'grey'}>:</Typography>
                                                </Grid2>
                                                <Grid2 size={6}>
                                                    <Typography variant='subtitle1'>{boStatus}</Typography>
                                                </Grid2>
                                            </>}
                                        </Grid2>
                                    </Card>}

                                    {(bo && !bo?.supplier_accept_status && status.length == 0) ? <Grid2 container><Grid2 size={12}>
                                        <TextField
                                            size='small'
                                            variant="outlined"
                                            fullWidth
                                            label="Remarks"
                                            multiline
                                            rows={4}
                                            name="remarks"
                                            value={remarks}
                                            sx={{ mt: 1, background: 'white' }}
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
                                        </Grid2></Grid2> : null}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default SupplierAcceptance;
