import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

type AdminStateApi = {
    roles: {
        list: Array<any>,
        count: number
    },
    users: {
        list: Array<any>,
        count: number
    },
    vendors: {
        list: Array<any>,
        count: number
    },
    suppliers: {
        list: Array<any>,
        count: number
    },
    customers: {
        list: Array<any>,
        count: number
    },
    processList: {
        list: Array<any>,
        count: number
    },
    status: 'loading' | 'idle' | 'error',
    error: string | null,
    message: string | null
}

const initialState: AdminStateApi = {
    roles: {
        list: [],
        count: 0
    },
    users: {
        list: [],
        count: 0
    },
    vendors: {
        list: [],
        count: 0
    },
    suppliers: {
        list: [],
        count: 0
    },
    customers: {
        list: [],
        count: 0
    },
    processList: {
        list: [],
        count: 0
    },
    status: 'idle',
    error: null,
    message: null
}

export const fetchRoles = createAsyncThunk('roles', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('admin/roles',
    {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createNewRole = createAsyncThunk('createRole', async (data: any) => {
    const response = await axiosInstance.post('admin/createRole', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchUsers = createAsyncThunk('users', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('admin/users',
    {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createNewUser = createAsyncThunk('createUser', async (data: any) => {
    const response = await axiosInstance.post('admin/createUser', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchVendors = createAsyncThunk('vendors', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('admin/vendorsList',
    {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createVendor = createAsyncThunk('createVendor', async (data: any) => {
    const response = await axiosInstance.post('admin/createVendor', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchSuppliers = createAsyncThunk('suppliers', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('admin/suppliersList', 
    {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createSupplier = createAsyncThunk('createSupplier', async (data: any) => {
    const response = await axiosInstance.post('admin/createSupplier', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchCustomers = createAsyncThunk('customers', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('admin/customersList',
    {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createCustomer = createAsyncThunk('createCustomer', async (data: any) => {
    const response = await axiosInstance.post('admin/createCustomer', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchProcessList = createAsyncThunk('processList', async (data?: { searchText?:String, limit?: number, page?: number }) => {
    try{
        const response = await axiosInstance.get('admin/processList',
        {
            params: {
                search: data?.searchText,
                limit: data?.limit,
                page: data?.page
            },
            headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
        })
        const resData = response.data
        return resData
    }catch(error){
        return []
    }
})

export const createNewProcess = createAsyncThunk('createProcess', async (data: any) => {
    const response = await axiosInstance.post('admin/createProcess', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchRoles.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchRoles.fulfilled, (state, action) => {
            state.status = 'idle';
            state.roles = action.payload
        })
        .addCase(fetchRoles.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load roles"
        })

        .addCase(fetchUsers.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.status = 'idle';
            state.users = action.payload
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load users"
        })

        .addCase(fetchVendors.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchVendors.fulfilled, (state, action) => {
            state.status = 'idle';
            state.vendors = action.payload
        })
        .addCase(fetchVendors.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(fetchSuppliers.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchSuppliers.fulfilled, (state, action) => {
            state.status = 'idle';
            state.suppliers = action.payload
        })
        .addCase(fetchSuppliers.rejected, (state, action) => {
            state.status = 'error';
        })

        .addCase(fetchCustomers.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchCustomers.fulfilled, (state, action) => {
            state.status = 'idle'
            state.customers = action.payload
        })
        .addCase(fetchCustomers.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(fetchProcessList.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(fetchProcessList.fulfilled, (state, action) => {
            state.status = 'idle';
            state.processList = action.payload
        })
        .addCase(fetchProcessList.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createNewUser.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createNewUser.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createNewUser.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createNewRole.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createNewRole.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createNewRole.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createNewProcess.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createNewProcess.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createNewProcess.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createVendor.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createVendor.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createVendor.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createSupplier.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createSupplier.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createSupplier.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })

        .addCase(createCustomer.pending, (state) => {
            state.status = 'loading';
            state.error = null
        })
        .addCase(createCustomer.fulfilled, (state, action) => {
            state.status = 'idle';
            state.message = action.payload
        })
        .addCase(createCustomer.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || "Unable to load vendors"
        })
    }
})

export default adminSlice.reducer;