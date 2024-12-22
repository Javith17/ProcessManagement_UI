
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
export const StoreRole = '0c765fc1-d89f-48d4-9ddb-94d7f43a4211';
export const EngineerRole = 'cc499a6a-4ced-4788-9684-285f19b1dd07';
export const AdminRole = '528a1a9f-4fd0-439e-bfe0-aaa42b5db5b3';