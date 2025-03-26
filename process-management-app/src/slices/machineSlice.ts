import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosInstance from "../api/axiosInstance";

export const fetchPartsList = createAsyncThunk("partsList", async (data?: { searchText?:String, limit?: number, page?: number }) => {
    const response = await axiosInstance.get('machine/partsList', {
        params: {
            search: data?.searchText,
            limit: data?.limit,
            page: data?.page
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchPartsListByMachine = createAsyncThunk("partsListByMachine", async (data:any) => {
    const response = await axiosInstance.post('machine/partsListByMachine', data, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchBoughtOutList = createAsyncThunk("fetchBoughtOutList", async (data?: {searchText?:string, type?:string, type_id?:string}) => {
    const response = await axiosInstance.get('machine/boughtOutList', {
        params: {
            search: data?.searchText,
            type: data?.type,
            type_id: data?.type_id
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const fetchBOListByMachine = createAsyncThunk("boListByMachine", async (data:any) => {
    const response = await axiosInstance.post('machine/boughtOutListByMachine', data, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const createPart = createAsyncThunk("createPart", async (data:any) => {
    const response = await axiosInstance.post('machine/createPart', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const createBoughtout = createAsyncThunk("createBoughtout", async (data:any) => {
    const response = await axiosInstance.post('machine/createBoughtOut', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const fetchMachineList = createAsyncThunk("fetchMachineList", async (searchText?:string) => {
    const response = await axiosInstance.get('machine/machineList', {
        params: {
            search: searchText
        },
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data.list
    return resData
})

export const createMachine = createAsyncThunk("createMachine", async (data:any) => {
    const response = await axiosInstance.post('machine/createMachine', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const createNewMachine = createAsyncThunk("createNewMachine", async (data:any) => {
    const response = await axiosInstance.post('machine/createNewMachine', data ,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data.message
    return resData
})

export const getMachineDetails = createAsyncThunk('getMachineDetails', async (data:any) => {
    const response = await axiosInstance.get(`machine/machineDetail/${data}`,{
        headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem("userDetail") as string).accessToken}
    })
    const resData = response.data
    return resData
})

export const addSubAssemblyToMachine = createAsyncThunk('addSubAssemblyToMachine', async (data:any) => {
    const response = await axiosInstance.post('machine/addSubAssemblyToMachine', data, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const createAttachment = createAsyncThunk('createAttachment' , async (data: any) => {
    const formData = new FormData()
    const file_details: any = []
    data.files.map((file: any) => {
        formData.append('files', file)
        file_details.push({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size
        })
    })
    formData.append('type_id', data.type_id)
    formData.append('type', data.type)
    formData.append('file_list', JSON.stringify(file_details))

    const response = await axiosInstance.post('machine/fileUpload', formData, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data.message
    return resData
})

export const createImage = createAsyncThunk('createImage' , async (data: any) => {
    const formData = new FormData()
    data.files.map((file: any) => {
        formData.append('files', file)
        formData.append('image_name', file.name)
    })
    formData.append('type_id', data.type_id)
    formData.append('type', data.type)

    const response = await axiosInstance.post('machine/imageUpload', formData, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data.message
    return resData
})

export const fetchPartDetail = createAsyncThunk("fetchPartDetail", async (data:any) => {
    const response = await axiosInstance.get(`machine/parts/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const updatePart = createAsyncThunk('updatePart', async (data:any) => {
    const response = await axiosInstance.post('machine/updatePart', data, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchBoughtoutDetail = createAsyncThunk("fetchBoughtoutDetail", async (data:any) => {
    const response = await axiosInstance.get(`machine/boughtouts/${data}`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const updateBoughtout = createAsyncThunk('updateBoughtout', async (data:any) => {
    const response = await axiosInstance.post('machine/updateBoughtout', data, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const updateBoughtoutS = createAsyncThunk('updateBoughtout', async (data:any) => {
    const response = await axiosInstance.post('machine/updateBoughtout', data, {
        headers: {'Authorization': `Bearer ${JSON.parse(localStorage.getItem("userDetail") as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

export const fetchVendorAttachment = createAsyncThunk("fetchVendorAttachment", async (data:any) => {
    const response = await axiosInstance.post(`machine/vendorAttachment`, data, {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail') as string).accessToken}`}
    })
    const resData = response.data
    return resData
})

type MachineApiState = {
    parts: {
        list: Array<any>,
        count: number
    };
    boughtOuts: Array<any>;
    machines: Array<any>;
    partsByMachines: {
        list: Array<any>
    },
    boughtoutByMachines: {
        list: Array<any>
    },
    vendorAttachment: {
        vendor: any,
        attachment: Array<any>
    }
    data: any | null;
    createMessage: {
        message: string,
        id?: string
    };
    partDetail: {
        part_detail: any,
        attachments: Array<any>
    };
    boughtoutDetail: {
        boughtout_detail: any,
        attachments: Array<any>
    };
    addSubAssemblyToMachineRes: any | null;
    machineStatus: 'loading' | 'idle' | 'error';
    message: string | null;
    error: string | null;
}

const initialState: MachineApiState = {
    parts: {
        list: [],
        count: 0
    },
    boughtOuts: [],
    machines: [],
    partsByMachines: {
        list: []
    },
    boughtoutByMachines: {
        list: []
    },
    vendorAttachment: {
        vendor: {},
        attachment: []
    },
    data: null,
    partDetail: {
        part_detail: {},
        attachments: []
    },
    boughtoutDetail: {
        boughtout_detail: {},
        attachments: []
    },
    createMessage: {
        message: '',
        id: ''
    },
    addSubAssemblyToMachineRes: null,
    machineStatus: 'idle',
    message: null,
    error: null
}

const machineSlice = createSlice({
    name: 'machine',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPartsList.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchPartsList.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.parts = action.payload
        })
        .addCase(fetchPartsList.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to fetch parts'
        })

        .addCase(fetchPartsListByMachine.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchPartsListByMachine.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.partsByMachines = action.payload
        })
        .addCase(fetchPartsListByMachine.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to fetch machines'
        })

        .addCase(fetchBoughtOutList.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchBoughtOutList.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.boughtOuts = action.payload
        })
        .addCase(fetchBoughtOutList.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to fetch bought outs'
        })

        .addCase(fetchBOListByMachine.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchBOListByMachine.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.boughtoutByMachines = action.payload
        })
        .addCase(fetchBOListByMachine.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to fetch machines'
        })

        .addCase(createPart.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(createPart.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.createMessage = action.payload
        })
        .addCase(createPart.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to create part'
        })

        .addCase(createBoughtout.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(createBoughtout.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.createMessage = action.payload
        })
        .addCase(createBoughtout.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to create boughtout'
        })

        .addCase(fetchMachineList.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchMachineList.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.machines = action.payload
        })
        .addCase(fetchMachineList.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to fetch machines'
        })

        .addCase(createMachine.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(createMachine.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.message = action.payload
        })
        .addCase(createMachine.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to create machine'
        })

        .addCase(createNewMachine.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(createNewMachine.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.message = action.payload
        })
        .addCase(createNewMachine.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to create new machine'
        })

        .addCase(getMachineDetails.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(getMachineDetails.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.data = action.payload
        })
        .addCase(getMachineDetails.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to check assembly name'
        })

        .addCase(addSubAssemblyToMachine.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(addSubAssemblyToMachine.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.addSubAssemblyToMachineRes = action.payload
        })
        .addCase(addSubAssemblyToMachine.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to add sub assembly to machine'
        })

        .addCase(createAttachment.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(createAttachment.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.message = action.payload
        })
        .addCase(createAttachment.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to add sub assembly to machine'
        })

        .addCase(fetchPartDetail.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchPartDetail.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.partDetail = action.payload
        })
        .addCase(fetchPartDetail.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to get part detail'
        })

        .addCase(updatePart.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(updatePart.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.createMessage = action.payload
        })
        .addCase(updatePart.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to udpate part'
        })

        .addCase(fetchBoughtoutDetail.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchBoughtoutDetail.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.boughtoutDetail = action.payload
        })
        .addCase(fetchBoughtoutDetail.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to get boughtout detail'
        })

        .addCase(updateBoughtout.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(updateBoughtout.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.createMessage = action.payload
        })
        .addCase(updateBoughtout.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to udpate boughtout'
        })

        .addCase(fetchVendorAttachment.pending, (state) => {
            state.machineStatus = 'loading'
        })
        .addCase(fetchVendorAttachment.fulfilled, (state, action) => {
            state.machineStatus = 'idle'
            state.vendorAttachment = action.payload
        })
        .addCase(fetchVendorAttachment.rejected, (state, action) => {
            state.machineStatus = 'error'
            state.error = action.error.message || 'Unable to get attachments'
        })
    }
})

export default machineSlice.reducer;