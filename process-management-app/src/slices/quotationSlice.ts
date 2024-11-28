import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosInstance from "../api/axiosInstance"

type QuotationStateApi = {
    machineQuotationList: any,
    vendorQuotationList: {
        list: Array<any>,
        count: 0
    },
    supplierQuotationList: {
        list: Array<any>,
        count: 0
    },
    ordersList: any,
    orderDetail: {
        parts: any,
        boughtouts: any
    },
    status: 'loading' | 'idle' | 'error',
    error: string | null,
    message: string | null
}

const initialState: QuotationStateApi =  {
    machineQuotationList: [],
    vendorQuotationList: {
        list: [],
        count: 0
    },
    supplierQuotationList: {
        list: [],
        count: 0
    },
    ordersList: [],
    orderDetail: {
        parts: {},
        boughtouts: {}
    },
    status: 'idle',
    error: null,
    message: null
}

export const fetchMachineQuotationList = createAsyncThunk('machineQuotationList', async (data?: String) => {
    try{
        const response = await axiosInstance.get('quotation/machineQuotationList',
        {
            params: {
                search: data
            },
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.list
        return resData
    }catch(error){
        return []
    }
})

export const fetchVendorQuotationList = createAsyncThunk('vendorQuotationList', async (data?: String) => {
    try{
        const response = await axiosInstance.get('quotation/vendorQuotationList',
        {
            params: {
                search: data
            },
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }
})

export const fetchSupplierQuotationList = createAsyncThunk('supplierQuotationList', async (data?: String) => {
    try{
        const response = await axiosInstance.get('quotation/supplierQuotationList',
        {
            params: {
                search: data
            },
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }
})

export const createMachineQuotation = createAsyncThunk('createMachineQuotation', async (data: any) => {
    try{
        const response = await axiosInstance.post('quotation/createMachineQoutation', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    }
})

export const createVendorQuotation = createAsyncThunk('createVendorQuotation', async (data: any) => {
    try{
        const response = await axiosInstance.post('quotation/createVendorQuotation', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    }
})

export const createSupplierQuotation = createAsyncThunk('createSupplierQuotation', async (data: any) => {
    try{
        const response = await axiosInstance.post('quotation/createSupplierQuotation', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    }
})

export const deleteQuotation = createAsyncThunk('deleteVendorQuotation', async (data: any) => {
    try{
        const response = await axiosInstance.delete(`quotation/deleteQuotation/${data.type}/${data.id}`, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    }
})

export const approveRejectQuotation = createAsyncThunk('approveRejectQuotation', async (data: any) => {
    try{
        const response = await axiosInstance.post('quotation/approveRejectQuotation', data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    }
})

export const fetchOrdersList = createAsyncThunk('getOrdersList', async (data?: String) => {
    try{
        const response = await axiosInstance.get('order/ordersList',
        {
            params: {
                search: data
            },
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.list
        return resData
    }catch(error){
        return []
    }
})

export const fetchOrdersDetail = createAsyncThunk('getOrdersDetail', async (data?: String) => {
    try{
        const response = await axiosInstance.get(`order/order/${data}`,{
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }
})

export const updateProductionMachinePart = createAsyncThunk('updateProductionMachinePart', async (data:any) => {
    try{
        const response = await axiosInstance.post(`order/updateProductionMachinePart`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }  
})

export const moveProductionMachinePartToVendor = createAsyncThunk('moveProductionMachinePartToVendor', async (data:any) => {
    try{
        const response = await axiosInstance.post(`order/moveProductionMachinePartToVendor`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }  
})

export const deliverProductionMachinePart = createAsyncThunk('deliverProductionMachinePart', async (data:any) => {
    try{
        const response = await axiosInstance.post(`order/deliverProductionMachinePart`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }  
})

export const completeProductPartProcess = createAsyncThunk('completeProductPartProcess', async (data: any) => {
    try{
        const response = await axiosInstance.post(`order/completeProductionPartProcess`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    } 
})

export const rescheduleProductPartProcess = createAsyncThunk('rescheduleProductPartProcess', async (data: any) => {
    try{
        const response = await axiosInstance.post(`order/rescheduleProductionPartProcess`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data.message
        return resData
    }catch(error){
        return []
    } 
})

export const updateProductionMachineBO = createAsyncThunk('updateProductionMachineBO', async (data:any) => {
    try{
        const response = await axiosInstance.post(`order/updateProductionMachineBO`, data, {
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }  
})

const quotationSlice = createSlice({
    name: 'quotation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        
        .addCase(fetchMachineQuotationList.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchMachineQuotationList.fulfilled, (state, action) => {
            state.status = 'idle'
            state.machineQuotationList = action.payload
        })
        .addCase(fetchMachineQuotationList.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to fetch machine quotation list'
        })

        .addCase(fetchVendorQuotationList.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchVendorQuotationList.fulfilled, (state, action) => {
            state.status = 'idle'
            state.vendorQuotationList = action.payload
        })
        .addCase(fetchVendorQuotationList.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to fetch vendor quotation list'
        })

        .addCase(fetchSupplierQuotationList.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchSupplierQuotationList.fulfilled, (state, action) => {
            state.status = 'idle'
            state.supplierQuotationList = action.payload
        })
        .addCase(fetchSupplierQuotationList.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to fetch supplier quotation list'
        })

        .addCase(createMachineQuotation.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(createMachineQuotation.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(createMachineQuotation.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to create machine quotation'
        })

        .addCase(createVendorQuotation.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(createVendorQuotation.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(createVendorQuotation.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to create vendor quotation'
        })

        .addCase(createSupplierQuotation.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(createSupplierQuotation.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(createSupplierQuotation.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to create supplier quotation'
        })

        .addCase(approveRejectQuotation.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(approveRejectQuotation.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(approveRejectQuotation.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to update quotation'
        })

        .addCase(fetchOrdersList.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchOrdersList.fulfilled, (state, action) => {
            state.status = 'idle'
            state.ordersList = action.payload
        })
        .addCase(fetchOrdersList.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to fetch orders list'
        })

        .addCase(fetchOrdersDetail.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(fetchOrdersDetail.fulfilled, (state, action) => {
            state.status = 'idle'
            state.orderDetail = action.payload
        })
        .addCase(fetchOrdersDetail.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to fetch orders detail'
        })

        .addCase(updateProductionMachinePart.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(updateProductionMachinePart.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(updateProductionMachinePart.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to add vendor'
        })

        .addCase(moveProductionMachinePartToVendor.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(moveProductionMachinePartToVendor.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(moveProductionMachinePartToVendor.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to move to vendor'
        })

        .addCase(deliverProductionMachinePart.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(deliverProductionMachinePart.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(deliverProductionMachinePart.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to update delivery status'
        })

        .addCase(completeProductPartProcess.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(completeProductPartProcess.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(completeProductPartProcess.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to complete process'
        })

        .addCase(rescheduleProductPartProcess.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(rescheduleProductPartProcess.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(rescheduleProductPartProcess.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to reschedule process'
        })

        .addCase(updateProductionMachineBO.pending, (state) => {
            state.status = 'loading'
            state.error = null
        })
        .addCase(updateProductionMachineBO.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(updateProductionMachineBO.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'unable to add supplier'
        })
    }
})

export default quotationSlice.reducer;