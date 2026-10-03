
export const getPermission= () => {
    return localStorage.getItem('userDetail') ? JSON.parse(localStorage.getItem('userDetail')||"")?.user?.screens : ""
}

export const getPermissionScreens= () => {
    return localStorage.getItem('userDetail') ? JSON.parse(localStorage.getItem('userDetail')||"")?.user?.screens?.map((sc:any)=> sc.screen) : ""
}

export const getRole= () => {
    return  localStorage.getItem('userDetail') ? JSON.parse(localStorage.getItem('userDetail')||"")?.user?.roleId : ""
}

export const SuperAdminRole = '9cf85834-0841-4c25-adf8-b4d2e077ec4b';
export const StoreRole = '5fed0eeb-8be6-442f-a56a-75adefde6b86';
export const EngineerRole = '6a20602b-ccea-4e5e-8173-3b473062d9d6';
export const AdminRole = 'fb83df27-6b1e-418d-920d-a3246eaa8b75';
export const FollowupRole = '36556546-aa70-472c-9ba9-19a0693a1176';