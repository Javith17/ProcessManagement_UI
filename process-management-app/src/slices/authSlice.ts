import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

type SignIn = {
    emp_code: string;
    password: string;
}

type AuthApiState = {
    userDetail?: any | null,
    status: 'idle' | 'failed' | 'loading',
    error: string | null,
    productionPart: any;
    acceptStatus: any
}

const initialState: AuthApiState = {
    userDetail: localStorage.getItem("userDetail")
    ? JSON.parse(localStorage.getItem("userDetail") as string) : null,
    status: 'idle',
    error: null,
    productionPart: {},
    acceptStatus: ''
}

export const login = createAsyncThunk("login", async (data: SignIn) => {
    const response = await axiosInstance.post("auth/signIn", data);
    const resData = response.data

    localStorage.setItem("userDetail", JSON.stringify(resData))
    return resData
})

export const productionPartDetail = createAsyncThunk("productionPartDetail", async (data: any) => {
    const response = await axiosInstance.get(`auth/productionPartDetail/${data.id}`);
    const resData = response.data
    
    return resData
})

export const vendorAcceptStatus = createAsyncThunk("vendorAcceptStatus", async (data: any) => {
    const response = await axiosInstance.post(`auth/vendorAcceptStatus`, data);
    const resData = response.data
    
    return resData
})

export const logout = createAsyncThunk("logout", async () => {
    return ""
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state)=>{
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'idle';
                state.userDetail = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Login failed'
            })

            
            .addCase(productionPartDetail.pending, (state)=>{
                state.status = 'loading';
                state.error = null;
            })
            .addCase(productionPartDetail.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'idle';
                state.productionPart = action.payload
            })
            .addCase(productionPartDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Unable to fetch part details'
            })

            .addCase(vendorAcceptStatus.pending, (state)=>{
                state.status = 'loading';
                state.error = null;
            })
            .addCase(vendorAcceptStatus.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'idle';
                state.acceptStatus = action.payload
            })
            .addCase(vendorAcceptStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Unable to accept/reject order'
            })

            .addCase(logout.pending, (state)=>{
                state.status = 'loading';
                state.error = null;
            })
            .addCase(logout.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'idle';
                state.userDetail = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Logout failed'
            })
    }
})

export default authSlice.reducer;