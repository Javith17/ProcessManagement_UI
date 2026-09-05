import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

type DashboardStateApi = {
    pendingPayments: {
        list: Array<any>,
        count: number
    },
    pendingDelivery: any,
    partsInStoresList: {
        list: Array<any>,
        count: number
    },
    dashboardDetail: any,
    status: 'loading' | 'idle' | 'error',
    error: string | null,
    message: string | null
}

const initialState: DashboardStateApi = {
    pendingPayments: {
        list: [],
        count: 0
    },
    partsInStoresList: {
        list: [],
        count: 0
    },
    dashboardDetail: {},
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

export const fetchPendingDeliveryBOs = createAsyncThunk('deliveryPendingBoughtouts', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('order/deliveryPendingBoughtouts',
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

export const fetchReminderDateList = createAsyncThunk('partListFilter', async (data?: { from_date?:String, to_date?:String, searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get(`order/partListFilter/reminder/${data?.from_date}/${data?.to_date}`,
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

export const fetchDeliveryDateList = createAsyncThunk('partListFilter', async (data?: { from_date?:String, to_date?:String, searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get(`order/partListFilter/delivery/${data?.from_date}/${data?.to_date}`,
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

export const fetchPartsInStores = createAsyncThunk('partsInStoresList', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get(`machine/partsInStoresList`,
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

export const fetchReminderQuotations = createAsyncThunk('machineQuotationListReminder', async (data?: { date?:String, searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get(`quotation/machineQuotationListReminder/${data?.date}`,
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

export const fetchDashboardDetail = createAsyncThunk('getDashboardDetail', async (data?: String) => {
    try{
        const response = await axiosInstance.get(`order/dashboardDetails`,{
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return {}
    }
})

export const fetchOrderParts = createAsyncThunk('orderParts', async (data?: String) => {
    try{
        const response = await axiosInstance.get(`order/orderParts`,{
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return {}
    }
})

export const recordVendorProcessPayment = createAsyncThunk('recordVendorProcessPayment', async (data: any) => {
    try{
        const response = await axiosInstance.post('order/recordVendorProcessPayment', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return {}
    }
})

export const uploadVendorInvoice = createAsyncThunk('uploadVendorInvoice', async (data: { file: File, order_id?: string, vendor_id?: string, machine_id?: string, part_id?: string, process?: string }) => {
    try{
        const formData = new FormData()
        formData.append('file', data.file)
        if (data.order_id) formData.append('order_id', data.order_id)
        if (data.vendor_id) formData.append('vendor_id', data.vendor_id)
        if (data.machine_id) formData.append('machine_id', data.machine_id)
        if (data.part_id) formData.append('part_id', data.part_id)
        if (data.process) formData.append('process', data.process)
        formData.append('uploaded_by', JSON.parse(localStorage.getItem("userDetail") as string).user.userId)
        const response = await axiosInstance.post('order/uploadVendorInvoice', formData, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return {}
    }
})

export const closeOrder = createAsyncThunk('closeOrder', async (data: any) => {
    try{
        const response = await axiosInstance.post('order/closeOrder', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }
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

        .addCase(fetchPartsInStores.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchPartsInStores.fulfilled, (state, action) => {
            state.status = 'idle';
            state.partsInStoresList = action.payload
        })
        .addCase(fetchPartsInStores.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load roles"
        })

        .addCase(fetchDashboardDetail.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchDashboardDetail.fulfilled, (state, action) => {
            state.status = 'idle'
            state.dashboardDetail = action.payload
        })
        .addCase(fetchDashboardDetail.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to add supplier'
        })
    }
})

export default dashboardSlice.reducer;