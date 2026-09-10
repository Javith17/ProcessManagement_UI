import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux-hooks";

// Same auth check as layouts/ProtectedLayout.tsx, redirecting to /v2/login
// instead of /login so the v2 area stays self-contained on auth transitions.
const V2ProtectedLayout = () => {
    const userDetail = useAppSelector((state) => state.auth.userDetail)

    if(!userDetail){
        return <Navigate replace to={"/v2/login"} />
    }

    return(
        <>
            <Outlet />
        </>
    )
}

export default V2ProtectedLayout;
