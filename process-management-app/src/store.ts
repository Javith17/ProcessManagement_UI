import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import adminReducer from './slices/adminSlice'
import machineReducer from './slices/machineSlice'
import quotationReducer from './slices/quotationSlice'
import assemblyReducer from './slices/assemblySlice'
import dashboardReducer from './slices/dashboardSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        machine: machineReducer,
        quotation: quotationReducer,
        assembly: assemblyReducer,
        dashboard: dashboardReducer
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

