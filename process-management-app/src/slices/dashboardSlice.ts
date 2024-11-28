import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

type DashboardStateApi = {
    pendingPayments: {
        list: Array<any>,
        count: number
    },
    pendingDelivery: any,
    status: 'loading' | 'idle' | 'error',
    error: string | null,
    message: string | null
}

const initialState: DashboardStateApi = {
    pendingPayments: {
        list: [],
        count: 0
    },
    pendingDelivery: {},
    status: 'idle',
    error: null,
    message: null
}

export const fetchPendingPaymentBOs = createAsyncThunk('pendingPaymentBoughtouts', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('order/pendingPaymentBoughtouts',
    {
        params: {
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const updateBoughtoutPayment = createAsyncThunk('updateBoughtoutPayment', async (data: any) => {
    const response = await axiosInstance.post('order/updateBoughtoutPayment', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchPendingDeliveryParts = createAsyncThunk('deliveryPendingParts', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('order/deliveryPendingParts',
    {
        params: {
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPendingPaymentBOs.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchPendingPaymentBOs.fulfilled, (state, action) => {
            state.status = 'idle';
            state.pendingPayments = action.payload
        })
        .addCase(fetchPendingPaymentBOs.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load roles"
        })

        .addCase(updateBoughtoutPayment.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(updateBoughtoutPayment.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(updateBoughtoutPayment.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load roles"
        })

        .addCase(fetchPendingDeliveryParts.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchPendingDeliveryParts.fulfilled, (state, action) => {
            state.status = 'idle';
            state.pendingDelivery = action.payload
        })
        .addCase(fetchPendingDeliveryParts.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load roles"
        })
    }
})

export default dashboardSlice.reducer;