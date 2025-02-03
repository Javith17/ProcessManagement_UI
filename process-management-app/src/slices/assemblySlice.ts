import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosInstance from "../api/axiosInstance";

export const fetchSubAssembly = createAsyncThunk("fetchSubAssembly", async (searchText?:string) => {
    const response = await axiosInstance.get('machine/subAssemblyList', {
        params: {
            search: searchText
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const fetchSubAssemblyDetail = createAsyncThunk("fetchSubAssemblyDetail", async (data:any) => {
    const response = await axiosInstance.get(`machine/subAssemblyDetail/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const createSubAssembly = createAsyncThunk("createSubAssembly", async (data:any) => {
    const response = await axiosInstance.post('machine/createSubAssembly', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const checkAssemblyName = createAsyncThunk("checkAssemblyName", async (data:any) => {
    const response = await axiosInstance.post('machine/checkAssemblyName', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const fetchSubAssemblByMachine = createAsyncThunk("fetchSubAssemblyByMachine", async (data:any) => {
    const response = await axiosInstance.get(`machine/subAssemblyList/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const fetchMainAssemblByMachine = createAsyncThunk("fetchMainAssemblyByMachine", async (data:any) => {
    const response = await axiosInstance.get(`machine/mainAssemblyList/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const createMainAssembly = createAsyncThunk("createMainAssembly", async (data:any) => {
    const response = await axiosInstance.post('machine/createMainAssembly', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createSectionAssembly = createAsyncThunk("createSectionAssembly", async (data:any) => {
    const response = await axiosInstance.post('machine/createSectionAssembly', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const fetchMainAssembly = createAsyncThunk("fetchMainAssembly", async (searchText?:string) => {
    const response = await axiosInstance.get('machine/mainAssemblyList', {
        params: {
            search: searchText
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const fetchMainAssemblyDetail = createAsyncThunk("fetchMainAssemblyDetail", async (data:any) => {
    const response = await axiosInstance.get(`machine/mainAssemblyDetail/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchSectionAssemblyDetail = createAsyncThunk("fetchSectionAssemblyDetail", async (data:any) => {
    const response = await axiosInstance.get(`machine/sectionAssemblyDetail/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchSectionAssembly = createAsyncThunk("fetchSectionAssembly", async (searchText?:string) => {
    const response = await axiosInstance.get('machine/sectionAssemblyList', {
        params: {
            search: searchText
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const updateAssembly = createAsyncThunk('updateAssembly', async (data:any) => {
    const response = await axiosInstance.post('machine/updateAssembly', data , {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`} 
    })
    const resData = response.data
    return resData
})

export const removeAttachment = createAsyncThunk('removeAttachment', async (data: any) => {
    const response = await axiosInstance.post('machine/removeAttachment', data, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const configureAssembly = createAsyncThunk('configureMachineAssemblies', async (data: any) => {
    const response = await axiosInstance.get(`assembly/configureMachineAssemblies/${data.machineId}/${data.orderId}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const getMachineSubAssembly = createAsyncThunk('getMachineSubAssemblies', async (data: any) => {
    const response = await axiosInstance.get(`assembly/getMachineSubAssemblies/${data.machineId}/${data.orderId}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const getMachineMainAssembly = createAsyncThunk('getMachineMainAssemblies', async (data: any) => {
    const response = await axiosInstance.get(`assembly/getMachineMainAssemblies/${data.machineId}/${data.orderId}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const getMachineSectionAssembly = createAsyncThunk('getMachineSectionAssemblies', async (data: any) => {
    const response = await axiosInstance.get(`assembly/getMachineSectionAssemblies/${data.machineId}/${data.orderId}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const getOrderDetail = createAsyncThunk('getOrderDetails', async (data: any) => {
    const response = await axiosInstance.get(`order/orderDetail/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

export const updateAssemblyStatus = createAsyncThunk('updateAssembly', async (data: any) => {
    const response = await axiosInstance.post('assembly/updateAssembly', data, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}   
    })
    const resData = response.data
    return resData
})

type AssemblyApiState = {
    subAssemblies: Array<any>;
    subAssemblyDetail: {
        sub_assembly_detail: any,
        machine_list: Array<any>,
        attachments: Array<any>
    },
    mainAssemblyDetail: {
        main_assembly_detail: any,
        attachments: Array<any>
    };
    sectionAssemblyDetail: {
        section_assembly_detail: any,
        attachments: Array<any>
    };
    createMessage: {
        message: string,
        id?: string
    };
    machineSubAssemblies: Array<any>;
    machineMainAssemblies: Array<any>;
    mainAssemblies: Array<any>;
    sectionAssemblies: Array<any>;
    data: any | null;
    status: 'loading' | 'idle' | 'error';
    message: string | null;
    error: string | null;
}

const initialState: AssemblyApiState = {
    subAssemblies: [],
    machineSubAssemblies: [],
    machineMainAssemblies: [],
    mainAssemblies: [],
    sectionAssemblies: [],
    subAssemblyDetail: {
        sub_assembly_detail: {},
        machine_list: [],
        attachments: []
    },
    mainAssemblyDetail: {
        main_assembly_detail: {},
        attachments: []
    },
    sectionAssemblyDetail: {
        section_assembly_detail: {},
        attachments: []
    },
    createMessage: {
        message: '',
        id: ''
    },
    data: null,
    status: 'idle',
    message: null,
    error: null
}

const assemblySlice = createSlice({
    name: 'assembly',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        
        .addCase(createSubAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(createSubAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.createMessage = action.payload
        })
        .addCase(createSubAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to create sub assembly'
        })

        .addCase(fetchSubAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSubAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.subAssemblies = action.payload
        })
        .addCase(fetchSubAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch sub assembly'
        })

        .addCase(fetchSubAssemblyDetail.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSubAssemblyDetail.fulfilled, (state, action) => {
            state.status = 'idle'
            state.subAssemblyDetail = action.payload
        })
        .addCase(fetchSubAssemblyDetail.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch sub assembly'
        })

        .addCase(checkAssemblyName.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(checkAssemblyName.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(checkAssemblyName.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to check assembly name'
        })

        .addCase(fetchSubAssemblByMachine.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSubAssemblByMachine.fulfilled, (state, action) => {
            state.status = 'idle'
            state.machineSubAssemblies = action.payload
        })
        .addCase(fetchSubAssemblByMachine.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch sub assembly'
        })

        .addCase(createMainAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(createMainAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.createMessage = action.payload
        })
        .addCase(createMainAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to create main assembly'
        })

        .addCase(fetchMainAssemblByMachine.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchMainAssemblByMachine.fulfilled, (state, action) => {
            state.status = 'idle'
            state.machineMainAssemblies = action.payload
        })
        .addCase(fetchMainAssemblByMachine.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch main assembly'
        })

        .addCase(createSectionAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(createSectionAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.createMessage = action.payload
        })
        .addCase(createSectionAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to create section assembly'
        })

        .addCase(fetchMainAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchMainAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.mainAssemblies = action.payload
        })
        .addCase(fetchMainAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch main assembly'
        })

        .addCase(fetchSectionAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSectionAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.sectionAssemblies = action.payload
        })
        .addCase(fetchSectionAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch section assembly'
        })

        .addCase(fetchMainAssemblyDetail.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchMainAssemblyDetail.fulfilled, (state, action) => {
            state.status = 'idle'
            state.mainAssemblyDetail = action.payload
        })
        .addCase(fetchMainAssemblyDetail.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch main assembly'
        })
        
        .addCase(fetchSectionAssemblyDetail.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSectionAssemblyDetail.fulfilled, (state, action) => {
            state.status = 'idle'
            state.sectionAssemblyDetail = action.payload
        })
        .addCase(fetchSectionAssemblyDetail.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to fetch main assembly'
        })

        .addCase(updateAssembly.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(updateAssembly.fulfilled, (state, action) => {
            state.status = 'idle'
            state.createMessage = action.payload
        })
        .addCase(updateAssembly.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to update assembly'
        })

        .addCase(removeAttachment.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(removeAttachment.fulfilled, (state, action) => {
            state.status = 'idle'
            state.message = action.payload
        })
        .addCase(removeAttachment.rejected, (state, action) => {
            state.status = 'error'
            state.error = action.error.message || 'Unable to remove attachment'
        })
    }
})

export default assemblySlice.reducer;